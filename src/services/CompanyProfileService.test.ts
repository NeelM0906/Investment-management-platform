import { CompanyProfileService } from './CompanyProfileService';
import { CompanyProfileFormData } from '../types';
import fs from 'fs/promises';
import path from 'path';

describe('CompanyProfileService', () => {
  let service: CompanyProfileService;
  const testDataDir = path.join(process.cwd(), 'data');
  const testProfilesFile = path.join(testDataDir, 'company-profile.json');

  beforeEach(async () => {
    service = new CompanyProfileService();
    // Clean up test data before each test
    try {
      await fs.unlink(testProfilesFile);
    } catch {
      // File might not exist, ignore error
    }
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.unlink(testProfilesFile);
    } catch {
      // File might not exist, ignore error
    }
  });

  describe('createProfile', () => {
    it('should create a valid company profile', async () => {
      const profileData: CompanyProfileFormData = {
        name: 'Test Company Inc.',
        email: 'contact@testcompany.com',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        phoneNumber: '+1-555-123-4567'
      };

      const profile = await service.createProfile(profileData);

      expect(profile.id).toBeDefined();
      expect(profile.name).toBe('Test Company Inc.');
      expect(profile.email).toBe('contact@testcompany.com');
      expect(profile.address).toBe('123 Main Street');
      expect(profile.city).toBe('New York');
      expect(profile.state).toBe('NY');
      expect(profile.country).toBe('USA');
      expect(profile.zipCode).toBe('10001');
      expect(profile.phoneNumber).toBe('+1-555-123-4567');
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should sanitize input data', async () => {
      const profileData: CompanyProfileFormData = {
        name: '  Test Company Inc.  ',
        email: '  CONTACT@TESTCOMPANY.COM  ',
        address: '  123 Main Street  ',
        city: '  New York  ',
        state: '  ny  ',
        country: '  usa  ',
        zipCode: '  10001  ',
        phoneNumber: '  +1-555-123-4567  '
      };

      const profile = await service.createProfile(profileData);

      expect(profile.name).toBe('Test Company Inc.');
      expect(profile.email).toBe('contact@testcompany.com');
      expect(profile.zipCode).toBe('10001');
    });

    it('should throw validation error for invalid email', async () => {
      const profileData: CompanyProfileFormData = {
        name: 'Test Company Inc.',
        email: 'invalid-email',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        phoneNumber: '+1-555-123-4567'
      };

      await expect(service.createProfile(profileData)).rejects.toThrow('Validation failed');
    });

    it('should throw validation error for missing required fields', async () => {
      const profileData: CompanyProfileFormData = {
        name: '',
        email: 'contact@testcompany.com',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        phoneNumber: '+1-555-123-4567'
      };

      await expect(service.createProfile(profileData)).rejects.toThrow('Validation failed');
    });
  });

  describe('getProfile', () => {
    it('should retrieve an existing profile', async () => {
      const profileData: CompanyProfileFormData = {
        name: 'Test Company Inc.',
        email: 'contact@testcompany.com',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        phoneNumber: '+1-555-123-4567'
      };

      const createdProfile = await service.createProfile(profileData);
      const retrievedProfile = await service.getProfile(createdProfile.id);

      expect(retrievedProfile.id).toBe(createdProfile.id);
      expect(retrievedProfile.name).toBe(profileData.name);
    });

    it('should throw error for non-existent profile', async () => {
      await expect(service.getProfile('non-existent-id')).rejects.toThrow('Company profile not found');
    });

    it('should throw error for empty ID', async () => {
      await expect(service.getProfile('')).rejects.toThrow('Profile ID is required');
    });
  });

  describe('updateProfile', () => {
    it('should update an existing profile', async () => {
      const profileData: CompanyProfileFormData = {
        name: 'Test Company Inc.',
        email: 'contact@testcompany.com',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        phoneNumber: '+1-555-123-4567'
      };

      const createdProfile = await service.createProfile(profileData);
      
      const updatedProfile = await service.updateProfile(createdProfile.id, {
        name: 'Updated Company Name',
        email: 'updated@testcompany.com'
      });

      expect(updatedProfile.name).toBe('Updated Company Name');
      expect(updatedProfile.email).toBe('updated@testcompany.com');
      expect(updatedProfile.address).toBe(profileData.address); // Should remain unchanged
      expect(updatedProfile.updatedAt.getTime()).toBeGreaterThanOrEqual(createdProfile.updatedAt.getTime());
    });

    it('should throw error for non-existent profile', async () => {
      await expect(service.updateProfile('non-existent-id', { name: 'New Name' }))
        .rejects.toThrow('Company profile not found');
    });
  });

  describe('deleteProfile', () => {
    it('should delete an existing profile', async () => {
      const profileData: CompanyProfileFormData = {
        name: 'Test Company Inc.',
        email: 'contact@testcompany.com',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        phoneNumber: '+1-555-123-4567'
      };

      const createdProfile = await service.createProfile(profileData);
      
      await service.deleteProfile(createdProfile.id);
      
      await expect(service.getProfile(createdProfile.id)).rejects.toThrow('Company profile not found');
    });

    it('should throw error for non-existent profile', async () => {
      await expect(service.deleteProfile('non-existent-id')).rejects.toThrow('Company profile not found');
    });
  });

  describe('getDefaultProfile', () => {
    it('should return null when no profiles exist', async () => {
      const defaultProfile = await service.getDefaultProfile();
      expect(defaultProfile).toBeNull();
    });

    it('should return the first profile when profiles exist', async () => {
      const profileData: CompanyProfileFormData = {
        name: 'Test Company Inc.',
        email: 'contact@testcompany.com',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        phoneNumber: '+1-555-123-4567'
      };

      const createdProfile = await service.createProfile(profileData);
      const defaultProfile = await service.getDefaultProfile();

      expect(defaultProfile).not.toBeNull();
      expect(defaultProfile!.id).toBe(createdProfile.id);
    });
  });
});