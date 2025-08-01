import { CompanyProfile, CompanyProfileFormData } from '../types';

export class CompanyProfileModel {
  /**
   * Transform form data to company profile data
   */
  static fromFormData(formData: CompanyProfileFormData): Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      zipCode: formData.zipCode.trim().toUpperCase(),
      phoneNumber: formData.phoneNumber.trim()
    };
  }

  /**
   * Transform company profile to form data
   */
  static toFormData(profile: CompanyProfile): CompanyProfileFormData {
    return {
      name: profile.name,
      email: profile.email,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      zipCode: profile.zipCode,
      phoneNumber: profile.phoneNumber
    };
  }

  /**
   * Create a default company profile with placeholder data
   */
  static createDefault(): CompanyProfileFormData {
    return {
      name: 'Your Company Name',
      email: 'contact@yourcompany.com',
      address: '123 Business Street',
      city: 'Business City',
      state: 'State',
      country: 'Country',
      zipCode: '12345',
      phoneNumber: '+1 (555) 123-4567'
    };
  }
}