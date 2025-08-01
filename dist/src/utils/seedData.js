"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSeeder = void 0;
const fileStorage_1 = require("./fileStorage");
const Project_1 = require("../models/Project");
class DataSeeder {
    constructor() {
        this.fileStorage = new fileStorage_1.FileStorage();
    }
    async seedSampleProjects() {
        const existingProjects = await this.fileStorage.readProjects();
        if (existingProjects.length > 0) {
            console.log('Projects already exist. Skipping seed data.');
            return;
        }
        const sampleProjectsData = [
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
            const projectData = Project_1.ProjectModel.fromFormData(data);
            return Project_1.ProjectModel.create(projectData);
        });
        await this.fileStorage.writeProjects(projects);
        console.log(`Seeded ${projects.length} sample projects successfully.`);
    }
    async clearAllProjects() {
        await this.fileStorage.writeProjects([]);
        console.log('All projects cleared.');
    }
    async getProjectCount() {
        const projects = await this.fileStorage.readProjects();
        return projects.length;
    }
}
exports.DataSeeder = DataSeeder;
//# sourceMappingURL=seedData.js.map