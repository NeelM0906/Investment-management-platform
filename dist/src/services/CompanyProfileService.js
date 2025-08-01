"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProfileService = void 0;
const CompanyProfileRepository_1 = require("../repositories/CompanyProfileRepository");
const companyProfileValidation_1 = require("../utils/companyProfileValidation");
class CompanyProfileService {
    constructor() {
        this.repository = new CompanyProfileRepository_1.CompanyProfileRepository();
    }
    async createProfile(profileData) {
        await this.validateProfileData(profileData);
        const sanitizedData = companyProfileValidation_1.CompanyProfileValidator.sanitizeProfileData(profileData);
        try {
            const profile = await this.repository.create(sanitizedData);
            return profile;
        }
        catch (error) {
            console.error('Error creating company profile:', error);
            throw new Error('Failed to create company profile');
        }
    }
    async getProfile(id) {
        if (!id || id.trim().length === 0) {
            throw new Error('Profile ID is required');
        }
        try {
            const profile = await this.repository.findById(id);
            if (!profile) {
                const error = new Error('Company profile not found');
                error.code = 'PROFILE_NOT_FOUND';
                throw error;
            }
            return profile;
        }
        catch (error) {
            if (error.code === 'PROFILE_NOT_FOUND') {
                throw error;
            }
            console.error('Error retrieving company profile:', error);
            throw new Error('Failed to retrieve company profile');
        }
    }
    async getDefaultProfile() {
        try {
            return await this.repository.findFirst();
        }
        catch (error) {
            console.error('Error retrieving default company profile:', error);
            throw new Error('Failed to retrieve default company profile');
        }
    }
    async updateProfile(id, profileData) {
        if (!id || id.trim().length === 0) {
            throw new Error('Profile ID is required');
        }
        if (Object.keys(profileData).length > 0) {
            const existingProfile = await this.repository.findById(id);
            if (!existingProfile) {
                const error = new Error('Company profile not found');
                error.code = 'PROFILE_NOT_FOUND';
                throw error;
            }
            const completeData = {
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
            const sanitizedUpdates = {};
            Object.keys(profileData).forEach(key => {
                const typedKey = key;
                if (profileData[typedKey] !== undefined) {
                    const fullSanitized = companyProfileValidation_1.CompanyProfileValidator.sanitizeProfileData(completeData);
                    sanitizedUpdates[typedKey] = fullSanitized[typedKey];
                }
            });
            profileData = sanitizedUpdates;
        }
        try {
            const updatedProfile = await this.repository.update(id, profileData);
            if (!updatedProfile) {
                const error = new Error('Company profile not found');
                error.code = 'PROFILE_NOT_FOUND';
                throw error;
            }
            return updatedProfile;
        }
        catch (error) {
            if (error.code === 'PROFILE_NOT_FOUND') {
                throw error;
            }
            console.error('Error updating company profile:', error);
            throw new Error('Failed to update company profile');
        }
    }
    async deleteProfile(id) {
        if (!id || id.trim().length === 0) {
            throw new Error('Profile ID is required');
        }
        try {
            const deleted = await this.repository.delete(id);
            if (!deleted) {
                const error = new Error('Company profile not found');
                error.code = 'PROFILE_NOT_FOUND';
                throw error;
            }
        }
        catch (error) {
            if (error.code === 'PROFILE_NOT_FOUND') {
                throw error;
            }
            console.error('Error deleting company profile:', error);
            throw new Error('Failed to delete company profile');
        }
    }
    async validateProfileData(profileData) {
        return companyProfileValidation_1.CompanyProfileValidator.validateAsync(profileData);
    }
}
exports.CompanyProfileService = CompanyProfileService;
//# sourceMappingURL=CompanyProfileService.js.map