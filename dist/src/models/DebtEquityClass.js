"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomUnitClassModel = exports.DebtEquityClassModel = void 0;
const uuid_1 = require("uuid");
class DebtEquityClassModel {
    static fromFormData(projectId, formData) {
        return {
            projectId,
            unitClass: formData.unitClass.trim(),
            unitPrice: formData.unitPrice,
            isOpenToInvestments: formData.isOpenToInvestments,
            investmentIncrementAmount: formData.investmentIncrementAmount,
            minInvestmentAmount: formData.minInvestmentAmount,
            maxInvestmentAmount: formData.maxInvestmentAmount
        };
    }
    static create(projectId, classData) {
        const now = new Date();
        return {
            id: (0, uuid_1.v4)(),
            ...classData,
            createdAt: now,
            updatedAt: now
        };
    }
    static update(existingClass, updateData) {
        return {
            ...existingClass,
            ...updateData,
            updatedAt: new Date()
        };
    }
    static validate(classData) {
        const errors = [];
        if (!classData.unitClass || classData.unitClass.trim().length === 0) {
            errors.push('Unit class is required');
        }
        else if (classData.unitClass.length > 100) {
            errors.push('Unit class must be less than 100 characters');
        }
        if (!classData.unitPrice || classData.unitPrice <= 0) {
            errors.push('Unit price must be greater than 0');
        }
        if (!classData.investmentIncrementAmount || classData.investmentIncrementAmount <= 0) {
            errors.push('Investment increment amount must be greater than 0');
        }
        if (!classData.minInvestmentAmount || classData.minInvestmentAmount <= 0) {
            errors.push('Minimum investment amount must be greater than 0');
        }
        if (!classData.maxInvestmentAmount || classData.maxInvestmentAmount <= 0) {
            errors.push('Maximum investment amount must be greater than 0');
        }
        if (classData.minInvestmentAmount && classData.maxInvestmentAmount) {
            if (classData.minInvestmentAmount > classData.maxInvestmentAmount) {
                errors.push('Minimum investment amount cannot be greater than maximum investment amount');
            }
        }
        if (classData.investmentIncrementAmount && classData.minInvestmentAmount) {
            if (classData.investmentIncrementAmount > classData.minInvestmentAmount) {
                errors.push('Investment increment amount cannot be greater than minimum investment amount');
            }
        }
        if (classData.investmentIncrementAmount && classData.minInvestmentAmount && classData.maxInvestmentAmount) {
            const range = classData.maxInvestmentAmount - classData.minInvestmentAmount;
            if (range > 0 && range % classData.investmentIncrementAmount !== 0) {
                errors.push('Investment increment amount must divide evenly into the investment range');
            }
        }
        return errors;
    }
    static toFormData(debtEquityClass) {
        return {
            unitClass: debtEquityClass.unitClass,
            unitPrice: debtEquityClass.unitPrice,
            isOpenToInvestments: debtEquityClass.isOpenToInvestments,
            investmentIncrementAmount: debtEquityClass.investmentIncrementAmount,
            minInvestmentAmount: debtEquityClass.minInvestmentAmount,
            maxInvestmentAmount: debtEquityClass.maxInvestmentAmount
        };
    }
}
exports.DebtEquityClassModel = DebtEquityClassModel;
class CustomUnitClassModel {
    static fromFormData(formData) {
        return {
            name: formData.name.trim()
        };
    }
    static create(classData) {
        return {
            id: (0, uuid_1.v4)(),
            ...classData,
            createdAt: new Date()
        };
    }
    static validate(classData) {
        const errors = [];
        if (!classData.name || classData.name.trim().length === 0) {
            errors.push('Custom class name is required');
        }
        else if (classData.name.length > 100) {
            errors.push('Custom class name must be less than 100 characters');
        }
        else if (classData.name.trim().length < 2) {
            errors.push('Custom class name must be at least 2 characters long');
        }
        const reservedNames = ['class a', 'class b', 'class c', 'debt', 'equity'];
        if (reservedNames.includes(classData.name.trim().toLowerCase())) {
            errors.push('This class name is reserved and cannot be used');
        }
        const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
        if (!validNamePattern.test(classData.name.trim())) {
            errors.push('Custom class name can only contain letters, numbers, spaces, hyphens, and underscores');
        }
        return errors;
    }
    static toFormData(customClass) {
        return {
            name: customClass.name
        };
    }
}
exports.CustomUnitClassModel = CustomUnitClassModel;
//# sourceMappingURL=DebtEquityClass.js.map