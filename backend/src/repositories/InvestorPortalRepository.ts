import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { InvestorPortal, InvestorPortalFormData } from '../models/InvestorPortal';

export class InvestorPortalRepository {
  private readonly dataFile = path.join(process.cwd(), 'data', 'investor-portal.json');

  constructor() {
    // Don't call async method in constructor
  }

  private async ensureDataFile(): Promise<void> {
    try {
      await fs.access(this.dataFile);
    } catch {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.dataFile);
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }

      // Create initial empty portal configuration
      const initialPortal: InvestorPortal = {
        id: uuidv4(),
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

      await fs.writeFile(this.dataFile, JSON.stringify(initialPortal, null, 2));
    }
  }

  async getPortalConfiguration(): Promise<InvestorPortal> {
    try {
      await this.ensureDataFile();
      const data = await fs.readFile(this.dataFile, 'utf-8');
      const portal = JSON.parse(data);
      
      // Convert date strings back to Date objects
      portal.createdAt = new Date(portal.createdAt);
      portal.updatedAt = new Date(portal.updatedAt);
      
      return portal;
    } catch (error) {
      throw new Error(`Failed to read portal configuration: ${error}`);
    }
  }

  async updatePortalConfiguration(formData: InvestorPortalFormData): Promise<InvestorPortal> {
    try {
      const currentPortal = await this.getPortalConfiguration();
      
      const updatedPortal: InvestorPortal = {
        ...currentPortal,
        ...formData,
        updatedAt: new Date()
      };

      await fs.writeFile(this.dataFile, JSON.stringify(updatedPortal, null, 2));
      return updatedPortal;
    } catch (error) {
      throw new Error(`Failed to update portal configuration: ${error}`);
    }
  }

  async publishPortal(): Promise<InvestorPortal> {
    try {
      const portal = await this.getPortalConfiguration();
      
      // Generate portal URL if not exists
      if (!portal.portalUrl) {
        portal.portalUrl = `/portal/${portal.id}`;
      }
      
      portal.isPublished = true;
      portal.updatedAt = new Date();

      await fs.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
      return portal;
    } catch (error) {
      throw new Error(`Failed to publish portal: ${error}`);
    }
  }

  async unpublishPortal(): Promise<InvestorPortal> {
    try {
      const portal = await this.getPortalConfiguration();
      
      portal.isPublished = false;
      portal.updatedAt = new Date();

      await fs.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
      return portal;
    } catch (error) {
      throw new Error(`Failed to unpublish portal: ${error}`);
    }
  }

  async updateLoginPageAssets(assets: InvestorPortal['loginPageAssets']): Promise<InvestorPortal> {
    try {
      const portal = await this.getPortalConfiguration();
      
      portal.loginPageAssets = { ...portal.loginPageAssets, ...assets };
      portal.updatedAt = new Date();

      await fs.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
      return portal;
    } catch (error) {
      throw new Error(`Failed to update login page assets: ${error}`);
    }
  }

  async updateBranding(branding: InvestorPortal['branding']): Promise<InvestorPortal> {
    try {
      const portal = await this.getPortalConfiguration();
      
      portal.branding = { ...portal.branding, ...branding };
      portal.updatedAt = new Date();

      await fs.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
      return portal;
    } catch (error) {
      throw new Error(`Failed to update branding: ${error}`);
    }
  }

  async updateWelcomeMessage(welcomeMessage: InvestorPortal['welcomeMessage']): Promise<InvestorPortal> {
    try {
      const portal = await this.getPortalConfiguration();
      
      portal.welcomeMessage = { ...portal.welcomeMessage, ...welcomeMessage };
      portal.updatedAt = new Date();

      await fs.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
      return portal;
    } catch (error) {
      throw new Error(`Failed to update welcome message: ${error}`);
    }
  }

  async updateMetrics(metrics: InvestorPortal['metrics']): Promise<InvestorPortal> {
    try {
      const portal = await this.getPortalConfiguration();
      
      portal.metrics = { ...portal.metrics, ...metrics };
      portal.updatedAt = new Date();

      await fs.writeFile(this.dataFile, JSON.stringify(portal, null, 2));
      return portal;
    } catch (error) {
      throw new Error(`Failed to update metrics: ${error}`);
    }
  }

  async resetPortalConfiguration(): Promise<InvestorPortal> {
    try {
      // Delete the existing file and recreate with defaults
      await fs.unlink(this.dataFile);
      await this.ensureDataFile();
      return await this.getPortalConfiguration();
    } catch (error) {
      throw new Error(`Failed to reset portal configuration: ${error}`);
    }
  }
}