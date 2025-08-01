import { Project, ProjectFormData, ProjectFilters, PaginationParams, PaginatedResponse, IProjectService, CommitmentReservationData, ProjectKPIs } from '../types';
export declare class ProjectService implements IProjectService {
    private projectRepository;
    constructor();
    createProject(projectData: ProjectFormData): Promise<Project>;
    getProject(id: string): Promise<Project>;
    getAllProjects(filters: ProjectFilters, pagination: PaginationParams): Promise<PaginatedResponse<Project>>;
    updateProject(id: string, projectData: Partial<ProjectFormData>): Promise<Project>;
    deleteProject(id: string): Promise<void>;
    validateProjectData(projectData: ProjectFormData, excludeId?: string): Promise<void>;
    updateCommitments(id: string, commitments: {
        totalAmount: number;
        investorCount: number;
    }): Promise<Project>;
    updateReservations(id: string, reservations: {
        totalAmount: number;
        investorCount: number;
    }): Promise<Project>;
    updateCommitmentReservationData(id: string, data: CommitmentReservationData): Promise<Project>;
    getProjectKPIs(id: string): Promise<ProjectKPIs>;
}
//# sourceMappingURL=ProjectService.d.ts.map