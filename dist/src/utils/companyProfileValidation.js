"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProfileValidator = void 0;
class CompanyProfileValidator {
    static validateProfileData(data) {
        const errors = [];
        if (!data.name || data.name.trim().length === 0) {
            errors.push({ field: 'name', message: 'Company name is required' });
        }
        else if (data.name.trim().length > 255) {
            errors.push({ field: 'name', message: 'Company name must be less than 255 characters' });
        }
        if (!data.email || data.email.trim().length === 0) {
            errors.push({ field: 'email', message: 'Email is required' });
        }
        else if (!this.EMAIL_REGEX.test(data.email.trim())) {
            errors.push({ field: 'email', message: 'Please enter a valid email address' });
        }
        if (!data.address || data.address.trim().length === 0) {
            errors.push({ field: 'address', message: 'Address is required' });
        }
        else if (data.address.trim().length > 500) {
            errors.push({ field: 'address', message: 'Address must be less than 500 characters' });
        }
        if (!data.city || data.city.trim().length === 0) {
            errors.push({ field: 'city', message: 'City is required' });
        }
        else if (data.city.trim().length > 100) {
            errors.push({ field: 'city', message: 'City must be less than 100 characters' });
        }
        if (!data.state || data.state.trim().length === 0) {
            errors.push({ field: 'state', message: 'State/Province is required' });
        }
        else if (data.state.trim().length > 100) {
            errors.push({ field: 'state', message: 'State/Province must be less than 100 characters' });
        }
        if (!data.country || data.country.trim().length === 0) {
            errors.push({ field: 'country', message: 'Country is required' });
        }
        else if (data.country.trim().length > 100) {
            errors.push({ field: 'country', message: 'Country must be less than 100 characters' });
        }
        if (!data.zipCode || data.zipCode.trim().length === 0) {
            errors.push({ field: 'zipCode', message: 'ZIP/Postal code is required' });
        }
        else if (!this.ZIP_CODE_REGEX.test(data.zipCode.trim())) {
            errors.push({ field: 'zipCode', message: 'Please enter a valid ZIP/Postal code' });
        }
        if (!data.phoneNumber || data.phoneNumber.trim().length === 0) {
            errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
        }
        else {
            const cleanPhone = data.phoneNumber.replace(/[\s\-\(\)\.]/g, '');
            if (!this.PHONE_REGEX.test(cleanPhone)) {
                errors.push({ field: 'phoneNumber', message: 'Please enter a valid phone number' });
            }
        }
        return errors;
    }
    static async validateAsync(data) {
        const errors = this.validateProfileData(data);
        if (errors.length > 0) {
            const errorDetails = {};
            errors.forEach(error => {
                if (!errorDetails[error.field]) {
                    errorDetails[error.field] = [];
                }
                errorDetails[error.field].push(error.message);
            });
            const error = new Error('Validation failed');
            error.code = 'VALIDATION_ERROR';
            error.details = errorDetails;
            throw error;
        }
    }
    static sanitizeProfileData(data) {
        return {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            address: data.address.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            country: data.country.trim(),
            zipCode: data.zipCode.trim().toUpperCase(),
            phoneNumber: data.phoneNumber.trim()
        };
    }
}
exports.CompanyProfileValidator = CompanyProfileValidator;
CompanyProfileValidator.EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
CompanyProfileValidator.PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
CompanyProfileValidator.ZIP_CODE_REGEX = /^[A-Za-z0-9\s\-]{3,10}$/;
//# sourceMappingURL=companyProfileValidation.js.map