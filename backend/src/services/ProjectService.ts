import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectModel } from '../models/Project';
import { Project, ProjectFormData, ProjectFilters, PaginationParams, PaginatedResponse, IProjectService, CommitmentReservationData, ProjectKPIs } from '../types';

export class ProjectService implements IProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async createProject(projectData: ProjectFormData): Promise<Project> {
    // Validate the project data
    await this.validateProjectData(projectData);

    // Transform form data to project data
    const transformedData = ProjectModel.fromFormData(projectData);

    // Create the project
    return await this.projectRepository.create(transformedData);
  }

  async getProject(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async getAllProjects(filters: ProjectFilters, pagination: PaginationParams): Promise<PaginatedResponse<Project>> {
    return await this.projectRepository.findAll(filters, pagination);
  }

  async updateProject(id: string, projectData: Partial<ProjectFormData>): Promise<Project> {
    // Validate the update data if provided
    if (Object.keys(projectData).length > 0) {
      // Create a full form data object for validation by merging with existing data
      const existingProject = await this.getProject(id);
      const fullFormData: ProjectFormData = {
        projectName: projectData.projectName || existingProject.projectName,
        legalProjectName: projectData.legalProjectName || existingProject.legalProjectName,
        unitCalculationPrecision: projectData.unitCalculationPrecision ?? existingProject.unitCalculationPrecision,
        targetAmount: projectData.targetAmount ?? existingProject.targetAmount,
        minimumInvestment: projectData.minimumInvestment ?? existingProject.minimumInvestment,
        currency: projectData.currency || existingProject.currency,
        startDate: projectData.startDate || existingProject.timeframe.startDate.toISOString().split('T')[0],
        endDate: projectData.endDate || existingProject.timeframe.endDate.toISOString().split('T')[0]
      };

      await this.validateProjectData(fullFormData, id);
    }

    // Transform partial form data to project data
    const transformedData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> = {};

    if (projectData.projectName !== undefined) {
      transformedData.projectName = projectData.projectName.trim();
    }
    if (projectData.legalProjectName !== undefined) {
      transformedData.legalProjectName = projectData.legalProjectName.trim();
    }
    if (projectData.unitCalculationPrecision !== undefined) {
      transformedData.unitCalculationPrecision = projectData.unitCalculationPrecision;
    }
    if (projectData.targetAmount !== undefined) {
      transformedData.targetAmount = projectData.targetAmount;
    }
    if (projectData.minimumInvestment !== undefined) {
      transformedData.minimumInvestment = projectData.minimumInvestment;
    }
    if (projectData.currency !== undefined) {
      transformedData.currency = projectData.currency;
    }
    if (projectData.startDate !== undefined || projectData.endDate !== undefined) {
      const existingProject = await this.getProject(id);
      transformedData.timeframe = {
        startDate: projectData.startDate ? new Date(projectData.startDate) : existingProject.timeframe.startDate,
        endDate: projectData.endDate ? new Date(projectData.endDate) : existingProject.timeframe.endDate
      };
    }

    const updatedProject = await this.projectRepository.update(id, transformedData);
    
    if (!updatedProject) {
      throw new Error('Project not found');
    }

    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    const deleted = await this.projectRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Project not found');
    }
  }

  async validateProjectData(projectData: ProjectFormData, excludeId?: string): Promise<void> {
    const errors = ProjectModel.validate(projectData);
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Additional business logic validation
    const existingProject = await this.projectRepository.existsByName(projectData.projectName, excludeId);
    if (existingProject) {
      throw new Error('A project with this name already exists');
    }
  }

  async updateCommitments(id: string, commitments: { totalAmount: number; investorCount: number }): Promise<Project> {
    // Validate commitment data
    const validationData: CommitmentReservationData = {
      commitments,
      reservations: { totalAmount: 0, investorCount: 0 } // Dummy data for validation
    };
    
    const errors = ProjectModel.validateCommitmentReservationData(validationData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const updatedProject = await this.projectRepository.updateCommitments(id, commitments);
    
    if (!updatedProject) {
      throw new Error('Project not found');
    }

    return updatedProject;
  }

  async updateReservations(id: string, reservations: { totalAmount: number; investorCount: number }): Promise<Project> {
    // Validate reservation data
    const validationData: CommitmentReservationData = {
      commitments: { totalAmount: 0, investorCount: 0 }, // Dummy data for validation
      reservations
    };
    
    const errors = ProjectModel.validateCommitmentReservationData(validationData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const updatedProject = await this.projectRepository.updateReservations(id, reservations);
    
    if (!updatedProject) {
      throw new Error('Project not found');
    }

    return updatedProject;
  }

  async updateCommitmentReservationData(id: string, data: CommitmentReservationData): Promise<Project> {
    // Validate all commitment and reservation data
    const errors = ProjectModel.validateCommitmentReservationData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const updatedProject = await this.projectRepository.updateCommitmentReservationData(id, data);
    
    if (!updatedProject) {
      throw new Error('Project not found');
    }

    return updatedProject;
  }

  async getProjectKPIs(id: string): Promise<ProjectKPIs> {
    const project = await this.getProject(id);
    return ProjectModel.calculateKPIs(project);
  }
}