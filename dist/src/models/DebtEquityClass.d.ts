import { DebtEquityClass, DebtEquityClassFormData, CustomUnitClass, CustomUnitClassFormData } from '../types';
export declare class DebtEquityClassModel {
    static fromFormData(projectId: string, formData: DebtEquityClassFormData): Omit<DebtEquityClass, 'id' | 'createdAt' | 'updatedAt'>;
    static create(projectId: string, classData: Omit<DebtEquityClass, 'id' | 'createdAt' | 'updatedAt'>): DebtEquityClass;
    static update(existingClass: DebtEquityClass, updateData: Partial<Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): DebtEquityClass;
    static validate(classData: DebtEquityClassFormData): string[];
    static toFormData(debtEquityClass: DebtEquityClass): DebtEquityClassFormData;
}
export declare class CustomUnitClassModel {
    static fromFormData(formData: CustomUnitClassFormData): Omit<CustomUnitClass, 'id' | 'createdAt'>;
    static create(classData: Omit<CustomUnitClass, 'id' | 'createdAt'>): CustomUnitClass;
    static validate(classData: CustomUnitClassFormData): string[];
    static toFormData(customClass: CustomUnitClass): CustomUnitClassFormData;
}
//# sourceMappingURL=DebtEquityClass.d.ts.map