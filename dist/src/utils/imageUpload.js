"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUploadService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class ImageUploadService {
    constructor() {
        this.uploadDir = path_1.default.join(process.cwd(), 'uploads', 'images');
        this.allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.maxFileSize = 5 * 1024 * 1024;
        this.maxDimensions = {
            logo: { width: 500, height: 200 },
            background: { width: 1920, height: 1080 }
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
    validateImage(upload) {
        const errors = [];
        const warnings = [];
        if (!upload.file) {
            errors.push('No file provided');
            return { isValid: false, errors };
        }
        const fileType = upload.file.type || upload.file.mimetype;
        const fileSize = upload.file.size;
        const fileName = upload.file.name || upload.file.originalname;
        if (!this.allowedMimeTypes.includes(fileType)) {
            errors.push(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
        }
        const maxSize = upload.maxSizeBytes || this.maxFileSize;
        if (fileSize > maxSize) {
            errors.push(`File size too large. Maximum size: ${this.formatFileSize(maxSize)}`);
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
        const maxDims = this.maxDimensions[upload.type];
        if (upload.maxWidth && upload.maxWidth > maxDims.width) {
            warnings.push(`Recommended maximum width for ${upload.type}: ${maxDims.width}px`);
        }
        if (upload.maxHeight && upload.maxHeight > maxDims.height) {
            warnings.push(`Recommended maximum height for ${upload.type}: ${maxDims.height}px`);
        }
        if (upload.type === 'logo') {
            if (fileSize > 1024 * 1024) {
                warnings.push('Logo files should ideally be under 1MB for better performance');
            }
        }
        if (upload.type === 'background') {
            if (fileSize > 3 * 1024 * 1024) {
                warnings.push('Background images should ideally be under 3MB for better performance');
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    async saveImage(upload) {
        const validation = this.validateImage(upload);
        if (!validation.isValid) {
            throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
        }
        const imageId = (0, uuid_1.v4)();
        const fileExtension = this.getFileExtension(upload.file.name || upload.file.originalname);
        const filename = `${imageId}${fileExtension}`;
        const filePath = path_1.default.join(this.uploadDir, filename);
        let buffer;
        if (upload.file.buffer) {
            buffer = upload.file.buffer;
        }
        else if (upload.file.path) {
            buffer = await promises_1.default.readFile(upload.file.path);
        }
        else {
            const arrayBuffer = await upload.file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        }
        await promises_1.default.writeFile(filePath, buffer);
        const dimensions = await this.getImageDimensions(buffer);
        const storedImage = {
            id: imageId,
            originalName: upload.file.name || upload.file.originalname,
            filename,
            path: filePath,
            url: `/uploads/images/${filename}`,
            mimeType: upload.file.type || upload.file.mimetype,
            size: upload.file.size,
            dimensions,
            uploadedAt: new Date()
        };
        return storedImage;
    }
    async deleteImage(imageId) {
        const files = await promises_1.default.readdir(this.uploadDir);
        const imageFile = files.find(file => file.startsWith(imageId));
        if (imageFile) {
            const filePath = path_1.default.join(this.uploadDir, imageFile);
            await promises_1.default.unlink(filePath);
        }
    }
    async getImage(imageId) {
        const files = await promises_1.default.readdir(this.uploadDir);
        const imageFile = files.find(file => file.startsWith(imageId));
        if (!imageFile) {
            return null;
        }
        const filePath = path_1.default.join(this.uploadDir, imageFile);
        const stats = await promises_1.default.stat(filePath);
        return {
            id: imageId,
            originalName: imageFile,
            filename: imageFile,
            path: filePath,
            url: `/uploads/images/${imageFile}`,
            mimeType: this.getMimeTypeFromExtension(imageFile),
            size: stats.size,
            dimensions: { width: 0, height: 0 },
            uploadedAt: stats.birthtime
        };
    }
    getFileExtension(filename) {
        return path_1.default.extname(filename).toLowerCase();
    }
    getMimeTypeFromExtension(filename) {
        const ext = this.getFileExtension(filename);
        const mimeMap = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        return mimeMap[ext] || 'application/octet-stream';
    }
    async getImageDimensions(_buffer) {
        return { width: 0, height: 0 };
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
exports.ImageUploadService = ImageUploadService;
//# sourceMappingURL=imageUpload.js.map