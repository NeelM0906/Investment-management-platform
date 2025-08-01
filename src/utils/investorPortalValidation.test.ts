import { InvestorPortalValidator } from './investorPortalValidation';
import { InvestorPortalFormData, CustomMetric } from '../models/InvestorPortal';

describe('InvestorPortalValidator', () => {
  describe('validatePortalConfiguration', () => {
    it('should validate valid portal configuration', () => {
      const validData: InvestorPortalFormData = {
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

      const result = InvestorPortalValidator.validatePortalConfiguration(validData);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject invalid hex colors', () => {
      const invalidData: InvestorPortalFormData = {
        loginPageAssets: {},
        branding: {
          primaryColor: 'invalid-color',
          secondaryColor: '#gggggg',
          accentColor: '#12345',
          fontFamily: 'Arial'
        },
        welcomeMessage: {
          title: 'Title',
          content: 'Content',
          showOnDashboard: true
        },
        metrics: {
          selectedMetrics: ['totalProjects'],
          customMetrics: [],
          displayOrder: []
        }
      };

      const result = InvestorPortalValidator.validatePortalConfiguration(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors['branding.primaryColor']).toContain('Primary color must be a valid hex color');
      expect(result.errors['branding.secondaryColor']).toContain('Secondary color must be a valid hex color');
      expect(result.errors['branding.accentColor']).toContain('Accent color must be a valid hex color');
    });

    it('should reject empty welcome message fields', () => {
      const invalidData: InvestorPortalFormData = {
        loginPageAssets: {},
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#111111',
          accentColor: '#222222',
          fontFamily: 'Arial'
        },
        welcomeMessage: {
          title: '',
          content: '',
          showOnDashboard: true
        },
        metrics: {
          selectedMetrics: ['totalProjects'],
          customMetrics: [],
          displayOrder: []
        }
      };

      const result = InvestorPortalValidator.validatePortalConfiguration(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors['welcomeMessage.title']).toContain('Welcome message title is required');
      expect(result.errors['welcomeMessage.content']).toContain('Welcome message content is required');
    });

    it('should reject empty selected metrics', () => {
      const invalidData: InvestorPortalFormData = {
        loginPageAssets: {},
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#111111',
          accentColor: '#222222',
          fontFamily: 'Arial'
        },
        welcomeMessage: {
          title: 'Title',
          content: 'Content',
          showOnDashboard: true
        },
        metrics: {
          selectedMetrics: [],
          customMetrics: [],
          displayOrder: []
        }
      };

      const result = InvestorPortalValidator.validatePortalConfiguration(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors['metrics.selectedMetrics']).toContain('At least one metric must be selected');
    });

    it('should validate custom metrics', () => {
      const customMetric: CustomMetric = {
        id: 'test-metric',
        name: '',
        value: 'invalid-number',
        displayFormat: 'number'
      };

      const invalidData: InvestorPortalFormData = {
        loginPageAssets: {},
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#111111',
          accentColor: '#222222',
          fontFamily: 'Arial'
        },
        welcomeMessage: {
          title: 'Title',
          content: 'Content',
          showOnDashboard: true
        },
        metrics: {
          selectedMetrics: ['totalProjects'],
          customMetrics: [customMetric],
          displayOrder: []
        }
      };

      const result = InvestorPortalValidator.validatePortalConfiguration(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors['metrics.customMetrics[0].name']).toContain('Custom metric name is required');
    });
  });

  describe('validateMetricValue', () => {
    it('should validate number values', () => {
      expect(InvestorPortalValidator.validateMetricValue(123, 'number')).toBe(true);
      expect(InvestorPortalValidator.validateMetricValue('456', 'number')).toBe(true);
      expect(InvestorPortalValidator.validateMetricValue('invalid', 'number')).toBe(false);
    });

    it('should validate currency values', () => {
      expect(InvestorPortalValidator.validateMetricValue(100.50, 'currency')).toBe(true);
      expect(InvestorPortalValidator.validateMetricValue('200.75', 'currency')).toBe(true);
      expect(InvestorPortalValidator.validateMetricValue(-50, 'currency')).toBe(false);
    });

    it('should validate percentage values', () => {
      expect(InvestorPortalValidator.validateMetricValue(50, 'percentage')).toBe(true);
      expect(InvestorPortalValidator.validateMetricValue('75.5', 'percentage')).toBe(true);
      expect(InvestorPortalValidator.validateMetricValue(150, 'percentage')).toBe(false);
      expect(InvestorPortalValidator.validateMetricValue(-10, 'percentage')).toBe(false);
    });

    it('should validate text values', () => {
      expect(InvestorPortalValidator.validateMetricValue('Valid text', 'text')).toBe(true);
      expect(InvestorPortalValidator.validateMetricValue('a'.repeat(200), 'text')).toBe(true);
      expect(InvestorPortalValidator.validateMetricValue('a'.repeat(201), 'text')).toBe(false);
    });
  });

  describe('sanitizeCustomMetricValue', () => {
    it('should sanitize number values', () => {
      expect(InvestorPortalValidator.sanitizeCustomMetricValue('123', 'number')).toBe(123);
      expect(InvestorPortalValidator.sanitizeCustomMetricValue(456, 'number')).toBe(456);
    });

    it('should sanitize text values', () => {
      expect(InvestorPortalValidator.sanitizeCustomMetricValue('  text  ', 'text')).toBe('text');
      expect(InvestorPortalValidator.sanitizeCustomMetricValue(123, 'text')).toBe('123');
    });
  });
});