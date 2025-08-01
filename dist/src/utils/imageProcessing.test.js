"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const imageProcessing_1 = require("./imageProcessing");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
describe('ImageProcessingService', () => {
    let imageProcessingService;
    const testUploadDir = path_1.default.join(process.cwd(), 'test-uploads');
    beforeEach(() => {
        imageProcessingService = new imageProcessing_1.ImageProcessingService();
    });
    afterEach(async () => {
        try {
            const files = await promises_1.default.readdir(testUploadDir);
            for (const file of files) {
                await promises_1.default.unlink(path_1.default.join(testUploadDir, file));
            }
            await promises_1.default.rmdir(testUploadDir);
        }
        catch (error) {
        }
    });
    describe('validateImage', () => {
        it('should validate a valid JPEG file', () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                size: 1024 * 1024,
                originalname: 'test.jpg'
            };
            const result = imageProcessingService.validateImage(mockFile);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should reject invalid file type', () => {
            const mockFile = {
                mimetype: 'text/plain',
                size: 1024,
                originalname: 'test.txt'
            };
            const result = imageProcessingService.validateImage(mockFile);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('Invalid file type'))).toBe(true);
        });
        it('should reject file that is too large', () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                size: 15 * 1024 * 1024,
                originalname: 'large.jpg'
            };
            const result = imageProcessingService.validateImage(mockFile);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('File size too large'))).toBe(true);
        });
        it('should reject file that is too small', () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                size: 50,
                originalname: 'tiny.jpg'
            };
            const result = imageProcessingService.validateImage(mockFile);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('too small or corrupted'))).toBe(true);
        });
        it('should reject dangerous file extensions', () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                size: 1024,
                originalname: 'malicious.exe'
            };
            const result = imageProcessingService.validateImage(mockFile);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('security reasons'))).toBe(true);
        });
        it('should provide warnings for large files', () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                size: 6 * 1024 * 1024,
                originalname: 'large.jpg'
            };
            const result = imageProcessingService.validateImage(mockFile);
            expect(result.isValid).toBe(true);
            expect(result.warnings).toBeDefined();
            expect(result.warnings?.some(warning => warning.includes('performance'))).toBe(true);
        });
    });
    describe('processAndSaveImage', () => {
        it('should process and save a valid image', async () => {
            const testBuffer = await (0, sharp_1.default)({
                create: {
                    width: 800,
                    height: 600,
                    channels: 3,
                    background: { r: 255, g: 0, b: 0 }
                }
            })
                .jpeg()
                .toBuffer();
            const result = await imageProcessingService.processAndSaveImage(testBuffer, 'test.jpg', { maxWidth: 400, maxHeight: 300, quality: 80 });
            expect(result.id).toBeDefined();
            expect(result.originalName).toBe('test.jpg');
            expect(result.mimeType).toBe('image/jpeg');
            expect(result.dimensions.width).toBeLessThanOrEqual(400);
            expect(result.dimensions.height).toBeLessThanOrEqual(300);
            expect(result.url).toContain('/uploads/images/');
        });
        it('should apply cropping when specified', async () => {
            const testBuffer = await (0, sharp_1.default)({
                create: {
                    width: 800,
                    height: 600,
                    channels: 3,
                    background: { r: 255, g: 0, b: 0 }
                }
            })
                .jpeg()
                .toBuffer();
            const result = await imageProcessingService.processAndSaveImage(testBuffer, 'test.jpg', {
                crop: { x: 100, y: 100, width: 400, height: 300 },
                format: 'png'
            });
            expect(result.mimeType).toBe('image/png');
            expect(result.dimensions.width).toBeLessThanOrEqual(400);
            expect(result.dimensions.height).toBeLessThanOrEqual(300);
        });
        it('should convert to WebP format', async () => {
            const testBuffer = await (0, sharp_1.default)({
                create: {
                    width: 400,
                    height: 300,
                    channels: 3,
                    background: { r: 0, g: 255, b: 0 }
                }
            })
                .jpeg()
                .toBuffer();
            const result = await imageProcessingService.processAndSaveImage(testBuffer, 'test.jpg', { format: 'webp', quality: 90 });
            expect(result.mimeType).toBe('image/webp');
            expect(result.filename).toContain('.webp');
        });
    });
    describe('createImageVariants', () => {
        it('should create multiple image variants', async () => {
            const testBuffer = await (0, sharp_1.default)({
                create: {
                    width: 1200,
                    height: 800,
                    channels: 3,
                    background: { r: 0, g: 0, b: 255 }
                }
            })
                .jpeg()
                .toBuffer();
            const variants = [
                { name: 'thumbnail', options: { maxWidth: 150, maxHeight: 150 } },
                { name: 'medium', options: { maxWidth: 600, maxHeight: 400 } },
                { name: 'large', options: { maxWidth: 1200, maxHeight: 800 } }
            ];
            const results = await imageProcessingService.createImageVariants(testBuffer, 'test.jpg', variants);
            expect(Object.keys(results)).toHaveLength(3);
            expect(results.thumbnail).toBeDefined();
            expect(results.medium).toBeDefined();
            expect(results.large).toBeDefined();
            expect(results.thumbnail.dimensions.width).toBeLessThanOrEqual(150);
            expect(results.medium.dimensions.width).toBeLessThanOrEqual(600);
            expect(results.large.dimensions.width).toBeLessThanOrEqual(1200);
        });
    });
    describe('getImageMetadata', () => {
        it('should return image metadata', async () => {
            const testBuffer = await (0, sharp_1.default)({
                create: {
                    width: 800,
                    height: 600,
                    channels: 3,
                    background: { r: 128, g: 128, b: 128 }
                }
            })
                .jpeg()
                .toBuffer();
            const metadata = await imageProcessingService.getImageMetadata(testBuffer);
            expect(metadata.width).toBe(800);
            expect(metadata.height).toBe(600);
            expect(metadata.format).toBe('jpeg');
            expect(metadata.channels).toBe(3);
        });
    });
    describe('deleteImage', () => {
        it('should delete an image file', async () => {
            const testBuffer = await (0, sharp_1.default)({
                create: {
                    width: 400,
                    height: 300,
                    channels: 3,
                    background: { r: 255, g: 255, b: 255 }
                }
            })
                .jpeg()
                .toBuffer();
            const result = await imageProcessingService.processAndSaveImage(testBuffer, 'delete-test.jpg');
            const imagePath = await imageProcessingService.getImagePath(result.id);
            expect(imagePath).toBeTruthy();
            await imageProcessingService.deleteImage(result.id);
            const deletedImagePath = await imageProcessingService.getImagePath(result.id);
            expect(deletedImagePath).toBeNull();
        });
    });
    describe('listImages', () => {
        it('should list all images in upload directory', async () => {
            const testBuffer = await (0, sharp_1.default)({
                create: {
                    width: 200,
                    height: 200,
                    channels: 3,
                    background: { r: 100, g: 150, b: 200 }
                }
            })
                .jpeg()
                .toBuffer();
            await imageProcessingService.processAndSaveImage(testBuffer, 'list-test-1.jpg');
            await imageProcessingService.processAndSaveImage(testBuffer, 'list-test-2.jpg');
            await imageProcessingService.processAndSaveImage(testBuffer, 'list-test-3.jpg');
            const images = await imageProcessingService.listImages();
            expect(images.length).toBeGreaterThanOrEqual(3);
            expect(images[0]).toHaveProperty('id');
            expect(images[0]).toHaveProperty('originalName');
            expect(images[0]).toHaveProperty('dimensions');
            expect(images[0]).toHaveProperty('size');
            expect(images[0]).toHaveProperty('url');
        });
    });
    describe('optimizeExistingImage', () => {
        it('should optimize an existing image with new settings', async () => {
            const testBuffer = await (0, sharp_1.default)({
                create: {
                    width: 1000,
                    height: 800,
                    channels: 3,
                    background: { r: 255, g: 128, b: 64 }
                }
            })
                .jpeg({ quality: 100 })
                .toBuffer();
            const original = await imageProcessingService.processAndSaveImage(testBuffer, 'optimize-test.jpg', { quality: 100 });
            const optimized = await imageProcessingService.optimizeExistingImage(original.id, { maxWidth: 500, maxHeight: 400, quality: 60, format: 'webp' });
            expect(optimized.mimeType).toBe('image/webp');
            expect(optimized.dimensions.width).toBeLessThanOrEqual(500);
            expect(optimized.dimensions.height).toBeLessThanOrEqual(400);
            expect(optimized.size).toBeLessThan(original.size);
        });
    });
});
//# sourceMappingURL=imageProcessing.test.js.map