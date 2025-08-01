import { DebtEquityClass, IDebtEquityClassRepository } from '../types';
export declare class DebtEquityClassRepository implements IDebtEquityClassRepository {
    private fileStorage;
    constructor();
    create(projectId: string, classData: Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Promise<DebtEquityClass>;
    findById(id: string): Promise<DebtEquityClass | null>;
    findByProjectId(projectId: string): Promise<DebtEquityClass[]>;
    update(id: string, updateData: Partial<Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<DebtEquityClass | null>;
    delete(id: string): Promise<boolean>;
    deleteByProjectId(projectId: string): Promise<number>;
    countByProjectId(projectId: string): Promise<number>;
    findByUnitClass(unitClass: string, projectId?: string): Promise<DebtEquityClass[]>;
}
//# sourceMappingURL=DebtEquityClassRepository.d.ts.map