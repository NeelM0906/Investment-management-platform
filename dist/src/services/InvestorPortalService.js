"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestorPortalService = void 0;
const InvestorPortalRepository_1 = require("../repositories/InvestorPortalRepository");
const imageUpload_1 = require("../utils/imageUpload");
const investorPortalValidation_1 = require("../utils/investorPortalValidation");
class InvestorPortalService {
    constructor() {
        this.repository = new InvestorPortalRepository_1.InvestorPortalRepository();
        this.imageUploadService = new imageUpload_1.ImageUploadService();
    }
    async getPortalConfiguration() {
        try {
            return await this.repository.getPortalConfiguration();
        }
        catch (error) {
            throw new Error(`Failed to retrieve portal configuration: ${error}`);
        }
    }
    async updatePortalConfiguration(formData) {
        const validation = investorPortalValidation_1.InvestorPortalValidator.validatePortalConfiguration(formData);
        if (!validation.isValid) {
            const errorMessages = Object.entries(validation.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
            throw new Error(`Validation failed: ${errorMessages}`);
        }
        const sanitizedFormData = this.sanitizeFormData(formData);
        try {
            return await this.repository.updatePortalConfiguration(sanitizedFormData);
        }
        catch (error) {
            throw new Error(`Failed to update portal configuration: ${error}`);
        }
    }
    async uploadImage(imageUpload) {
        try {
            const validation = this.imageUploadService.validateImage(imageUpload);
            if (!validation.isValid) {
                throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
            }
            const storedImage = await this.imageUploadService.saveImage(imageUpload);
            return storedImage;
        }
        catch (error) {
            throw new Error(`Failed to upload image: ${error}`);
        }
    }
    async updateLoginPageAssets(logoFile, backgroundFile, logoAltText) {
        try {
            const assets = {};
            if (logoFile) {
                const logoUpload = {
                    file: logoFile,
                    type: 'logo',
                    maxWidth: 500,
                    maxHeight: 200,
                    maxSizeBytes: 1024 * 1024
                };
                const storedLogo = await this.uploadImage(logoUpload);
                assets.logoUrl = storedLogo.url;
            }
            if (backgroundFile) {
                const backgroundUpload = {
                    file: backgroundFile,
                    type: 'background',
                    maxWidth: 1920,
                    maxHeight: 1080,
                    maxSizeBytes: 3 * 1024 * 1024
                };
                const storedBackground = await this.uploadImage(backgroundUpload);
                assets.backgroundImageUrl = storedBackground.url;
            }
            if (logoAltText !== undefined) {
                assets.logoAltText = logoAltText;
            }
            return await this.repository.updateLoginPageAssets(assets);
        }
        catch (error) {
            throw new Error(`Failed to update login page assets: ${error}`);
        }
    }
    async updateBranding(branding, logoFile) {
        try {
            if (logoFile) {
                const logoUpload = {
                    file: logoFile,
                    type: 'logo',
                    maxWidth: 500,
                    maxHeight: 200,
                    maxSizeBytes: 1024 * 1024
                };
                const storedLogo = await this.uploadImage(logoUpload);
                branding.logoUrl = storedLogo.url;
            }
            const validation = investorPortalValidation_1.InvestorPortalValidator.validatePortalConfiguration({
                branding,
                loginPageAssets: {},
                welcomeMessage: { title: '', content: '', showOnDashboard: true },
                metrics: { selectedMetrics: ['totalProjects'], customMetrics: [], displayOrder: [] }
            });
            if (!validation.isValid && validation.errors['branding.primaryColor'] ||
                validation.errors['branding.secondaryColor'] ||
                validation.errors['branding.accentColor']) {
                throw new Error('Invalid color values provided');
            }
            return await this.repository.updateBranding(branding);
        }
        catch (error) {
            throw new Error(`Failed to update branding: ${error}`);
        }
    }
    async updateWelcomeMessage(welcomeMessage) {
        try {
            const validation = investorPortalValidation_1.InvestorPortalValidator.validatePortalConfiguration({
                branding: { primaryColor: '#000000', secondaryColor: '#000000', accentColor: '#000000', fontFamily: 'Arial' },
                loginPageAssets: {},
                welcomeMessage,
                metrics: { selectedMetrics: ['totalProjects'], customMetrics: [], displayOrder: [] }
            });
            if (!validation.isValid && (validation.errors['welcomeMessage.title'] || validation.errors['welcomeMessage.content'])) {
                const errorMessages = Object.entries(validation.errors)
                    .filter(([key]) => key.startsWith('welcomeMessage'))
                    .map(([, messages]) => messages.join(', '))
                    .join('; ');
                throw new Error(`Welcome message validation failed: ${errorMessages}`);
            }
            return await this.repository.updateWelcomeMessage(welcomeMessage);
        }
        catch (error) {
            throw new Error(`Failed to update welcome message: ${error}`);
        }
    }
    async updateMetrics(metrics) {
        try {
            const validation = investorPortalValidation_1.InvestorPortalValidator.validatePortalConfiguration({
                branding: { primaryColor: '#000000', secondaryColor: '#000000', accentColor: '#000000', fontFamily: 'Arial' },
                loginPageAssets: {},
                welcomeMessage: { title: 'Title', content: 'Content', showOnDashboard: true },
                metrics
            });
            if (!validation.isValid) {
                const metricErrors = Object.entries(validation.errors)
                    .filter(([key]) => key.startsWith('metrics'))
                    .map(([, messages]) => messages.join(', '))
                    .join('; ');
                if (metricErrors) {
                    throw new Error(`Metrics validation failed: ${metricErrors}`);
                }
            }
            const sanitizedMetrics = {
                ...metrics,
                customMetrics: metrics.customMetrics.map(metric => ({
                    ...metric,
                    value: investorPortalValidation_1.InvestorPortalValidator.sanitizeCustomMetricValue(metric.value, metric.displayFormat)
                }))
            };
            return await this.repository.updateMetrics(sanitizedMetrics);
        }
        catch (error) {
            throw new Error(`Failed to update metrics: ${error}`);
        }
    }
    async addCustomMetric(metric) {
        try {
            const portal = await this.repository.getPortalConfiguration();
            const newMetric = {
                ...metric,
                id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                value: investorPortalValidation_1.InvestorPortalValidator.sanitizeCustomMetricValue(metric.value, metric.displayFormat)
            };
            if (!investorPortalValidation_1.InvestorPortalValidator.validateMetricValue(newMetric.value, newMetric.displayFormat)) {
                throw new Error(`Invalid metric value for display format ${newMetric.displayFormat}`);
            }
            const updatedMetrics = {
                ...portal.metrics,
                customMetrics: [...portal.metrics.customMetrics, newMetric],
                displayOrder: [...portal.metrics.displayOrder, newMetric.id]
            };
            return await this.repository.updateMetrics(updatedMetrics);
        }
        catch (error) {
            throw new Error(`Failed to add custom metric: ${error}`);
        }
    }
    async removeCustomMetric(metricId) {
        try {
            const portal = await this.repository.getPortalConfiguration();
            const updatedMetrics = {
                ...portal.metrics,
                customMetrics: portal.metrics.customMetrics.filter(metric => metric.id !== metricId),
                displayOrder: portal.metrics.displayOrder.filter(id => id !== metricId)
            };
            return await this.repository.updateMetrics(updatedMetrics);
        }
        catch (error) {
            throw new Error(`Failed to remove custom metric: ${error}`);
        }
    }
    async publishPortal() {
        try {
            const portal = await this.repository.getPortalConfiguration();
            if (!portal.welcomeMessage.title || !portal.welcomeMessage.content) {
                throw new Error('Portal must have a welcome message before publishing');
            }
            if (portal.metrics.selectedMetrics.length === 0 && portal.metrics.customMetrics.length === 0) {
                throw new Error('Portal must have at least one metric before publishing');
            }
            return await this.repository.publishPortal();
        }
        catch (error) {
            throw new Error(`Failed to publish portal: ${error}`);
        }
    }
    async unpublishPortal() {
        try {
            return await this.repository.unpublishPortal();
        }
        catch (error) {
            throw new Error(`Failed to unpublish portal: ${error}`);
        }
    }
    async resetPortalConfiguration() {
        try {
            return await this.repository.resetPortalConfiguration();
        }
        catch (error) {
            throw new Error(`Failed to reset portal configuration: ${error}`);
        }
    }
    async deleteImage(imageId) {
        try {
            await this.imageUploadService.deleteImage(imageId);
        }
        catch (error) {
            throw new Error(`Failed to delete image: ${error}`);
        }
    }
    sanitizeFormData(formData) {
        return {
            ...formData,
            branding: {
                ...formData.branding,
                fontFamily: formData.branding.fontFamily.trim()
            },
            welcomeMessage: {
                ...formData.welcomeMessage,
                title: formData.welcomeMessage.title.trim(),
                content: formData.welcomeMessage.content.trim()
            },
            metrics: {
                ...formData.metrics,
                customMetrics: formData.metrics.customMetrics.map(metric => ({
                    ...metric,
                    name: metric.name.trim(),
                    value: investorPortalValidation_1.InvestorPortalValidator.sanitizeCustomMetricValue(metric.value, metric.displayFormat),
                    unit: metric.unit?.trim(),
                    description: metric.description?.trim()
                }))
            }
        };
    }
    async getAvailableMetrics() {
        return [
            { id: 'totalProjects', name: 'Total Projects', description: 'Total number of investment projects' },
            { id: 'totalFunding', name: 'Total Funding', description: 'Total amount of funding raised' },
            { id: 'activeInvestors', name: 'Active Investors', description: 'Number of active investors' },
            { id: 'completedProjects', name: 'Completed Projects', description: 'Number of completed projects' },
            { id: 'averageROI', name: 'Average ROI', description: 'Average return on investment' },
            { id: 'fundingGoalProgress', name: 'Funding Goal Progress', description: 'Overall progress towards funding goals' }
        ];
    }
}
exports.InvestorPortalService = InvestorPortalService;
//# sourceMappingURL=InvestorPortalService.js.map