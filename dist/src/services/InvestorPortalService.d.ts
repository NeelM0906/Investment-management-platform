import { InvestorPortal, InvestorPortalFormData, CustomMetric, ImageUpload, StoredImage } from '../models/InvestorPortal';
export declare class InvestorPortalService {
    private repository;
    private imageUploadService;
    constructor();
    getPortalConfiguration(): Promise<InvestorPortal>;
    updatePortalConfiguration(formData: InvestorPortalFormData): Promise<InvestorPortal>;
    uploadImage(imageUpload: ImageUpload): Promise<StoredImage>;
    updateLoginPageAssets(logoFile?: File, backgroundFile?: File, logoAltText?: string): Promise<InvestorPortal>;
    updateBranding(branding: InvestorPortal['branding'], logoFile?: File): Promise<InvestorPortal>;
    updateWelcomeMessage(welcomeMessage: InvestorPortal['welcomeMessage']): Promise<InvestorPortal>;
    updateMetrics(metrics: InvestorPortal['metrics']): Promise<InvestorPortal>;
    addCustomMetric(metric: Omit<CustomMetric, 'id'>): Promise<InvestorPortal>;
    removeCustomMetric(metricId: string): Promise<InvestorPortal>;
    publishPortal(): Promise<InvestorPortal>;
    unpublishPortal(): Promise<InvestorPortal>;
    resetPortalConfiguration(): Promise<InvestorPortal>;
    deleteImage(imageId: string): Promise<void>;
    private sanitizeFormData;
    getAvailableMetrics(): Promise<{
        id: string;
        name: string;
        description: string;
    }[]>;
}
//# sourceMappingURL=InvestorPortalService.d.ts.map