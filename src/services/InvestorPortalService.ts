import { InvestorPortal, InvestorPortalFormData, CustomMetric, ImageUpload, StoredImage } from '../models/InvestorPortal';
import { InvestorPortalRepository } from '../repositories/InvestorPortalRepository';
import { ImageUploadService } from '../utils/imageUpload';
import { InvestorPortalValidator } from '../utils/investorPortalValidation';

export class InvestorPortalService {
  private repository: InvestorPortalRepository;
  private imageUploadService: ImageUploadService;

  constructor() {
    this.repository = new InvestorPortalRepository();
    this.imageUploadService = new ImageUploadService();
  }

  async getPortalConfiguration(): Promise<InvestorPortal> {
    try {
      return await this.repository.getPortalConfiguration();
    } catch (error) {
      throw new Error(`Failed to retrieve portal configuration: ${error}`);
    }
  }

  async updatePortalConfiguration(formData: InvestorPortalFormData): Promise<InvestorPortal> {
    // Validate the form data
    const validation = InvestorPortalValidator.validatePortalConfiguration(formData);
    if (!validation.isValid) {
      const errorMessages = Object.entries(validation.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    // Sanitize custom metrics
    const sanitizedFormData = this.sanitizeFormData(formData);

    try {
      return await this.repository.updatePortalConfiguration(sanitizedFormData);
    } catch (error) {
      throw new Error(`Failed to update portal configuration: ${error}`);
    }
  }

  async uploadImage(imageUpload: ImageUpload): Promise<StoredImage> {
    try {
      // Validate the image
      const validation = this.imageUploadService.validateImage(imageUpload);
      if (!validation.isValid) {
        throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
      }

      // Save the image
      const storedImage = await this.imageUploadService.saveImage(imageUpload);
      
      return storedImage;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  async updateLoginPageAssets(logoFile?: File, backgroundFile?: File, logoAltText?: string): Promise<InvestorPortal> {
    try {
      const assets: InvestorPortal['loginPageAssets'] = {};

      // Upload logo if provided
      if (logoFile) {
        const logoUpload: ImageUpload = {
          file: logoFile,
          type: 'logo',
          maxWidth: 500,
          maxHeight: 200,
          maxSizeBytes: 1024 * 1024 // 1MB
        };
        const storedLogo = await this.uploadImage(logoUpload);
        assets.logoUrl = storedLogo.url;
      }

      // Upload background image if provided
      if (backgroundFile) {
        const backgroundUpload: ImageUpload = {
          file: backgroundFile,
          type: 'background',
          maxWidth: 1920,
          maxHeight: 1080,
          maxSizeBytes: 3 * 1024 * 1024 // 3MB
        };
        const storedBackground = await this.uploadImage(backgroundUpload);
        assets.backgroundImageUrl = storedBackground.url;
      }

      // Set alt text if provided
      if (logoAltText !== undefined) {
        assets.logoAltText = logoAltText;
      }

      return await this.repository.updateLoginPageAssets(assets);
    } catch (error) {
      throw new Error(`Failed to update login page assets: ${error}`);
    }
  }

  async updateBranding(branding: InvestorPortal['branding'], logoFile?: File): Promise<InvestorPortal> {
    try {
      // Upload new logo if provided
      if (logoFile) {
        const logoUpload: ImageUpload = {
          file: logoFile,
          type: 'logo',
          maxWidth: 500,
          maxHeight: 200,
          maxSizeBytes: 1024 * 1024 // 1MB
        };
        const storedLogo = await this.uploadImage(logoUpload);
        branding.logoUrl = storedLogo.url;
      }

      // Validate branding colors
      const validation = InvestorPortalValidator.validatePortalConfiguration({
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
    } catch (error) {
      throw new Error(`Failed to update branding: ${error}`);
    }
  }

  async updateWelcomeMessage(welcomeMessage: InvestorPortal['welcomeMessage']): Promise<InvestorPortal> {
    try {
      // Validate welcome message
      const validation = InvestorPortalValidator.validatePortalConfiguration({
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
    } catch (error) {
      throw new Error(`Failed to update welcome message: ${error}`);
    }
  }

  async updateMetrics(metrics: InvestorPortal['metrics']): Promise<InvestorPortal> {
    try {
      // Validate metrics
      const validation = InvestorPortalValidator.validatePortalConfiguration({
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

      // Sanitize custom metrics
      const sanitizedMetrics = {
        ...metrics,
        customMetrics: metrics.customMetrics.map(metric => ({
          ...metric,
          value: InvestorPortalValidator.sanitizeCustomMetricValue(metric.value, metric.displayFormat)
        }))
      };

      return await this.repository.updateMetrics(sanitizedMetrics);
    } catch (error) {
      throw new Error(`Failed to update metrics: ${error}`);
    }
  }

  async addCustomMetric(metric: Omit<CustomMetric, 'id'>): Promise<InvestorPortal> {
    try {
      const portal = await this.repository.getPortalConfiguration();
      
      // Generate ID for new metric
      const newMetric: CustomMetric = {
        ...metric,
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        value: InvestorPortalValidator.sanitizeCustomMetricValue(metric.value, metric.displayFormat)
      };

      // Validate the new metric
      if (!InvestorPortalValidator.validateMetricValue(newMetric.value, newMetric.displayFormat)) {
        throw new Error(`Invalid metric value for display format ${newMetric.displayFormat}`);
      }

      const updatedMetrics = {
        ...portal.metrics,
        customMetrics: [...portal.metrics.customMetrics, newMetric],
        displayOrder: [...portal.metrics.displayOrder, newMetric.id]
      };

      return await this.repository.updateMetrics(updatedMetrics);
    } catch (error) {
      throw new Error(`Failed to add custom metric: ${error}`);
    }
  }

  async removeCustomMetric(metricId: string): Promise<InvestorPortal> {
    try {
      const portal = await this.repository.getPortalConfiguration();
      
      const updatedMetrics = {
        ...portal.metrics,
        customMetrics: portal.metrics.customMetrics.filter(metric => metric.id !== metricId),
        displayOrder: portal.metrics.displayOrder.filter(id => id !== metricId)
      };

      return await this.repository.updateMetrics(updatedMetrics);
    } catch (error) {
      throw new Error(`Failed to remove custom metric: ${error}`);
    }
  }

  async publishPortal(): Promise<InvestorPortal> {
    try {
      // Validate portal configuration before publishing
      const portal = await this.repository.getPortalConfiguration();
      
      // Check if portal has minimum required configuration
      if (!portal.welcomeMessage.title || !portal.welcomeMessage.content) {
        throw new Error('Portal must have a welcome message before publishing');
      }

      if (portal.metrics.selectedMetrics.length === 0 && portal.metrics.customMetrics.length === 0) {
        throw new Error('Portal must have at least one metric before publishing');
      }

      return await this.repository.publishPortal();
    } catch (error) {
      throw new Error(`Failed to publish portal: ${error}`);
    }
  }

  async unpublishPortal(): Promise<InvestorPortal> {
    try {
      return await this.repository.unpublishPortal();
    } catch (error) {
      throw new Error(`Failed to unpublish portal: ${error}`);
    }
  }

  async resetPortalConfiguration(): Promise<InvestorPortal> {
    try {
      return await this.repository.resetPortalConfiguration();
    } catch (error) {
      throw new Error(`Failed to reset portal configuration: ${error}`);
    }
  }

  async deleteImage(imageId: string): Promise<void> {
    try {
      await this.imageUploadService.deleteImage(imageId);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  private sanitizeFormData(formData: InvestorPortalFormData): InvestorPortalFormData {
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
          value: InvestorPortalValidator.sanitizeCustomMetricValue(metric.value, metric.displayFormat),
          unit: metric.unit?.trim(),
          description: metric.description?.trim()
        }))
      }
    };
  }

  async getAvailableMetrics(): Promise<{ id: string; name: string; description: string }[]> {
    // Return predefined metrics that can be selected
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