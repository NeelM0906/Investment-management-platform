import { InvestorPortalFormData, CustomMetric } from '../models/InvestorPortal';
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string[]>;
}
export declare class InvestorPortalValidator {
    static validatePortalConfiguration(data: InvestorPortalFormData): ValidationResult;
    private static validateBranding;
    private static validateWelcomeMessage;
    private static validateMetrics;
    private static validateCustomMetric;
    private static validateLoginPageAssets;
    private static isValidHexColor;
    private static isValidUrl;
    private static addError;
    static validateMetricValue(value: string | number, displayFormat: CustomMetric['displayFormat']): boolean;
    static sanitizeCustomMetricValue(value: string | number, displayFormat: CustomMetric['displayFormat']): string | number;
}
//# sourceMappingURL=investorPortalValidation.d.ts.map