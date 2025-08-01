"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const ProjectRepository_1 = require("../repositories/ProjectRepository");
const Project_1 = require("../models/Project");
class ProjectService {
    constructor() {
        this.projectRepository = new ProjectRepository_1.ProjectRepository();
    }
    async createProject(projectData) {
        await this.validateProjectData(projectData);
        const transformedData = Project_1.ProjectModel.fromFormData(projectData);
        return await this.projectRepository.create(transformedData);
    }
    async getProject(id) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error('Project not found');
        }
        return project;
    }
    async getAllProjects(filters, pagination) {
        return await this.projectRepository.findAll(filters, pagination);
    }
    async updateProject(id, projectData) {
        if (Object.keys(projectData).length > 0) {
            const existingProject = await this.getProject(id);
            const fullFormData = {
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
        const transformedData = {};
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
    async deleteProject(id) {
        const deleted = await this.projectRepository.delete(id);
        if (!deleted) {
            throw new Error('Project not found');
        }
    }
    async validateProjectData(projectData, excludeId) {
        const errors = Project_1.ProjectModel.validate(projectData);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
        const existingProject = await this.projectRepository.existsByName(projectData.projectName, excludeId);
        if (existingProject) {
            throw new Error('A project with this name already exists');
        }
    }
    async updateCommitments(id, commitments) {
        const validationData = {
            commitments,
            reservations: { totalAmount: 0, investorCount: 0 }
        };
        const errors = Project_1.ProjectModel.validateCommitmentReservationData(validationData);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
        const updatedProject = await this.projectRepository.updateCommitments(id, commitments);
        if (!updatedProject) {
            throw new Error('Project not found');
        }
        return updatedProject;
    }
    async updateReservations(id, reservations) {
        const validationData = {
            commitments: { totalAmount: 0, investorCount: 0 },
            reservations
        };
        const errors = Project_1.ProjectModel.validateCommitmentReservationData(validationData);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
        const updatedProject = await this.projectRepository.updateReservations(id, reservations);
        if (!updatedProject) {
            throw new Error('Project not found');
        }
        return updatedProject;
    }
    async updateCommitmentReservationData(id, data) {
        const errors = Project_1.ProjectModel.validateCommitmentReservationData(data);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
        const updatedProject = await this.projectRepository.updateCommitmentReservationData(id, data);
        if (!updatedProject) {
            throw new Error('Project not found');
        }
        return updatedProject;
    }
    async getProjectKPIs(id) {
        const project = await this.getProject(id);
        return Project_1.ProjectModel.calculateKPIs(project);
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=ProjectService.js.map