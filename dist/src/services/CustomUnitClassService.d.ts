import { CustomUnitClass, CustomUnitClassFormData, ICustomUnitClassService, ICustomUnitClassRepository } from '../types';
export declare class CustomUnitClassService implements ICustomUnitClassService {
    private repository;
    constructor(repository?: ICustomUnitClassRepository);
    createCustomClass(classData: CustomUnitClassFormData): Promise<CustomUnitClass>;
    getCustomClass(id: string): Promise<CustomUnitClass>;
    getAllCustomClasses(): Promise<CustomUnitClass[]>;
    deleteCustomClass(id: string): Promise<void>;
    validateCustomClassData(classData: CustomUnitClassFormData): Promise<void>;
    searchCustomClasses(query: string): Promise<CustomUnitClass[]>;
    getCustomClassByName(name: string): Promise<CustomUnitClass | null>;
    isNameAvailable(name: string, excludeId?: string): Promise<boolean>;
    private createValidationError;
    private createNotFoundError;
    private createServiceError;
}
//# sourceMappingURL=CustomUnitClassService.d.ts.map