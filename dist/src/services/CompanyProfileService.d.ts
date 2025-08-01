import { CompanyProfile, CompanyProfileFormData, ICompanyProfileService } from '../types';
export declare class CompanyProfileService implements ICompanyProfileService {
    private repository;
    constructor();
    createProfile(profileData: CompanyProfileFormData): Promise<CompanyProfile>;
    getProfile(id: string): Promise<CompanyProfile>;
    getDefaultProfile(): Promise<CompanyProfile | null>;
    updateProfile(id: string, profileData: Partial<CompanyProfileFormData>): Promise<CompanyProfile>;
    deleteProfile(id: string): Promise<void>;
    validateProfileData(profileData: CompanyProfileFormData): Promise<void>;
}
//# sourceMappingURL=CompanyProfileService.d.ts.map