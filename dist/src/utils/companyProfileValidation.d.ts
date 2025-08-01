import { CompanyProfileFormData } from '../types';
export interface ValidationError {
    field: string;
    message: string;
}
export declare class CompanyProfileValidator {
    private static EMAIL_REGEX;
    private static PHONE_REGEX;
    private static ZIP_CODE_REGEX;
    static validateProfileData(data: CompanyProfileFormData): ValidationError[];
    static validateAsync(data: CompanyProfileFormData): Promise<void>;
    static sanitizeProfileData(data: CompanyProfileFormData): CompanyProfileFormData;
}
//# sourceMappingURL=companyProfileValidation.d.ts.map