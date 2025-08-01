import { Project, ProjectFormData, CommitmentReservationData, ProjectKPIs } from '../types';
export declare class ProjectModel {
    static fromFormData(formData: ProjectFormData): Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
    static create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project;
    static update(existingProject: Project, updateData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Project;
    static validate(projectData: ProjectFormData): string[];
    static validateCommitmentReservationData(data: CommitmentReservationData): string[];
    static calculateKPIs(project: Project): ProjectKPIs;
    static updateCommitments(project: Project, commitments: {
        totalAmount: number;
        investorCount: number;
    }): Project;
    static updateReservations(project: Project, reservations: {
        totalAmount: number;
        investorCount: number;
    }): Project;
}
//# sourceMappingURL=Project.d.ts.map