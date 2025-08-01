import { DebtEquityClass, DebtEquityClassFormData, IDebtEquityClassService, IDebtEquityClassRepository } from '../types';
export declare class DebtEquityClassService implements IDebtEquityClassService {
    private repository;
    constructor(repository?: IDebtEquityClassRepository);
    createClass(projectId: string, classData: DebtEquityClassFormData): Promise<DebtEquityClass>;
    getClass(id: string): Promise<DebtEquityClass>;
    getClassesByProject(projectId: string): Promise<DebtEquityClass[]>;
    updateClass(id: string, classData: Partial<DebtEquityClassFormData>): Promise<DebtEquityClass>;
    deleteClass(id: string): Promise<void>;
    validateClassData(classData: DebtEquityClassFormData): Promise<void>;
    private validateInvestmentAmountRelationships;
    private createValidationError;
    private createNotFoundError;
    private createServiceError;
}
//# sourceMappingURL=DebtEquityClassService.d.ts.map