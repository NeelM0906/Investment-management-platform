import { CompanyProfile, ICompanyProfileRepository } from '../types';
import { FileStorage } from '../utils/fileStorage';
import path from 'path';

export class CompanyProfileRepository implements ICompanyProfileRepository {
  private fileStorage: FileStorage;
  private profilesFile: string;

  constructor() {
    this.fileStorage = new FileStorage();
    this.profilesFile = path.join(process.cwd(), 'data', 'company-profile.json');
  }

  async create(profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyProfile> {
    const profiles = await this.readProfiles();
    
    const newProfile: CompanyProfile = {
      ...profile,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    profiles.push(newProfile);
    await this.writeProfiles(profiles);
    
    return newProfile;
  }

  async findById(id: string): Promise<CompanyProfile | null> {
    const profiles = await this.readProfiles();
    return profiles.find(profile => profile.id === id) || null;
  }

  async findFirst(): Promise<CompanyProfile | null> {
    const profiles = await this.readProfiles();
    return profiles.length > 0 ? profiles[0] : null;
  }

  async update(id: string, profileData: Partial<Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CompanyProfile | null> {
    const profiles = await this.readProfiles();
    const profileIndex = profiles.findIndex(profile => profile.id === id);
    
    if (profileIndex === -1) {
      return null;
    }

    const updatedProfile: CompanyProfile = {
      ...profiles[profileIndex],
      ...profileData,
      updatedAt: new Date()
    };

    profiles[profileIndex] = updatedProfile;
    await this.writeProfiles(profiles);
    
    return updatedProfile;
  }

  async delete(id: string): Promise<boolean> {
    const profiles = await this.readProfiles();
    const initialLength = profiles.length;
    const filteredProfiles = profiles.filter(profile => profile.id !== id);
    
    if (filteredProfiles.length === initialLength) {
      return false;
    }

    await this.writeProfiles(filteredProfiles);
    return true;
  }

  private async readProfiles(): Promise<CompanyProfile[]> {
    try {
      await this.fileStorage.ensureDataDirectory();
      await this.ensureProfilesFile();
      
      const fs = await import('fs/promises');
      const data = await fs.readFile(this.profilesFile, 'utf-8');
      const profiles = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return profiles.map((profile: any) => ({
        ...profile,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt)
      }));
    } catch (error) {
      throw new Error(`Failed to read company profiles data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async writeProfiles(profiles: CompanyProfile[]): Promise<void> {
    try {
      await this.fileStorage.ensureDataDirectory();
      
      const fs = await import('fs/promises');
      await fs.writeFile(this.profilesFile, JSON.stringify(profiles, null, 2));
    } catch (error) {
      throw new Error(`Failed to write company profiles data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ensureProfilesFile(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      await fs.access(this.profilesFile);
    } catch {
      // File doesn't exist, create it with empty array
      await this.writeProfiles([]);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}