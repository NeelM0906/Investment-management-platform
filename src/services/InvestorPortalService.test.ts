import { InvestorPortalService } from './InvestorPortalService';
import { InvestorPortal, CustomMetric } from '../models/InvestorPortal';
import fs from 'fs/promises';
import path from 'path';

describe('InvestorPortalService', () => {
  let service: InvestorPortalService;
  const testDataFile = path.join(process.cwd(), 'data', 'investor-portal.json');

  beforeEach(() => {
    service = new InvestorPortalService();
  });

  afterEach(async () => {
    // Clean up test data file
    try {
      await fs.unlink(testDataFile);
    } catch {
      // File might not exist, ignore error
    }
  });

  describe('getPortalConfiguration', () => {
    it('should return default portal configuration when file does not exist', async () => {
      const portal = await service.getPortalConfiguration();
      
      expect(portal).toBeDefined();
      expect(portal.id).toBeDefined();
      expect(portal.branding.primaryColor).toBe('#1f2937');
      expect(portal.welcomeMessage.title).toBe('Welcome to Our Investor Portal');
      expect(portal.isPublished).toBe(false);
    });
  });

  describe('updatePortalConfiguration', () => {
    it('should update portal configuration with valid data', async () => {
      const formData = {
        loginPageAssets: {
          logoUrl: 'https://example.com/logo.png',
          backgroundImageUrl: 'https://example.com/bg.jpg',
          logoAltText: 'Company Logo'
        },
        branding: {
          primaryColor: '#ff0000',
          secondaryColor: '#00ff00',
          accentColor: '#0000ff',
          fontFamily: 'Arial, sans-serif',
          logoUrl: 'https://example.com/brand-logo.png'
        },
        welcomeMessage: {
          title: 'Welcome Investors',
          content: 'This is our investor portal.',
          showOnDashboard: true
        },
        metrics: {
          selectedMetrics: ['totalProjects', 'totalFunding'],
          customMetrics: [],
          displayOrder: ['totalProjects', 'totalFunding']
        }
      };

      const updatedPortal = await service.updatePortalConfiguration(formData);
      
      expect(updatedPortal.branding.primaryColor).toBe('#ff0000');
      expect(updatedPortal.welcomeMessage.title).toBe('Welcome Investors');
      expect(updatedPortal.metrics.selectedMetrics).toContain('totalProjects');
    });

    it('should throw error for invalid color values', async () => {
      const formData = {
        loginPageAssets: {},
        branding: {
          primaryColor: 'invalid-color',
          secondaryColor: '#00ff00',
          accentColor: '#0000ff',
          fontFamily: 'Arial, sans-serif'
        },
        welcomeMessage: {
          title: 'Welcome',
          content: 'Content',
          showOnDashboard: true
        },
        metrics: {
          selectedMetrics: ['totalProjects'],
          customMetrics: [],
          displayOrder: ['totalProjects']
        }
      };

      await expect(service.updatePortalConfiguration(formData)).rejects.toThrow('Validation failed');
    });
  });

  describe('updateWelcomeMessage', () => {
    it('should update welcome message with valid data', async () => {
      const welcomeMessage = {
        title: 'New Welcome Title',
        content: 'New welcome content for investors.',
        showOnDashboard: false
      };

      const updatedPortal = await service.updateWelcomeMessage(welcomeMessage);
      
      expect(updatedPortal.welcomeMessage.title).toBe('New Welcome Title');
      expect(updatedPortal.welcomeMessage.content).toBe('New welcome content for investors.');
      expect(updatedPortal.welcomeMessage.showOnDashboard).toBe(false);
    });

    it('should throw error for empty title', async () => {
      const welcomeMessage = {
        title: '',
        content: 'Content',
        showOnDashboard: true
      };

      await expect(service.updateWelcomeMessage(welcomeMessage)).rejects.toThrow('Welcome message validation failed');
    });
  });

  describe('addCustomMetric', () => {
    it('should add custom metric with valid data', async () => {
      const metric = {
        name: 'Custom ROI',
        value: 15.5,
        unit: '%',
        description: 'Custom return on investment metric',
        displayFormat: 'percentage' as const
      };

      const updatedPortal = await service.addCustomMetric(metric);
      
      expect(updatedPortal.metrics.customMetrics).toHaveLength(1);
      expect(updatedPortal.metrics.customMetrics[0].name).toBe('Custom ROI');
      expect(updatedPortal.metrics.customMetrics[0].value).toBe(15.5);
      expect(updatedPortal.metrics.customMetrics[0].id).toBeDefined();
    });

    it('should throw error for invalid percentage value', async () => {
      const metric = {
        name: 'Invalid Percentage',
        value: 150, // Invalid percentage > 100
        displayFormat: 'percentage' as const
      };

      await expect(service.addCustomMetric(metric)).rejects.toThrow('Invalid metric value');
    });
  });

  describe('removeCustomMetric', () => {
    it('should remove custom metric by id', async () => {
      // First add a metric
      const metric = {
        name: 'Test Metric',
        value: 100,
        displayFormat: 'number' as const
      };

      const portalWithMetric = await service.addCustomMetric(metric);
      const metricId = portalWithMetric.metrics.customMetrics[0].id;

      // Then remove it
      const updatedPortal = await service.removeCustomMetric(metricId);
      
      expect(updatedPortal.metrics.customMetrics).toHaveLength(0);
      expect(updatedPortal.metrics.displayOrder).not.toContain(metricId);
    });
  });

  describe('publishPortal', () => {
    it('should publish portal with valid configuration', async () => {
      // First ensure we have a valid configuration
      const formData = {
        loginPageAssets: {},
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#111111',
          accentColor: '#222222',
          fontFamily: 'Arial'
        },
        welcomeMessage: {
          title: 'Welcome',
          content: 'Welcome to our portal',
          showOnDashboard: true
        },
        metrics: {
          selectedMetrics: ['totalProjects'],
          customMetrics: [],
          displayOrder: ['totalProjects']
        }
      };

      await service.updatePortalConfiguration(formData);
      const publishedPortal = await service.publishPortal();
      
      expect(publishedPortal.isPublished).toBe(true);
      expect(publishedPortal.portalUrl).toBeDefined();
    });

    it('should throw error when publishing portal without welcome message', async () => {
      // Get the default portal and manually clear the welcome message
      const portal = await service.getPortalConfiguration();
      
      // Manually update the repository to have empty welcome message (bypassing validation)
      const testDataFile = path.join(process.cwd(), 'data', 'investor-portal.json');
      const invalidPortal = {
        ...portal,
        welcomeMessage: {
          title: '',
          content: '',
          showOnDashboard: true
        }
      };
      
      await fs.writeFile(testDataFile, JSON.stringify(invalidPortal, null, 2));
      
      await expect(service.publishPortal()).rejects.toThrow('Portal must have a welcome message before publishing');
    });
  });

  describe('getAvailableMetrics', () => {
    it('should return list of available predefined metrics', async () => {
      const metrics = await service.getAvailableMetrics();
      
      expect(metrics).toBeInstanceOf(Array);
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toHaveProperty('id');
      expect(metrics[0]).toHaveProperty('name');
      expect(metrics[0]).toHaveProperty('description');
    });
  });
});