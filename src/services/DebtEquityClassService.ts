import { 
  DebtEquityClass, 
  DebtEquityClassFormData, 
  IDebtEquityClassService, 
  IDebtEquityClassRepository,
  ErrorResponse 
} from '../types';
import { DebtEquityClassRepository } from '../repositories/DebtEquityClassRepository';
import { DebtEquityClassModel } from '../models/DebtEquityClass';

export class DebtEquityClassService implements IDebtEquityClassService {
  private repository: IDebtEquityClassRepository;

  constructor(repository?: IDebtEquityClassRepository) {
    this.repository = repository || new DebtEquityClassRepository();
  }

  async createClass(projectId: string, classData: DebtEquityClassFormData): Promise<DebtEquityClass> {
    // Validate input data
    await this.validateClassData(classData);
    
    // Validate project ID
    if (!projectId || projectId.trim().length === 0) {
      throw this.createValidationError('Project ID is required');
    }

    // Check for duplicate unit class names within the same project
    const existingClasses = await this.repository.findByUnitClass(classData.unitClass, projectId);
    if (existingClasses.length > 0) {
      throw this.createValidationError(`A class with the name "${classData.unitClass}" already exists for this project`);
    }

    try {
      const classToCreate = DebtEquityClassModel.fromFormData(projectId, classData);
      return await this.repository.create(projectId, classToCreate);
    } catch (error) {
      throw this.createServiceError('Failed to create debt/equity class', error);
    }
  }

  async getClass(id: string): Promise<DebtEquityClass> {
    if (!id || id.trim().length === 0) {
      throw this.createValidationError('Class ID is required');
    }

    try {
      const debtEquityClass = await this.repository.findById(id);
      if (!debtEquityClass) {
        throw this.createNotFoundError(`Debt/equity class with ID ${id} not found`);
      }
      return debtEquityClass;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw this.createServiceError('Failed to retrieve debt/equity class', error);
    }
  }

  async getClassesByProject(projectId: string): Promise<DebtEquityClass[]> {
    if (!projectId || projectId.trim().length === 0) {
      throw this.createValidationError('Project ID is required');
    }

    try {
      return await this.repository.findByProjectId(projectId);
    } catch (error) {
      throw this.createServiceError('Failed to retrieve debt/equity classes for project', error);
    }
  }

  async updateClass(id: string, classData: Partial<DebtEquityClassFormData>): Promise<DebtEquityClass> {
    if (!id || id.trim().length === 0) {
      throw this.createValidationError('Class ID is required');
    }

    // Get existing class to validate update
    const existingClass = await this.getClass(id);

    // Create full class data for validation by merging existing with updates
    const fullClassData: DebtEquityClassFormData = {
      unitClass: classData.unitClass ?? existingClass.unitClass,
      unitPrice: classData.unitPrice ?? existingClass.unitPrice,
      isOpenToInvestments: classData.isOpenToInvestments ?? existingClass.isOpenToInvestments,
      investmentIncrementAmount: classData.investmentIncrementAmount ?? existingClass.investmentIncrementAmount,
      minInvestmentAmount: classData.minInvestmentAmount ?? existingClass.minInvestmentAmount,
      maxInvestmentAmount: classData.maxInvestmentAmount ?? existingClass.maxInvestmentAmount
    };

    // Validate the merged data
    await this.validateClassData(fullClassData);

    // Check for duplicate unit class names if unit class is being updated
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
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw this.createServiceError('Failed to update debt/equity class', error);
    }
  }

  async deleteClass(id: string): Promise<void> {
    if (!id || id.trim().length === 0) {
      throw this.createValidationError('Class ID is required');
    }

    try {
      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw this.createNotFoundError(`Debt/equity class with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw this.createServiceError('Failed to delete debt/equity class', error);
    }
  }

  async validateClassData(classData: DebtEquityClassFormData): Promise<void> {
    const errors = DebtEquityClassModel.validate(classData);
    
    if (errors.length > 0) {
      throw this.createValidationError('Validation failed', { validation: errors });
    }
  }

  // Business rule validation methods
  private validateInvestmentAmountRelationships(classData: DebtEquityClassFormData): string[] {
    const errors: string[] = [];

    // Minimum <= Maximum validation
    if (classData.minInvestmentAmount > classData.maxInvestmentAmount) {
      errors.push('Minimum investment amount cannot be greater than maximum investment amount');
    }

    // Increment <= Minimum validation
    if (classData.investmentIncrementAmount > classData.minInvestmentAmount) {
      errors.push('Investment increment amount cannot be greater than minimum investment amount');
    }

    // Increment must divide evenly into the range
    const range = classData.maxInvestmentAmount - classData.minInvestmentAmount;
    if (range > 0 && range % classData.investmentIncrementAmount !== 0) {
      errors.push('Investment increment amount must divide evenly into the investment range');
    }

    return errors;
  }

  // Error creation helper methods
  private createValidationError(message: string, details?: Record<string, string[]>): Error {
    const error = new Error(message) as Error & { code: string; details?: Record<string, string[]> };
    error.code = 'VALIDATION_ERROR';
    if (details) {
      error.details = details;
    }
    return error;
  }

  private createNotFoundError(message: string): Error {
    const error = new Error(message) as Error & { code: string };
    error.code = 'NOT_FOUND';
    return error;
  }

  private createServiceError(message: string, originalError: unknown): Error {
    const error = new Error(message) as Error & { code: string; originalError: unknown };
    error.code = 'SERVICE_ERROR';
    error.originalError = originalError;
    return error;
  }
}