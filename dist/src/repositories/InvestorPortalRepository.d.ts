import { InvestorPortal, InvestorPortalFormData } from '../models/InvestorPortal';
export declare class InvestorPortalRepository {
    private readonly dataFile;
    constructor();
    private ensureDataFile;
    getPortalConfiguration(): Promise<InvestorPortal>;
    updatePortalConfiguration(formData: InvestorPortalFormData): Promise<InvestorPortal>;
    publishPortal(): Promise<InvestorPortal>;
    unpublishPortal(): Promise<InvestorPortal>;
    updateLoginPageAssets(assets: InvestorPortal['loginPageAssets']): Promise<InvestorPortal>;
    updateBranding(branding: InvestorPortal['branding']): Promise<InvestorPortal>;
    updateWelcomeMessage(welcomeMessage: InvestorPortal['welcomeMessage']): Promise<InvestorPortal>;
    updateMetrics(metrics: InvestorPortal['metrics']): Promise<InvestorPortal>;
    resetPortalConfiguration(): Promise<InvestorPortal>;
}
//# sourceMappingURL=InvestorPortalRepository.d.ts.map