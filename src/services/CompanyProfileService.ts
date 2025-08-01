import { CompanyProfile, CompanyProfileFormData, ICompanyProfileService } from '../types';
import { CompanyProfileRepository } from '../repositories/CompanyProfileRepository';
import { CompanyProfileValidator } from '../utils/companyProfileValidation';

export class CompanyProfileService implements ICompanyProfileService {
  private repository: CompanyProfileRepository;

  constructor() {
    this.repository = new CompanyProfileRepository();
  }

  async createProfile(profileData: CompanyProfileFormData): Promise<CompanyProfile> {
    // Validate input data
    await this.validateProfileData(profileData);
    
    // Sanitize data
    const sanitizedData = CompanyProfileValidator.sanitizeProfileData(profileData);
    
    try {
      const profile = await this.repository.create(sanitizedData);
      return profile;
    } catch (error) {
      console.error('Error creating company profile:', error);
      throw new Error('Failed to create company profile');
    }
  }

  async getProfile(id: string): Promise<CompanyProfile> {
    if (!id || id.trim().length === 0) {
      throw new Error('Profile ID is required');
    }

    try {
      const profile = await this.repository.findById(id);
      
      if (!profile) {
        const error = new Error('Company profile not found');
        (error as any).code = 'PROFILE_NOT_FOUND';
        throw error;
      }
      
      return profile;
    } catch (error) {
      if ((error as any).code === 'PROFILE_NOT_FOUND') {
        throw error;
      }
      console.error('Error retrieving company profile:', error);
      throw new Error('Failed to retrieve company profile');
    }
  }

  async getDefaultProfile(): Promise<CompanyProfile | null> {
    try {
      return await this.repository.findFirst();
    } catch (error) {
      console.error('Error retrieving default company profile:', error);
      throw new Error('Failed to retrieve default company profile');
    }
  }

  async updateProfile(id: string, profileData: Partial<CompanyProfileFormData>): Promise<CompanyProfile> {
    if (!id || id.trim().length === 0) {
      throw new Error('Profile ID is required');
    }

    // If we have data to validate, validate it
    if (Object.keys(profileData).length > 0) {
      // For partial updates, we need to get the existing profile first to validate the complete data
      const existingProfile = await this.repository.findById(id);
      if (!existingProfile) {
        const error = new Error('Company profile not found');
        (error as any).code = 'PROFILE_NOT_FOUND';
        throw error;
      }

      // Merge existing data with updates for validation
      const completeData: CompanyProfileFormData = {
        name: profileData.name ?? existingProfile.name,
        email: profileData.email ?? existingProfile.email,
        address: profileData.address ?? existingProfile.address,
        city: profileData.city ?? existingProfile.city,
        state: profileData.state ?? existingProfile.state,
        country: profileData.country ?? existingProfile.country,
        zipCode: profileData.zipCode ?? existingProfile.zipCode,
        phoneNumber: profileData.phoneNumber ?? existingProfile.phoneNumber
      };

      await this.validateProfileData(completeData);
      
      // Sanitize only the fields being updated
      const sanitizedUpdates: Partial<CompanyProfileFormData> = {};
      Object.keys(profileData).forEach(key => {
        const typedKey = key as keyof CompanyProfileFormData;
        if (profileData[typedKey] !== undefined) {
          const fullSanitized = CompanyProfileValidator.sanitizeProfileData(completeData);
          sanitizedUpdates[typedKey] = fullSanitized[typedKey];
        }
      });

      profileData = sanitizedUpdates;
    }

    try {
      const updatedProfile = await this.repository.update(id, profileData);
      
      if (!updatedProfile) {
        const error = new Error('Company profile not found');
        (error as any).code = 'PROFILE_NOT_FOUND';
        throw error;
      }
      
      return updatedProfile;
    } catch (error) {
      if ((error as any).code === 'PROFILE_NOT_FOUND') {
        throw error;
      }
      console.error('Error updating company profile:', error);
      throw new Error('Failed to update company profile');
    }
  }

  async deleteProfile(id: string): Promise<void> {
    if (!id || id.trim().length === 0) {
      throw new Error('Profile ID is required');
    }

    try {
      const deleted = await this.repository.delete(id);
      
      if (!deleted) {
        const error = new Error('Company profile not found');
        (error as any).code = 'PROFILE_NOT_FOUND';
        throw error;
      }
    } catch (error) {
      if ((error as any).code === 'PROFILE_NOT_FOUND') {
        throw error;
      }
      console.error('Error deleting company profile:', error);
      throw new Error('Failed to delete company profile');
    }
  }

  async validateProfileData(profileData: CompanyProfileFormData): Promise<void> {
    return CompanyProfileValidator.validateAsync(profileData);
  }
}