import { Project, ProjectFilters, PaginationParams, PaginatedResponse, IProjectRepository, CommitmentReservationData } from '../types';
export declare class ProjectRepository implements IProjectRepository {
    private fileStorage;
    constructor();
    create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    findAll(filters: ProjectFilters, pagination: PaginationParams): Promise<PaginatedResponse<Project>>;
    update(id: string, updateData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
    existsByName(projectName: string, excludeId?: string): Promise<boolean>;
    updateCommitments(id: string, commitments: {
        totalAmount: number;
        investorCount: number;
    }): Promise<Project | null>;
    updateReservations(id: string, reservations: {
        totalAmount: number;
        investorCount: number;
    }): Promise<Project | null>;
    updateCommitmentReservationData(id: string, data: CommitmentReservationData): Promise<Project | null>;
    private generateId;
    private getNestedValue;
}
//# sourceMappingURL=ProjectRepository.d.ts.map