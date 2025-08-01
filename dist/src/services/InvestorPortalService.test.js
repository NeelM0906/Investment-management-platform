"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const InvestorPortalService_1 = require("./InvestorPortalService");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
describe('InvestorPortalService', () => {
    let service;
    const testDataFile = path_1.default.join(process.cwd(), 'data', 'investor-portal.json');
    beforeEach(() => {
        service = new InvestorPortalService_1.InvestorPortalService();
    });
    afterEach(async () => {
        try {
            await promises_1.default.unlink(testDataFile);
        }
        catch {
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
                displayFormat: 'percentage'
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
                value: 150,
                displayFormat: 'percentage'
            };
            await expect(service.addCustomMetric(metric)).rejects.toThrow('Invalid metric value');
        });
    });
    describe('removeCustomMetric', () => {
        it('should remove custom metric by id', async () => {
            const metric = {
                name: 'Test Metric',
                value: 100,
                displayFormat: 'number'
            };
            const portalWithMetric = await service.addCustomMetric(metric);
            const metricId = portalWithMetric.metrics.customMetrics[0].id;
            const updatedPortal = await service.removeCustomMetric(metricId);
            expect(updatedPortal.metrics.customMetrics).toHaveLength(0);
            expect(updatedPortal.metrics.displayOrder).not.toContain(metricId);
        });
    });
    describe('publishPortal', () => {
        it('should publish portal with valid configuration', async () => {
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
            const portal = await service.getPortalConfiguration();
            const testDataFile = path_1.default.join(process.cwd(), 'data', 'investor-portal.json');
            const invalidPortal = {
                ...portal,
                welcomeMessage: {
                    title: '',
                    content: '',
                    showOnDashboard: true
                }
            };
            await promises_1.default.writeFile(testDataFile, JSON.stringify(invalidPortal, null, 2));
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
//# sourceMappingURL=InvestorPortalService.test.js.map