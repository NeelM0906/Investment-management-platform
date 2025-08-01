"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestorPortalValidator = void 0;
class InvestorPortalValidator {
    static validatePortalConfiguration(data) {
        const errors = {};
        this.validateBranding(data.branding, errors);
        this.validateWelcomeMessage(data.welcomeMessage, errors);
        this.validateMetrics(data.metrics, errors);
        this.validateLoginPageAssets(data.loginPageAssets, errors);
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
    static validateBranding(branding, errors) {
        if (!this.isValidHexColor(branding.primaryColor)) {
            this.addError(errors, 'branding.primaryColor', 'Primary color must be a valid hex color');
        }
        if (!this.isValidHexColor(branding.secondaryColor)) {
            this.addError(errors, 'branding.secondaryColor', 'Secondary color must be a valid hex color');
        }
        if (!this.isValidHexColor(branding.accentColor)) {
            this.addError(errors, 'branding.accentColor', 'Accent color must be a valid hex color');
        }
        if (!branding.fontFamily || branding.fontFamily.trim().length === 0) {
            this.addError(errors, 'branding.fontFamily', 'Font family is required');
        }
        else if (branding.fontFamily.length > 100) {
            this.addError(errors, 'branding.fontFamily', 'Font family must be less than 100 characters');
        }
        if (branding.logoUrl && !this.isValidUrl(branding.logoUrl)) {
            this.addError(errors, 'branding.logoUrl', 'Logo URL must be a valid URL');
        }
    }
    static validateWelcomeMessage(welcomeMessage, errors) {
        if (!welcomeMessage.title || welcomeMessage.title.trim().length === 0) {
            this.addError(errors, 'welcomeMessage.title', 'Welcome message title is required');
        }
        else if (welcomeMessage.title.length > 200) {
            this.addError(errors, 'welcomeMessage.title', 'Welcome message title must be less than 200 characters');
        }
        if (!welcomeMessage.content || welcomeMessage.content.trim().length === 0) {
            this.addError(errors, 'welcomeMessage.content', 'Welcome message content is required');
        }
        else if (welcomeMessage.content.length > 2000) {
            this.addError(errors, 'welcomeMessage.content', 'Welcome message content must be less than 2000 characters');
        }
    }
    static validateMetrics(metrics, errors) {
        if (!Array.isArray(metrics.selectedMetrics)) {
            this.addError(errors, 'metrics.selectedMetrics', 'Selected metrics must be an array');
        }
        else if (metrics.selectedMetrics.length === 0) {
            this.addError(errors, 'metrics.selectedMetrics', 'At least one metric must be selected');
        }
        if (!Array.isArray(metrics.customMetrics)) {
            this.addError(errors, 'metrics.customMetrics', 'Custom metrics must be an array');
        }
        else {
            metrics.customMetrics.forEach((metric, index) => {
                this.validateCustomMetric(metric, index, errors);
            });
        }
        if (!Array.isArray(metrics.displayOrder)) {
            this.addError(errors, 'metrics.displayOrder', 'Display order must be an array');
        }
    }
    static validateCustomMetric(metric, index, errors) {
        const prefix = `metrics.customMetrics[${index}]`;
        if (!metric.id || metric.id.trim().length === 0) {
            this.addError(errors, `${prefix}.id`, 'Custom metric ID is required');
        }
        if (!metric.name || metric.name.trim().length === 0) {
            this.addError(errors, `${prefix}.name`, 'Custom metric name is required');
        }
        else if (metric.name.length > 100) {
            this.addError(errors, `${prefix}.name`, 'Custom metric name must be less than 100 characters');
        }
        if (metric.value === undefined || metric.value === null || metric.value === '') {
            this.addError(errors, `${prefix}.value`, 'Custom metric value is required');
        }
        const validFormats = ['number', 'currency', 'percentage', 'text'];
        if (!validFormats.includes(metric.displayFormat)) {
            this.addError(errors, `${prefix}.displayFormat`, `Display format must be one of: ${validFormats.join(', ')}`);
        }
        if (metric.unit && metric.unit.length > 20) {
            this.addError(errors, `${prefix}.unit`, 'Unit must be less than 20 characters');
        }
        if (metric.description && metric.description.length > 500) {
            this.addError(errors, `${prefix}.description`, 'Description must be less than 500 characters');
        }
    }
    static validateLoginPageAssets(assets, errors) {
        if (assets.logoUrl && !this.isValidUrl(assets.logoUrl)) {
            this.addError(errors, 'loginPageAssets.logoUrl', 'Logo URL must be a valid URL');
        }
        if (assets.backgroundImageUrl && !this.isValidUrl(assets.backgroundImageUrl)) {
            this.addError(errors, 'loginPageAssets.backgroundImageUrl', 'Background image URL must be a valid URL');
        }
        if (assets.logoAltText && assets.logoAltText.length > 100) {
            this.addError(errors, 'loginPageAssets.logoAltText', 'Logo alt text must be less than 100 characters');
        }
    }
    static isValidHexColor(color) {
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexColorRegex.test(color);
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static addError(errors, field, message) {
        if (!errors[field]) {
            errors[field] = [];
        }
        errors[field].push(message);
    }
    static validateMetricValue(value, displayFormat) {
        switch (displayFormat) {
            case 'number':
                return typeof value === 'number' || !isNaN(Number(value));
            case 'currency':
                const currencyValue = typeof value === 'number' ? value : Number(value);
                return !isNaN(currencyValue) && currencyValue >= 0;
            case 'percentage':
                const numValue = typeof value === 'number' ? value : Number(value);
                return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
            case 'text':
                return typeof value === 'string' && value.length <= 200;
            default:
                return false;
        }
    }
    static sanitizeCustomMetricValue(value, displayFormat) {
        switch (displayFormat) {
            case 'number':
            case 'currency':
            case 'percentage':
                return typeof value === 'number' ? value : Number(value);
            case 'text':
                return typeof value === 'string' ? value.trim() : String(value).trim();
            default:
                return value;
        }
    }
}
exports.InvestorPortalValidator = InvestorPortalValidator;
//# sourceMappingURL=investorPortalValidation.js.map