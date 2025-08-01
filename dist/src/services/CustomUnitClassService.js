"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomUnitClassService = void 0;
const CustomUnitClassRepository_1 = require("../repositories/CustomUnitClassRepository");
const DebtEquityClass_1 = require("../models/DebtEquityClass");
class CustomUnitClassService {
    constructor(repository) {
        this.repository = repository || new CustomUnitClassRepository_1.CustomUnitClassRepository();
    }
    async createCustomClass(classData) {
        await this.validateCustomClassData(classData);
        const existingClass = await this.repository.findByName(classData.name);
        if (existingClass) {
            throw this.createValidationError(`A custom unit class with the name "${classData.name}" already exists`);
        }
        try {
            const classToCreate = DebtEquityClass_1.CustomUnitClassModel.fromFormData(classData);
            return await this.repository.create(classToCreate);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                throw this.createValidationError(error.message);
            }
            throw this.createServiceError('Failed to create custom unit class', error);
        }
    }
    async getCustomClass(id) {
        if (!id || id.trim().length === 0) {
            throw this.createValidationError('Custom class ID is required');
        }
        try {
            const customClass = await this.repository.findById(id);
            if (!customClass) {
                throw this.createNotFoundError(`Custom unit class with ID ${id} not found`);
            }
            return customClass;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw this.createServiceError('Failed to retrieve custom unit class', error);
        }
    }
    async getAllCustomClasses() {
        try {
            return await this.repository.findAll();
        }
        catch (error) {
            throw this.createServiceError('Failed to retrieve custom unit classes', error);
        }
    }
    async deleteCustomClass(id) {
        if (!id || id.trim().length === 0) {
            throw this.createValidationError('Custom class ID is required');
        }
        try {
            const deleted = await this.repository.delete(id);
            if (!deleted) {
                throw this.createNotFoundError(`Custom unit class with ID ${id} not found`);
            }
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw this.createServiceError('Failed to delete custom unit class', error);
        }
    }
    async validateCustomClassData(classData) {
        const errors = DebtEquityClass_1.CustomUnitClassModel.validate(classData);
        if (errors.length > 0) {
            throw this.createValidationError('Validation failed', { validation: errors });
        }
    }
    async searchCustomClasses(query) {
        if (!query || query.trim().length === 0) {
            return await this.getAllCustomClasses();
        }
        try {
            return await this.repository.search(query.trim());
        }
        catch (error) {
            throw this.createServiceError('Failed to search custom unit classes', error);
        }
    }
    async getCustomClassByName(name) {
        if (!name || name.trim().length === 0) {
            throw this.createValidationError('Custom class name is required');
        }
        try {
            return await this.repository.findByName(name.trim());
        }
        catch (error) {
            throw this.createServiceError('Failed to retrieve custom unit class by name', error);
        }
    }
    async isNameAvailable(name, excludeId) {
        if (!name || name.trim().length === 0) {
            return false;
        }
        try {
            return !(await this.repository.existsByName(name.trim(), excludeId));
        }
        catch (error) {
            throw this.createServiceError('Failed to check custom class name availability', error);
        }
    }
    createValidationError(message, details) {
        const error = new Error(message);
        error.code = 'VALIDATION_ERROR';
        if (details) {
            error.details = details;
        }
        return error;
    }
    createNotFoundError(message) {
        const error = new Error(message);
        error.code = 'NOT_FOUND';
        return error;
    }
    createServiceError(message, originalError) {
        const error = new Error(message);
        error.code = 'SERVICE_ERROR';
        error.originalError = originalError;
        return error;
    }
}
exports.CustomUnitClassService = CustomUnitClassService;
//# sourceMappingURL=CustomUnitClassService.js.map