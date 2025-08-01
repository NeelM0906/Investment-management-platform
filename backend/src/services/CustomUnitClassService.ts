import { 
  CustomUnitClass, 
  CustomUnitClassFormData, 
  ICustomUnitClassService, 
  ICustomUnitClassRepository 
} from '../types';
import { CustomUnitClassRepository } from '../repositories/CustomUnitClassRepository';
import { CustomUnitClassModel } from '../models/DebtEquityClass';

export class CustomUnitClassService implements ICustomUnitClassService {
  private repository: ICustomUnitClassRepository;

  constructor(repository?: ICustomUnitClassRepository) {
    this.repository = repository || new CustomUnitClassRepository();
  }

  async createCustomClass(classData: CustomUnitClassFormData): Promise<CustomUnitClass> {
    // Validate input data
    await this.validateCustomClassData(classData);

    // Check for duplicate names (case-insensitive)
    const existingClass = await this.repository.findByName(classData.name);
    if (existingClass) {
      throw this.createValidationError(`A custom unit class with the name "${classData.name}" already exists`);
    }

    try {
      const classToCreate = CustomUnitClassModel.fromFormData(classData);
      return await this.repository.create(classToCreate);
    } catch (error) {
      // Handle repository-level duplicate name errors
      if (error instanceof Error && error.message.includes('already exists')) {
        throw this.createValidationError(error.message);
      }
      throw this.createServiceError('Failed to create custom unit class', error);
    }
  }

  async getCustomClass(id: string): Promise<CustomUnitClass> {
    if (!id || id.trim().length === 0) {
      throw this.createValidationError('Custom class ID is required');
    }

    try {
      const customClass = await this.repository.findById(id);
      if (!customClass) {
        throw this.createNotFoundError(`Custom unit class with ID ${id} not found`);
      }
      return customClass;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw this.createServiceError('Failed to retrieve custom unit class', error);
    }
  }

  async getAllCustomClasses(): Promise<CustomUnitClass[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      throw this.createServiceError('Failed to retrieve custom unit classes', error);
    }
  }

  async deleteCustomClass(id: string): Promise<void> {
    if (!id || id.trim().length === 0) {
      throw this.createValidationError('Custom class ID is required');
    }

    try {
      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw this.createNotFoundError(`Custom unit class with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw this.createServiceError('Failed to delete custom unit class', error);
    }
  }

  async validateCustomClassData(classData: CustomUnitClassFormData): Promise<void> {
    const errors = CustomUnitClassModel.validate(classData);
    
    if (errors.length > 0) {
      throw this.createValidationError('Validation failed', { validation: errors });
    }
  }

  // Additional business methods
  async searchCustomClasses(query: string): Promise<CustomUnitClass[]> {
    if (!query || query.trim().length === 0) {
      return await this.getAllCustomClasses();
    }

    try {
      return await this.repository.search(query.trim());
    } catch (error) {
      throw this.createServiceError('Failed to search custom unit classes', error);
    }
  }

  async getCustomClassByName(name: string): Promise<CustomUnitClass | null> {
    if (!name || name.trim().length === 0) {
      throw this.createValidationError('Custom class name is required');
    }

    try {
      return await this.repository.findByName(name.trim());
    } catch (error) {
      throw this.createServiceError('Failed to retrieve custom unit class by name', error);
    }
  }

  async isNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    if (!name || name.trim().length === 0) {
      return false;
    }

    try {
      return !(await this.repository.existsByName(name.trim(), excludeId));
    } catch (error) {
      throw this.createServiceError('Failed to check custom class name availability', error);
    }
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