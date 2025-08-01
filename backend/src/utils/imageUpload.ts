import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImageUpload, ImageValidationResult, StoredImage } from '../models/InvestorPortal';

export class ImageUploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'images');
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly maxDimensions = {
    logo: { width: 500, height: 200 },
    background: { width: 1920, height: 1080 }
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

  validateImage(upload: ImageUpload): ImageValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if file exists
    if (!upload.file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Get file properties (handle both browser File and Express multer file)
    const fileType = upload.file.type || (upload.file as any).mimetype;
    const fileSize = upload.file.size;
    const fileName = upload.file.name || (upload.file as any).originalname;

    // Check file type
    if (!this.allowedMimeTypes.includes(fileType)) {
      errors.push(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    // Check file size
    const maxSize = upload.maxSizeBytes || this.maxFileSize;
    if (fileSize > maxSize) {
      errors.push(`File size too large. Maximum size: ${this.formatFileSize(maxSize)}`);
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

    // Check dimensions recommendations
    const maxDims = this.maxDimensions[upload.type];
    if (upload.maxWidth && upload.maxWidth > maxDims.width) {
      warnings.push(`Recommended maximum width for ${upload.type}: ${maxDims.width}px`);
    }
    if (upload.maxHeight && upload.maxHeight > maxDims.height) {
      warnings.push(`Recommended maximum height for ${upload.type}: ${maxDims.height}px`);
    }

    // Type-specific validations
    if (upload.type === 'logo') {
      if (fileSize > 1024 * 1024) { // 1MB for logos
        warnings.push('Logo files should ideally be under 1MB for better performance');
      }
    }

    if (upload.type === 'background') {
      if (fileSize > 3 * 1024 * 1024) { // 3MB for backgrounds
        warnings.push('Background images should ideally be under 3MB for better performance');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  async saveImage(upload: ImageUpload): Promise<StoredImage> {
    const validation = this.validateImage(upload);
    if (!validation.isValid) {
      throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
    }

    const imageId = uuidv4();
    const fileExtension = this.getFileExtension(upload.file.name || (upload.file as any).originalname);
    const filename = `${imageId}${fileExtension}`;
    const filePath = path.join(this.uploadDir, filename);

    let buffer: Buffer;
    
    // Handle both browser File objects and Express multer files
    if ((upload.file as any).buffer) {
      // Express multer file
      buffer = (upload.file as any).buffer;
    } else if ((upload.file as any).path) {
      // Express multer disk storage file
      buffer = await fs.readFile((upload.file as any).path);
    } else {
      // Browser File object
      const arrayBuffer = await upload.file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await fs.writeFile(filePath, buffer);

    // Get image dimensions (simplified - in production, use a proper image library)
    const dimensions = await this.getImageDimensions(buffer);

    const storedImage: StoredImage = {
      id: imageId,
      originalName: upload.file.name || (upload.file as any).originalname,
      filename,
      path: filePath,
      url: `/uploads/images/${filename}`,
      mimeType: upload.file.type || (upload.file as any).mimetype,
      size: upload.file.size,
      dimensions,
      uploadedAt: new Date()
    };

    return storedImage;
  }

  async deleteImage(imageId: string): Promise<void> {
    const files = await fs.readdir(this.uploadDir);
    const imageFile = files.find(file => file.startsWith(imageId));
    
    if (imageFile) {
      const filePath = path.join(this.uploadDir, imageFile);
      await fs.unlink(filePath);
    }
  }

  async getImage(imageId: string): Promise<StoredImage | null> {
    const files = await fs.readdir(this.uploadDir);
    const imageFile = files.find(file => file.startsWith(imageId));
    
    if (!imageFile) {
      return null;
    }

    const filePath = path.join(this.uploadDir, imageFile);
    const stats = await fs.stat(filePath);
    
    // This is a simplified version - in production, store metadata in database
    return {
      id: imageId,
      originalName: imageFile,
      filename: imageFile,
      path: filePath,
      url: `/uploads/images/${imageFile}`,
      mimeType: this.getMimeTypeFromExtension(imageFile),
      size: stats.size,
      dimensions: { width: 0, height: 0 }, // Would need proper image processing
      uploadedAt: stats.birthtime
    };
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  private getMimeTypeFromExtension(filename: string): string {
    const ext = this.getFileExtension(filename);
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeMap[ext] || 'application/octet-stream';
  }

  private async getImageDimensions(_buffer: Buffer): Promise<{ width: number; height: number }> {
    // Simplified implementation - in production, use sharp or similar library
    // For now, return default dimensions
    return { width: 0, height: 0 };
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