import { ImageUpload, ImageValidationResult, StoredImage } from '../models/InvestorPortal';
export declare class ImageUploadService {
    private readonly uploadDir;
    private readonly allowedMimeTypes;
    private readonly maxFileSize;
    private readonly maxDimensions;
    constructor();
    private ensureUploadDirectory;
    validateImage(upload: ImageUpload): ImageValidationResult;
    saveImage(upload: ImageUpload): Promise<StoredImage>;
    deleteImage(imageId: string): Promise<void>;
    getImage(imageId: string): Promise<StoredImage | null>;
    private getFileExtension;
    private getMimeTypeFromExtension;
    private getImageDimensions;
    private formatFileSize;
}
//# sourceMappingURL=imageUpload.d.ts.map