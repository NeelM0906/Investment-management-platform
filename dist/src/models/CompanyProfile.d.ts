import { CompanyProfile, CompanyProfileFormData } from '../types';
export declare class CompanyProfileModel {
    static fromFormData(formData: CompanyProfileFormData): Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>;
    static toFormData(profile: CompanyProfile): CompanyProfileFormData;
    static createDefault(): CompanyProfileFormData;
}
//# sourceMappingURL=CompanyProfile.d.ts.map