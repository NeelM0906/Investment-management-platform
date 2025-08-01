import sharp from 'sharp';
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
export declare class ImageProcessingService {
    private readonly uploadDir;
    private readonly allowedMimeTypes;
    private readonly maxFileSize;
    private readonly maxDimensions;
    constructor();
    private ensureUploadDirectory;
    validateImage(file: Express.Multer.File | File): ImageValidationResult;
    processAndSaveImage(file: Express.Multer.File | Buffer, originalName: string, options?: ImageProcessingOptions): Promise<ProcessedImage>;
    createImageVariants(file: Express.Multer.File | Buffer, originalName: string, variants: {
        name: string;
        options: ImageProcessingOptions;
    }[]): Promise<{
        [key: string]: ProcessedImage;
    }>;
    getImageMetadata(file: Express.Multer.File | Buffer): Promise<sharp.Metadata>;
    deleteImage(imageId: string): Promise<void>;
    getImagePath(imageId: string): Promise<string | null>;
    listImages(): Promise<ProcessedImage[]>;
    optimizeExistingImage(imageId: string, options?: ImageProcessingOptions): Promise<ProcessedImage>;
    private getMimeTypeFromExtension;
    private formatFileSize;
}
//# sourceMappingURL=imageProcessing.d.ts.map