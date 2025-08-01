export interface InvestorPortal {
    id: string;
    loginPageAssets: {
        logoUrl?: string;
        backgroundImageUrl?: string;
        logoAltText?: string;
    };
    branding: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamily: string;
        logoUrl?: string;
    };
    welcomeMessage: {
        title: string;
        content: string;
        showOnDashboard: boolean;
    };
    metrics: {
        selectedMetrics: string[];
        customMetrics: CustomMetric[];
        displayOrder: string[];
    };
    isPublished: boolean;
    portalUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CustomMetric {
    id: string;
    name: string;
    value: string | number;
    unit?: string;
    description?: string;
    displayFormat: 'number' | 'currency' | 'percentage' | 'text';
}
export interface InvestorPortalFormData {
    loginPageAssets: {
        logoUrl?: string;
        backgroundImageUrl?: string;
        logoAltText?: string;
    };
    branding: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamily: string;
        logoUrl?: string;
    };
    welcomeMessage: {
        title: string;
        content: string;
        showOnDashboard: boolean;
    };
    metrics: {
        selectedMetrics: string[];
        customMetrics: CustomMetric[];
        displayOrder: string[];
    };
}
export interface ImageUpload {
    file: File;
    type: 'logo' | 'background';
    maxWidth?: number;
    maxHeight?: number;
    maxSizeBytes?: number;
}
export interface ImageValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
export interface StoredImage {
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
    uploadedAt: Date;
}
//# sourceMappingURL=InvestorPortal.d.ts.map