"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProfileModel = void 0;
class CompanyProfileModel {
    static fromFormData(formData) {
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
    static toFormData(profile) {
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
    static createDefault() {
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
exports.CompanyProfileModel = CompanyProfileModel;
//# sourceMappingURL=CompanyProfile.js.map