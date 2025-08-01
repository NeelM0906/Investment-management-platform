"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestorPortalRepository = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class InvestorPortalRepository {
    constructor() {
        this.dataFile = path_1.default.join(process.cwd(), 'data', 'investor-portal.json');
    }
    async ensureDataFile() {
        try {
            await promises_1.default.access(this.dataFile);
        }
        catch {
            const dataDir = path_1.default.dirname(this.dataFile);
            try {
                await promises_1.default.access(dataDir);
            }
            catch {
                await promises_1.default.mkdir(dataDir, { recursive: true });
            }
            const initialPortal = {
                id: (0, uuid_1.v4)(),
                loginPageAssets: {
                    logoUrl: undefined,
                    backgroundImageUrl: undefined,
                    logoAltText: 'Company Logo'
                },
                branding: {
                    primaryColor: '#1f2937',
                    secondaryColor: '#374151',
                    accentColor: '#3b82f6',
                    fontFamily: 'Inter, sans-serif',
                    logoUrl: undefined
                },
                welcomeMessage: {
                    title: 'Welcome to Our Investor Portal',
                    content: 'Access your investment information and track project progress.',
                    showOnDashboard: true
                },
                metrics: {
                    selectedMetrics: ['totalProjects', 'totalFunding', 'activeInvestors'],
                    customMetrics: [],
                    displayOrder: ['totalProjects', 'totalFunding', 'activeInvestors']
                },
                isPublished: false,
                portalUrl: undefined,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(initialPortal, null, 2));
        }
    }
    async getPortalConfiguration() {
        try {
            await this.ensureDataFile();
            const data = await promises_1.default.readFile(this.dataFile, 'utf-8');
            const portal = JSON.parse(data);
            portal.createdAt = new Date(portal.createdAt);
            portal.updatedAt = new Date(portal.updatedAt);
            return portal;
        }
        catch (error) {
            throw new Error(`Failed to read portal configuration: ${error}`);
        }
    }
    async updatePortalConfiguration(formData) {
        try {
            const currentPortal = await this.getPortalConfiguration();
            const updatedPortal = {
                ...currentPortal,
                ...formData,
                updatedAt: new Date()
            };
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(updatedPortal, null, 2));
            return updatedPortal;
        }
        catch (error) {
            throw new Error(`Failed to update portal configuration: ${error}`);
        }
    }
    async publishPortal() {
        try {
            const portal = await this.getPortalConfiguration();
            if (!portal.portalUrl) {
                portal.portalUrl = `/portal/${portal.id}`;
            }
            portal.isPublished = true;
            portal.updatedAt = new Date();
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
            return portal;
        }
        catch (error) {
            throw new Error(`Failed to publish portal: ${error}`);
        }
    }
    async unpublishPortal() {
        try {
            const portal = await this.getPortalConfiguration();
            portal.isPublished = false;
            portal.updatedAt = new Date();
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
            return portal;
        }
        catch (error) {
            throw new Error(`Failed to unpublish portal: ${error}`);
        }
    }
    async updateLoginPageAssets(assets) {
        try {
            const portal = await this.getPortalConfiguration();
            portal.loginPageAssets = { ...portal.loginPageAssets, ...assets };
            portal.updatedAt = new Date();
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
            return portal;
        }
        catch (error) {
            throw new Error(`Failed to update login page assets: ${error}`);
        }
    }
    async updateBranding(branding) {
        try {
            const portal = await this.getPortalConfiguration();
            portal.branding = { ...portal.branding, ...branding };
            portal.updatedAt = new Date();
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
            return portal;
        }
        catch (error) {
            throw new Error(`Failed to update branding: ${error}`);
        }
    }
    async updateWelcomeMessage(welcomeMessage) {
        try {
            const portal = await this.getPortalConfiguration();
            portal.welcomeMessage = { ...portal.welcomeMessage, ...welcomeMessage };
            portal.updatedAt = new Date();
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
            return portal;
        }
        catch (error) {
            throw new Error(`Failed to update welcome message: ${error}`);
        }
    }
    async updateMetrics(metrics) {
        try {
            const portal = await this.getPortalConfiguration();
            portal.metrics = { ...portal.metrics, ...metrics };
            portal.updatedAt = new Date();
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
            return portal;
        }
        catch (error) {
            throw new Error(`Failed to update metrics: ${error}`);
        }
    }
    async resetPortalConfiguration() {
        try {
            await promises_1.default.unlink(this.dataFile);
            await this.ensureDataFile();
            return await this.getPortalConfiguration();
        }
        catch (error) {
            throw new Error(`Failed to reset portal configuration: ${error}`);
        }
    }
}
exports.InvestorPortalRepository = InvestorPortalRepository;
//# sourceMappingURL=InvestorPortalRepository.js.map