import { FileStorage } from './fileStorage';
import { ProjectModel } from '../models/Project';
import { ProjectFormData } from '../types';

export class DataSeeder {
  private fileStorage: FileStorage;

  constructor() {
    this.fileStorage = new FileStorage();
  }

  async seedSampleProjects(): Promise<void> {
    const existingProjects = await this.fileStorage.readProjects();
    
    if (existingProjects.length > 0) {
      console.log('Projects already exist. Skipping seed data.');
      return;
    }

    const sampleProjectsData: ProjectFormData[] = [
      {
        projectName: 'Green Energy Fund',
        legalProjectName: 'Green Energy Investment Fund LLC',
        unitCalculationPrecision: 4,
        targetAmount: 5000000,
        currency: 'USD',
        startDate: '2024-03-01',
        endDate: '2025-02-28'
      },
      {
        projectName: 'Tech Startup Portfolio',
        legalProjectName: 'Technology Startup Investment Portfolio Inc.',
        unitCalculationPrecision: 2,
        targetAmount: 2500000,
        currency: 'USD',
        startDate: '2024-06-01',
        endDate: '2025-05-31'
      },
      {
        projectName: 'Real Estate Development',
        legalProjectName: 'Prime Real Estate Development Fund LP',
        unitCalculationPrecision: 2,
        targetAmount: 10000000,
        currency: 'USD',
        startDate: '2024-01-15',
        endDate: '2026-01-14'
      }
    ];

    const projects = sampleProjectsData.map(data => {
      const projectData = ProjectModel.fromFormData(data);
      return ProjectModel.create(projectData);
    });

    await this.fileStorage.writeProjects(projects);
    console.log(`Seeded ${projects.length} sample projects successfully.`);
  }

  async clearAllProjects(): Promise<void> {
    await this.fileStorage.writeProjects([]);
    console.log('All projects cleared.');
  }

  async getProjectCount(): Promise<number> {
    const projects = await this.fileStorage.readProjects();
    return projects.length;
  }
}