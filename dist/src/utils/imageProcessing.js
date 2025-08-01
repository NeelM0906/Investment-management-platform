"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessingService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class ImageProcessingService {
    constructor() {
        this.uploadDir = path_1.default.join(process.cwd(), 'uploads', 'images');
        this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        this.maxFileSize = 10 * 1024 * 1024;
        this.maxDimensions = {
            width: 4096,
            height: 4096
        };
        this.ensureUploadDirectory();
    }
    async ensureUploadDirectory() {
        try {
            await promises_1.default.access(this.uploadDir);
        }
        catch {
            await promises_1.default.mkdir(this.uploadDir, { recursive: true });
        }
    }
    validateImage(file) {
        const errors = [];
        const warnings = [];
        if (!file) {
            errors.push('No file provided');
            return { isValid: false, errors };
        }
        const fileType = file.mimetype || file.type;
        const fileSize = file.size;
        const fileName = file.originalname || file.name;
        if (!this.allowedMimeTypes.includes(fileType)) {
            errors.push(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
        }
        if (fileSize > this.maxFileSize) {
            errors.push(`File size too large. Maximum size: ${this.formatFileSize(this.maxFileSize)}`);
        }
        if (fileSize < 100) {
            errors.push('File is too small or corrupted');
        }
        if (!fileName || fileName.trim() === '') {
            errors.push('File must have a valid name');
        }
        if (fileName) {
            const fileNameLower = fileName.toLowerCase();
            const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
            if (dangerousExtensions.some(ext => fileNameLower.endsWith(ext))) {
                errors.push('File type not allowed for security reasons');
            }
        }
        if (fileSize > 5 * 1024 * 1024) {
            warnings.push('Large file size may affect performance. Consider optimizing the image.');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    async processAndSaveImage(file, originalName, options = {}) {
        await this.ensureUploadDirectory();
        const imageId = (0, uuid_1.v4)();
        const { maxWidth = 1920, maxHeight = 1080, quality = 85, format = 'jpeg', crop } = options;
        let buffer;
        if (Buffer.isBuffer(file)) {
            buffer = file;
        }
        else {
            buffer = file.buffer;
        }
        let sharpInstance = (0, sharp_1.default)(buffer);
        const metadata = await sharpInstance.metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image: Unable to determine dimensions');
        }
        if (crop) {
            sharpInstance = sharpInstance.extract({
                left: Math.max(0, Math.floor(crop.x)),
                top: Math.max(0, Math.floor(crop.y)),
                width: Math.min(metadata.width - crop.x, Math.floor(crop.width)),
                height: Math.min(metadata.height - crop.y, Math.floor(crop.height))
            });
        }
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
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
        const fileExtension = `.${format}`;
        const filename = `${imageId}${fileExtension}`;
        const filePath = path_1.default.join(this.uploadDir, filename);
        const processedBuffer = await sharpInstance.toBuffer();
        await promises_1.default.writeFile(filePath, processedBuffer);
        const finalMetadata = await (0, sharp_1.default)(processedBuffer).metadata();
        const processedImage = {
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
    async createImageVariants(file, originalName, variants) {
        const results = {};
        for (const variant of variants) {
            try {
                const processed = await this.processAndSaveImage(file, originalName, variant.options);
                results[variant.name] = processed;
            }
            catch (error) {
                console.error(`Failed to create variant ${variant.name}:`, error);
                throw new Error(`Failed to create image variant: ${variant.name}`);
            }
        }
        return results;
    }
    async getImageMetadata(file) {
        let buffer;
        if (Buffer.isBuffer(file)) {
            buffer = file;
        }
        else {
            buffer = file.buffer;
        }
        return await (0, sharp_1.default)(buffer).metadata();
    }
    async deleteImage(imageId) {
        try {
            const files = await promises_1.default.readdir(this.uploadDir);
            const imageFiles = files.filter(file => file.startsWith(imageId));
            for (const imageFile of imageFiles) {
                const filePath = path_1.default.join(this.uploadDir, imageFile);
                await promises_1.default.unlink(filePath);
            }
        }
        catch (error) {
            console.error('Error deleting image:', error);
            throw new Error('Failed to delete image');
        }
    }
    async getImagePath(imageId) {
        try {
            const files = await promises_1.default.readdir(this.uploadDir);
            const imageFile = files.find(file => file.startsWith(imageId));
            if (!imageFile) {
                return null;
            }
            return path_1.default.join(this.uploadDir, imageFile);
        }
        catch (error) {
            console.error('Error getting image path:', error);
            return null;
        }
    }
    async listImages() {
        try {
            await this.ensureUploadDirectory();
            const files = await promises_1.default.readdir(this.uploadDir);
            const images = [];
            for (const file of files) {
                const filePath = path_1.default.join(this.uploadDir, file);
                const stats = await promises_1.default.stat(filePath);
                const imageId = path_1.default.parse(file).name;
                const extension = path_1.default.extname(file).toLowerCase();
                let dimensions = { width: 0, height: 0 };
                try {
                    const metadata = await (0, sharp_1.default)(filePath).metadata();
                    dimensions = {
                        width: metadata.width || 0,
                        height: metadata.height || 0
                    };
                }
                catch (error) {
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
        }
        catch (error) {
            console.error('Error listing images:', error);
            throw new Error('Failed to list images');
        }
    }
    async optimizeExistingImage(imageId, options = {}) {
        const imagePath = await this.getImagePath(imageId);
        if (!imagePath) {
            throw new Error('Image not found');
        }
        const buffer = await promises_1.default.readFile(imagePath);
        const originalName = path_1.default.basename(imagePath);
        await this.deleteImage(imageId);
        return await this.processAndSaveImage(buffer, originalName, options);
    }
    getMimeTypeFromExtension(extension) {
        const mimeMap = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        return mimeMap[extension] || 'application/octet-stream';
    }
    formatFileSize(bytes) {
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
exports.ImageProcessingService = ImageProcessingService;
//# sourceMappingURL=imageProcessing.js.map