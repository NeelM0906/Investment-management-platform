import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProcessedImage {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  processedAt: Date;
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export class ImageProcessingService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'images');
  private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly maxDimensions = {
    width: 4096,
    height: 4096
  };

  constructor() {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate image file before processing
   */
  validateImage(file: Express.Multer.File | File): ImageValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if file exists
    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Get file properties - handle both Express.Multer.File and browser File
    const fileType = (file as Express.Multer.File).mimetype || (file as File).type;
    const fileSize = file.size;
    const fileName = (file as Express.Multer.File).originalname || (file as File).name;

    // Check file type
    if (!this.allowedMimeTypes.includes(fileType)) {
      errors.push(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    // Check file size
    if (fileSize > this.maxFileSize) {
      errors.push(`File size too large. Maximum size: ${this.formatFileSize(this.maxFileSize)}`);
    }

    // Check minimum file size (avoid empty files)
    if (fileSize < 100) {
      errors.push('File is too small or corrupted');
    }

    // Check file name
    if (!fileName || fileName.trim() === '') {
      errors.push('File must have a valid name');
    }

    // Check for potentially dangerous file extensions
    if (fileName) {
      const fileNameLower = fileName.toLowerCase();
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
      if (dangerousExtensions.some(ext => fileNameLower.endsWith(ext))) {
        errors.push('File type not allowed for security reasons');
      }
    }

    // Performance warnings
    if (fileSize > 5 * 1024 * 1024) { // 5MB
      warnings.push('Large file size may affect performance. Consider optimizing the image.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Process and save image with optimization
   */
  async processAndSaveImage(
    file: Express.Multer.File | Buffer,
    originalName: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    await this.ensureUploadDirectory();

    const imageId = uuidv4();
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 85,
      format = 'jpeg',
      crop
    } = options;

    // Get buffer from file
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      buffer = file.buffer;
    }

    // Create sharp instance
    let sharpInstance = sharp(buffer);

    // Get original metadata
    const metadata = await sharpInstance.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: Unable to determine dimensions');
    }

    // Apply cropping if specified
    if (crop) {
      sharpInstance = sharpInstance.extract({
        left: Math.max(0, Math.floor(crop.x)),
        top: Math.max(0, Math.floor(crop.y)),
        width: Math.min(metadata.width - crop.x, Math.floor(crop.width)),
        height: Math.min(metadata.height - crop.y, Math.floor(crop.height))
      });
    }

    // Resize if needed (maintain aspect ratio)
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Apply format and quality settings
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality,
          progressive: true,
          mozjpeg: true
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality,
          compressionLevel: 9,
          progressive: true
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality,
          effort: 6
        });
        break;
    }

    // Generate filename and path
    const fileExtension = `.${format}`;
    const filename = `${imageId}${fileExtension}`;
    const filePath = path.join(this.uploadDir, filename);

    // Process and save the image
    const processedBuffer = await sharpInstance.toBuffer();
    await fs.writeFile(filePath, processedBuffer);

    // Get final metadata
    const finalMetadata = await sharp(processedBuffer).metadata();

    const processedImage: ProcessedImage = {
      id: imageId,
      originalName,
      filename,
      path: filePath,
      url: `/uploads/images/${filename}`,
      mimeType: `image/${format}`,
      size: processedBuffer.length,
      dimensions: {
        width: finalMetadata.width || 0,
        height: finalMetadata.height || 0
      },
      processedAt: new Date()
    };

    return processedImage;
  }

  /**
   * Create multiple sizes/variants of an image
   */
  async createImageVariants(
    file: Express.Multer.File | Buffer,
    originalName: string,
    variants: { name: string; options: ImageProcessingOptions }[]
  ): Promise<{ [key: string]: ProcessedImage }> {
    const results: { [key: string]: ProcessedImage } = {};

    for (const variant of variants) {
      try {
        const processed = await this.processAndSaveImage(file, originalName, variant.options);
        results[variant.name] = processed;
      } catch (error) {
        console.error(`Failed to create variant ${variant.name}:`, error);
        throw new Error(`Failed to create image variant: ${variant.name}`);
      }
    }

    return results;
  }

  /**
   * Get image metadata without processing
   */
  async getImageMetadata(file: Express.Multer.File | Buffer): Promise<sharp.Metadata> {
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      buffer = file.buffer;
    }

    return await sharp(buffer).metadata();
  }

  /**
   * Delete image file
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadDir);
      const imageFiles = files.filter(file => file.startsWith(imageId));
      
      for (const imageFile of imageFiles) {
        const filePath = path.join(this.uploadDir, imageFile);
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Get image file path
   */
  async getImagePath(imageId: string): Promise<string | null> {
    try {
      const files = await fs.readdir(this.uploadDir);
      const imageFile = files.find(file => file.startsWith(imageId));
      
      if (!imageFile) {
        return null;
      }

      return path.join(this.uploadDir, imageFile);
    } catch (error) {
      console.error('Error getting image path:', error);
      return null;
    }
  }

  /**
   * List all images in upload directory
   */
  async listImages(): Promise<ProcessedImage[]> {
    try {
      await this.ensureUploadDirectory();
      const files = await fs.readdir(this.uploadDir);
      const images: ProcessedImage[] = [];

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = await fs.stat(filePath);
        
        // Extract image ID from filename
        const imageId = path.parse(file).name;
        const extension = path.extname(file).toLowerCase();
        
        // Get image dimensions
        let dimensions = { width: 0, height: 0 };
        try {
          const metadata = await sharp(filePath).metadata();
          dimensions = {
            width: metadata.width || 0,
            height: metadata.height || 0
          };
        } catch (error) {
          console.warn(`Could not read metadata for ${file}:`, error);
        }

        images.push({
          id: imageId,
          originalName: file,
          filename: file,
          path: filePath,
          url: `/uploads/images/${file}`,
          mimeType: this.getMimeTypeFromExtension(extension),
          size: stats.size,
          dimensions,
          processedAt: stats.birthtime
        });
      }

      return images.sort((a, b) => b.processedAt.getTime() - a.processedAt.getTime());
    } catch (error) {
      console.error('Error listing images:', error);
      throw new Error('Failed to list images');
    }
  }

  /**
   * Optimize existing image
   */
  async optimizeExistingImage(
    imageId: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    const imagePath = await this.getImagePath(imageId);
    if (!imagePath) {
      throw new Error('Image not found');
    }

    const buffer = await fs.readFile(imagePath);
    const originalName = path.basename(imagePath);
    
    // Delete old image
    await this.deleteImage(imageId);
    
    // Process with new options
    return await this.processAndSaveImage(buffer, originalName, options);
  }

  private getMimeTypeFromExtension(extension: string): string {
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeMap[extension] || 'application/octet-stream';
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}