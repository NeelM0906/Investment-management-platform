import { v4 as uuidv4 } from 'uuid';
import { DebtEquityClass, DebtEquityClassFormData, CustomUnitClass, CustomUnitClassFormData } from '../types';

export class DebtEquityClassModel {
  static fromFormData(projectId: string, formData: DebtEquityClassFormData): Omit<DebtEquityClass, 'id' | 'createdAt' | 'updatedAt'> {
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

  static create(projectId: string, classData: Omit<DebtEquityClass, 'id' | 'createdAt' | 'updatedAt'>): DebtEquityClass {
    const now = new Date();
    return {
      id: uuidv4(),
      ...classData,
      createdAt: now,
      updatedAt: now
    };
  }

  static update(existingClass: DebtEquityClass, updateData: Partial<Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): DebtEquityClass {
    return {
      ...existingClass,
      ...updateData,
      updatedAt: new Date()
    };
  }

  static validate(classData: DebtEquityClassFormData): string[] {
    const errors: string[] = [];

    // Unit class validation
    if (!classData.unitClass || classData.unitClass.trim().length === 0) {
      errors.push('Unit class is required');
    } else if (classData.unitClass.length > 100) {
      errors.push('Unit class must be less than 100 characters');
    }

    // Unit price validation
    if (!classData.unitPrice || classData.unitPrice <= 0) {
      errors.push('Unit price must be greater than 0');
    }

    // Investment increment amount validation
    if (!classData.investmentIncrementAmount || classData.investmentIncrementAmount <= 0) {
      errors.push('Investment increment amount must be greater than 0');
    }

    // Minimum investment amount validation
    if (!classData.minInvestmentAmount || classData.minInvestmentAmount <= 0) {
      errors.push('Minimum investment amount must be greater than 0');
    }

    // Maximum investment amount validation
    if (!classData.maxInvestmentAmount || classData.maxInvestmentAmount <= 0) {
      errors.push('Maximum investment amount must be greater than 0');
    }

    // Investment amount relationship validation
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

    // Validate that increment amount divides evenly into the range
    if (classData.investmentIncrementAmount && classData.minInvestmentAmount && classData.maxInvestmentAmount) {
      const range = classData.maxInvestmentAmount - classData.minInvestmentAmount;
      if (range > 0 && range % classData.investmentIncrementAmount !== 0) {
        errors.push('Investment increment amount must divide evenly into the investment range');
      }
    }

    return errors;
  }

  static toFormData(debtEquityClass: DebtEquityClass): DebtEquityClassFormData {
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

export class CustomUnitClassModel {
  static fromFormData(formData: CustomUnitClassFormData): Omit<CustomUnitClass, 'id' | 'createdAt'> {
    return {
      name: formData.name.trim()
    };
  }

  static create(classData: Omit<CustomUnitClass, 'id' | 'createdAt'>): CustomUnitClass {
    return {
      id: uuidv4(),
      ...classData,
      createdAt: new Date()
    };
  }

  static validate(classData: CustomUnitClassFormData): string[] {
    const errors: string[] = [];

    // Name validation
    if (!classData.name || classData.name.trim().length === 0) {
      errors.push('Custom class name is required');
    } else if (classData.name.length > 100) {
      errors.push('Custom class name must be less than 100 characters');
    } else if (classData.name.trim().length < 2) {
      errors.push('Custom class name must be at least 2 characters long');
    }

    // Check for reserved names
    const reservedNames = ['class a', 'class b', 'class c', 'debt', 'equity'];
    if (reservedNames.includes(classData.name.trim().toLowerCase())) {
      errors.push('This class name is reserved and cannot be used');
    }

    // Check for special characters (allow letters, numbers, spaces, hyphens, underscores)
    const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNamePattern.test(classData.name.trim())) {
      errors.push('Custom class name can only contain letters, numbers, spaces, hyphens, and underscores');
    }

    return errors;
  }

  static toFormData(customClass: CustomUnitClass): CustomUnitClassFormData {
    return {
      name: customClass.name
    };
  }
}