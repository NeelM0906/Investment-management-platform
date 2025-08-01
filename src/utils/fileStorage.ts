import fs from 'fs/promises';
import path from 'path';
import { Project, CompanyProfile, DebtEquityClass, CustomUnitClass } from '../types';

export class FileStorage {
  private dataDir: string;
  private projectsFile: string;
  private companyProfilesFile: string;
  private debtEquityClassesFile: string;
  private customUnitClassesFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.projectsFile = path.join(this.dataDir, 'projects.json');
    this.companyProfilesFile = path.join(this.dataDir, 'company-profile.json');
    this.debtEquityClassesFile = path.join(this.dataDir, 'debt-equity-classes.json');
    this.customUnitClassesFile = path.join(this.dataDir, 'custom-unit-classes.json');
  }

  async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async ensureProjectsFile(): Promise<void> {
    await this.ensureDataDirectory();
    
    try {
      await fs.access(this.projectsFile);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.projectsFile, JSON.stringify([], null, 2));
    }
  }

  async readProjects(): Promise<Project[]> {
    await this.ensureProjectsFile();
    
    try {
      const data = await fs.readFile(this.projectsFile, 'utf-8');
      const projects = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return projects.map((project: any) => ({
        ...project,
        timeframe: {
          startDate: new Date(project.timeframe.startDate),
          endDate: new Date(project.timeframe.endDate)
        },
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt)
      }));
    } catch (error) {
      console.error('Error reading projects file:', error);
      throw new Error('Failed to read projects data');
    }
  }

  async writeProjects(projects: Project[]): Promise<void> {
    await this.ensureDataDirectory();
    
    try {
      // Convert Date objects to strings for JSON serialization
      const serializedProjects = projects.map(project => ({
        ...project,
        timeframe: {
          startDate: project.timeframe.startDate.toISOString(),
          endDate: project.timeframe.endDate.toISOString()
        },
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }));

      await fs.writeFile(this.projectsFile, JSON.stringify(serializedProjects, null, 2));
    } catch (error) {
      console.error('Error writing projects file:', error);
      throw new Error('Failed to write projects data');
    }
  }

  async backupProjects(): Promise<void> {
    await this.ensureProjectsFile();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.dataDir, `projects-backup-${timestamp}.json`);
    
    try {
      const data = await fs.readFile(this.projectsFile, 'utf-8');
      await fs.writeFile(backupFile, data);
      console.log(`Backup created: ${backupFile}`);
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  async getStorageStats(): Promise<{ totalProjects: number; fileSize: number; lastModified: Date }> {
    await this.ensureProjectsFile();
    
    try {
      const stats = await fs.stat(this.projectsFile);
      const projects = await this.readProjects();
      
      return {
        totalProjects: projects.length,
        fileSize: stats.size,
        lastModified: stats.mtime
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw new Error('Failed to get storage statistics');
    }
  }

  // Company Profile methods
  async ensureCompanyProfilesFile(): Promise<void> {
    await this.ensureDataDirectory();
    
    try {
      await fs.access(this.companyProfilesFile);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.companyProfilesFile, JSON.stringify([], null, 2));
    }
  }

  async readCompanyProfiles(): Promise<CompanyProfile[]> {
    await this.ensureCompanyProfilesFile();
    
    try {
      const data = await fs.readFile(this.companyProfilesFile, 'utf-8');
      const profiles = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return profiles.map((profile: any) => ({
        ...profile,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt)
      }));
    } catch (error) {
      console.error('Error reading company profiles file:', error);
      throw new Error('Failed to read company profiles data');
    }
  }

  async writeCompanyProfiles(profiles: CompanyProfile[]): Promise<void> {
    await this.ensureDataDirectory();
    
    try {
      // Convert Date objects to strings for JSON serialization
      const serializedProfiles = profiles.map(profile => ({
        ...profile,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString()
      }));

      await fs.writeFile(this.companyProfilesFile, JSON.stringify(serializedProfiles, null, 2));
    } catch (error) {
      console.error('Error writing company profiles file:', error);
      throw new Error('Failed to write company profiles data');
    }
  }

  async backupCompanyProfiles(): Promise<void> {
    await this.ensureCompanyProfilesFile();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.dataDir, `company-profiles-backup-${timestamp}.json`);
    
    try {
      const data = await fs.readFile(this.companyProfilesFile, 'utf-8');
      await fs.writeFile(backupFile, data);
      console.log(`Company profiles backup created: ${backupFile}`);
    } catch (error) {
      console.error('Error creating company profiles backup:', error);
    }
  }

  // Debt & Equity Classes methods
  async ensureDebtEquityClassesFile(): Promise<void> {
    await this.ensureDataDirectory();
    
    try {
      await fs.access(this.debtEquityClassesFile);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.debtEquityClassesFile, JSON.stringify([], null, 2));
    }
  }

  async readDebtEquityClasses(): Promise<DebtEquityClass[]> {
    await this.ensureDebtEquityClassesFile();
    
    try {
      const data = await fs.readFile(this.debtEquityClassesFile, 'utf-8');
      const classes = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return classes.map((debtEquityClass: any) => ({
        ...debtEquityClass,
        createdAt: new Date(debtEquityClass.createdAt),
        updatedAt: new Date(debtEquityClass.updatedAt)
      }));
    } catch (error) {
      console.error('Error reading debt equity classes file:', error);
      throw new Error('Failed to read debt equity classes data');
    }
  }

  async writeDebtEquityClasses(classes: DebtEquityClass[]): Promise<void> {
    await this.ensureDataDirectory();
    
    try {
      // Convert Date objects to strings for JSON serialization
      const serializedClasses = classes.map(debtEquityClass => ({
        ...debtEquityClass,
        createdAt: debtEquityClass.createdAt.toISOString(),
        updatedAt: debtEquityClass.updatedAt.toISOString()
      }));

      await fs.writeFile(this.debtEquityClassesFile, JSON.stringify(serializedClasses, null, 2));
    } catch (error) {
      console.error('Error writing debt equity classes file:', error);
      throw new Error('Failed to write debt equity classes data');
    }
  }

  async backupDebtEquityClasses(): Promise<void> {
    await this.ensureDebtEquityClassesFile();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.dataDir, `debt-equity-classes-backup-${timestamp}.json`);
    
    try {
      const data = await fs.readFile(this.debtEquityClassesFile, 'utf-8');
      await fs.writeFile(backupFile, data);
      console.log(`Debt equity classes backup created: ${backupFile}`);
    } catch (error) {
      console.error('Error creating debt equity classes backup:', error);
    }
  }

  // Custom Unit Classes methods
  async ensureCustomUnitClassesFile(): Promise<void> {
    await this.ensureDataDirectory();
    
    try {
      await fs.access(this.customUnitClassesFile);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.customUnitClassesFile, JSON.stringify([], null, 2));
    }
  }

  async readCustomUnitClasses(): Promise<CustomUnitClass[]> {
    await this.ensureCustomUnitClassesFile();
    
    try {
      const data = await fs.readFile(this.customUnitClassesFile, 'utf-8');
      const classes = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return classes.map((customClass: any) => ({
        ...customClass,
        createdAt: new Date(customClass.createdAt)
      }));
    } catch (error) {
      console.error('Error reading custom unit classes file:', error);
      throw new Error('Failed to read custom unit classes data');
    }
  }

  async writeCustomUnitClasses(classes: CustomUnitClass[]): Promise<void> {
    await this.ensureDataDirectory();
    
    try {
      // Convert Date objects to strings for JSON serialization
      const serializedClasses = classes.map(customClass => ({
        ...customClass,
        createdAt: customClass.createdAt.toISOString()
      }));

      await fs.writeFile(this.customUnitClassesFile, JSON.stringify(serializedClasses, null, 2));
    } catch (error) {
      console.error('Error writing custom unit classes file:', error);
      throw new Error('Failed to write custom unit classes data');
    }
  }

  async backupCustomUnitClasses(): Promise<void> {
    await this.ensureCustomUnitClassesFile();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.dataDir, `custom-unit-classes-backup-${timestamp}.json`);
    
    try {
      const data = await fs.readFile(this.customUnitClassesFile, 'utf-8');
      await fs.writeFile(backupFile, data);
      console.log(`Custom unit classes backup created: ${backupFile}`);
    } catch (error) {
      console.error('Error creating custom unit classes backup:', error);
    }
  }
}