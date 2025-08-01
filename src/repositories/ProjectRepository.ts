import { FileStorage } from '../utils/fileStorage';
import { Project, ProjectFilters, PaginationParams, PaginatedResponse, IProjectRepository, CommitmentReservationData } from '../types';

export class ProjectRepository implements IProjectRepository {
  private fileStorage: FileStorage;

  constructor() {
    this.fileStorage = new FileStorage();
  }

  async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const projects = await this.fileStorage.readProjects();
    
    // Check for duplicate project names
    const existingProject = projects.find(p => 
      p.projectName.toLowerCase() === projectData.projectName.toLowerCase()
    );
    
    if (existingProject) {
      throw new Error('A project with this name already exists');
    }

    const newProject: Project = {
      id: this.generateId(),
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    projects.push(newProject);
    await this.fileStorage.writeProjects(projects);
    
    return newProject;
  }

  async findById(id: string): Promise<Project | null> {
    const projects = await this.fileStorage.readProjects();
    return projects.find(project => project.id === id) || null;
  }

  async findAll(filters: ProjectFilters, pagination: PaginationParams): Promise<PaginatedResponse<Project>> {
    const projects = await this.fileStorage.readProjects();
    
    // Apply filters
    let filteredProjects = projects;
    
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredProjects = filteredProjects.filter(project =>
        project.projectName.toLowerCase().includes(searchTerm) ||
        project.legalProjectName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateRange) {
      filteredProjects = filteredProjects.filter(project =>
        project.timeframe.startDate >= filters.dateRange!.start &&
        project.timeframe.endDate <= filters.dateRange!.end
      );
    }

    // Apply sorting
    if (pagination.sortBy) {
      filteredProjects.sort((a, b) => {
        const aValue = this.getNestedValue(a, pagination.sortBy!);
        const bValue = this.getNestedValue(b, pagination.sortBy!);
        
        if (pagination.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    } else {
      // Default sort by creation date (newest first)
      filteredProjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Apply pagination
    const total = filteredProjects.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    return {
      data: paginatedProjects,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages
      }
    };
  }

  async update(id: string, updateData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project | null> {
    const projects = await this.fileStorage.readProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      return null;
    }

    // Check for duplicate project names (excluding current project)
    if (updateData.projectName) {
      const existingProject = projects.find(p => 
        p.id !== id && p.projectName.toLowerCase() === updateData.projectName!.toLowerCase()
      );
      
      if (existingProject) {
        throw new Error('A project with this name already exists');
      }
    }

    const updatedProject: Project = {
      ...projects[projectIndex],
      ...updateData,
      updatedAt: new Date()
    };

    projects[projectIndex] = updatedProject;
    await this.fileStorage.writeProjects(projects);
    
    return updatedProject;
  }

  async delete(id: string): Promise<boolean> {
    const projects = await this.fileStorage.readProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      return false;
    }

    // Create backup before deletion
    await this.fileStorage.backupProjects();
    
    projects.splice(projectIndex, 1);
    await this.fileStorage.writeProjects(projects);
    
    return true;
  }

  async existsByName(projectName: string, excludeId?: string): Promise<boolean> {
    const projects = await this.fileStorage.readProjects();
    return projects.some(project => 
      project.projectName.toLowerCase() === projectName.toLowerCase() &&
      project.id !== excludeId
    );
  }

  async updateCommitments(id: string, commitments: { totalAmount: number; investorCount: number }): Promise<Project | null> {
    const projects = await this.fileStorage.readProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      return null;
    }

    const updatedProject: Project = {
      ...projects[projectIndex],
      commitments,
      updatedAt: new Date()
    };

    projects[projectIndex] = updatedProject;
    await this.fileStorage.writeProjects(projects);
    
    return updatedProject;
  }

  async updateReservations(id: string, reservations: { totalAmount: number; investorCount: number }): Promise<Project | null> {
    const projects = await this.fileStorage.readProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      return null;
    }

    const updatedProject: Project = {
      ...projects[projectIndex],
      reservations,
      updatedAt: new Date()
    };

    projects[projectIndex] = updatedProject;
    await this.fileStorage.writeProjects(projects);
    
    return updatedProject;
  }

  async updateCommitmentReservationData(id: string, data: CommitmentReservationData): Promise<Project | null> {
    const projects = await this.fileStorage.readProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      return null;
    }

    const updatedProject: Project = {
      ...projects[projectIndex],
      commitments: data.commitments,
      reservations: data.reservations,
      updatedAt: new Date()
    };

    projects[projectIndex] = updatedProject;
    await this.fileStorage.writeProjects(projects);
    
    return updatedProject;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}