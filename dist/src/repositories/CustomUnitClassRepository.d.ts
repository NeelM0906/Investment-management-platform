import { CustomUnitClass, ICustomUnitClassRepository } from '../types';
export declare class CustomUnitClassRepository implements ICustomUnitClassRepository {
    private fileStorage;
    constructor();
    create(classData: Omit<CustomUnitClass, 'id' | 'createdAt'>): Promise<CustomUnitClass>;
    findById(id: string): Promise<CustomUnitClass | null>;
    findAll(): Promise<CustomUnitClass[]>;
    findByName(name: string): Promise<CustomUnitClass | null>;
    delete(id: string): Promise<boolean>;
    existsByName(name: string, excludeId?: string): Promise<boolean>;
    search(query: string): Promise<CustomUnitClass[]>;
}
//# sourceMappingURL=CustomUnitClassRepository.d.ts.map