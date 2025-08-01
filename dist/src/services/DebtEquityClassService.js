"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtEquityClassService = void 0;
const DebtEquityClassRepository_1 = require("../repositories/DebtEquityClassRepository");
const DebtEquityClass_1 = require("../models/DebtEquityClass");
class DebtEquityClassService {
    constructor(repository) {
        this.repository = repository || new DebtEquityClassRepository_1.DebtEquityClassRepository();
    }
    async createClass(projectId, classData) {
        await this.validateClassData(classData);
        if (!projectId || projectId.trim().length === 0) {
            throw this.createValidationError('Project ID is required');
        }
        const existingClasses = await this.repository.findByUnitClass(classData.unitClass, projectId);
        if (existingClasses.length > 0) {
            throw this.createValidationError(`A class with the name "${classData.unitClass}" already exists for this project`);
        }
        try {
            const classToCreate = DebtEquityClass_1.DebtEquityClassModel.fromFormData(projectId, classData);
            return await this.repository.create(projectId, classToCreate);
        }
        catch (error) {
            throw this.createServiceError('Failed to create debt/equity class', error);
        }
    }
    async getClass(id) {
        if (!id || id.trim().length === 0) {
            throw this.createValidationError('Class ID is required');
        }
        try {
            const debtEquityClass = await this.repository.findById(id);
            if (!debtEquityClass) {
                throw this.createNotFoundError(`Debt/equity class with ID ${id} not found`);
            }
            return debtEquityClass;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw this.createServiceError('Failed to retrieve debt/equity class', error);
        }
    }
    async getClassesByProject(projectId) {
        if (!projectId || projectId.trim().length === 0) {
            throw this.createValidationError('Project ID is required');
        }
        try {
            return await this.repository.findByProjectId(projectId);
        }
        catch (error) {
            throw this.createServiceError('Failed to retrieve debt/equity classes for project', error);
        }
    }
    async updateClass(id, classData) {
        if (!id || id.trim().length === 0) {
            throw this.createValidationError('Class ID is required');
        }
        const existingClass = await this.getClass(id);
        const fullClassData = {
            unitClass: classData.unitClass ?? existingClass.unitClass,
            unitPrice: classData.unitPrice ?? existingClass.unitPrice,
            isOpenToInvestments: classData.isOpenToInvestments ?? existingClass.isOpenToInvestments,
            investmentIncrementAmount: classData.investmentIncrementAmount ?? existingClass.investmentIncrementAmount,
            minInvestmentAmount: classData.minInvestmentAmount ?? existingClass.minInvestmentAmount,
            maxInvestmentAmount: classData.maxInvestmentAmount ?? existingClass.maxInvestmentAmount
        };
        await this.validateClassData(fullClassData);
        if (classData.unitClass && classData.unitClass !== existingClass.unitClass) {
            const existingClasses = await this.repository.findByUnitClass(classData.unitClass, existingClass.projectId);
            if (existingClasses.length > 0) {
                throw this.createValidationError(`A class with the name "${classData.unitClass}" already exists for this project`);
            }
        }
        try {
            const updatedClass = await this.repository.update(id, classData);
            if (!updatedClass) {
                throw this.createNotFoundError(`Debt/equity class with ID ${id} not found`);
            }
            return updatedClass;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw this.createServiceError('Failed to update debt/equity class', error);
        }
    }
    async deleteClass(id) {
        if (!id || id.trim().length === 0) {
            throw this.createValidationError('Class ID is required');
        }
        try {
            const deleted = await this.repository.delete(id);
            if (!deleted) {
                throw this.createNotFoundError(`Debt/equity class with ID ${id} not found`);
            }
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw this.createServiceError('Failed to delete debt/equity class', error);
        }
    }
    async validateClassData(classData) {
        const errors = DebtEquityClass_1.DebtEquityClassModel.validate(classData);
        if (errors.length > 0) {
            throw this.createValidationError('Validation failed', { validation: errors });
        }
    }
    validateInvestmentAmountRelationships(classData) {
        const errors = [];
        if (classData.minInvestmentAmount > classData.maxInvestmentAmount) {
            errors.push('Minimum investment amount cannot be greater than maximum investment amount');
        }
        if (classData.investmentIncrementAmount > classData.minInvestmentAmount) {
            errors.push('Investment increment amount cannot be greater than minimum investment amount');
        }
        const range = classData.maxInvestmentAmount - classData.minInvestmentAmount;
        if (range > 0 && range % classData.investmentIncrementAmount !== 0) {
            errors.push('Investment increment amount must divide evenly into the investment range');
        }
        return errors;
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
exports.DebtEquityClassService = DebtEquityClassService;
//# sourceMappingURL=DebtEquityClassService.js.map