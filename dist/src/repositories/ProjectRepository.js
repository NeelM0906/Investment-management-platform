"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRepository = void 0;
const fileStorage_1 = require("../utils/fileStorage");
class ProjectRepository {
    constructor() {
        this.fileStorage = new fileStorage_1.FileStorage();
    }
    async create(projectData) {
        const projects = await this.fileStorage.readProjects();
        const existingProject = projects.find(p => p.projectName.toLowerCase() === projectData.projectName.toLowerCase());
        if (existingProject) {
            throw new Error('A project with this name already exists');
        }
        const newProject = {
            id: this.generateId(),
            ...projectData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        projects.push(newProject);
        await this.fileStorage.writeProjects(projects);
        return newProject;
    }
    async findById(id) {
        const projects = await this.fileStorage.readProjects();
        return projects.find(project => project.id === id) || null;
    }
    async findAll(filters, pagination) {
        const projects = await this.fileStorage.readProjects();
        let filteredProjects = projects;
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            filteredProjects = filteredProjects.filter(project => project.projectName.toLowerCase().includes(searchTerm) ||
                project.legalProjectName.toLowerCase().includes(searchTerm));
        }
        if (filters.dateRange) {
            filteredProjects = filteredProjects.filter(project => project.timeframe.startDate >= filters.dateRange.start &&
                project.timeframe.endDate <= filters.dateRange.end);
        }
        if (pagination.sortBy) {
            filteredProjects.sort((a, b) => {
                const aValue = this.getNestedValue(a, pagination.sortBy);
                const bValue = this.getNestedValue(b, pagination.sortBy);
                if (pagination.sortOrder === 'desc') {
                    return bValue > aValue ? 1 : -1;
                }
                return aValue > bValue ? 1 : -1;
            });
        }
        else {
            filteredProjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
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
    async update(id, updateData) {
        const projects = await this.fileStorage.readProjects();
        const projectIndex = projects.findIndex(project => project.id === id);
        if (projectIndex === -1) {
            return null;
        }
        if (updateData.projectName) {
            const existingProject = projects.find(p => p.id !== id && p.projectName.toLowerCase() === updateData.projectName.toLowerCase());
            if (existingProject) {
                throw new Error('A project with this name already exists');
            }
        }
        const updatedProject = {
            ...projects[projectIndex],
            ...updateData,
            updatedAt: new Date()
        };
        projects[projectIndex] = updatedProject;
        await this.fileStorage.writeProjects(projects);
        return updatedProject;
    }
    async delete(id) {
        const projects = await this.fileStorage.readProjects();
        const projectIndex = projects.findIndex(project => project.id === id);
        if (projectIndex === -1) {
            return false;
        }
        await this.fileStorage.backupProjects();
        projects.splice(projectIndex, 1);
        await this.fileStorage.writeProjects(projects);
        return true;
    }
    async existsByName(projectName, excludeId) {
        const projects = await this.fileStorage.readProjects();
        return projects.some(project => project.projectName.toLowerCase() === projectName.toLowerCase() &&
            project.id !== excludeId);
    }
    async updateCommitments(id, commitments) {
        const projects = await this.fileStorage.readProjects();
        const projectIndex = projects.findIndex(project => project.id === id);
        if (projectIndex === -1) {
            return null;
        }
        const updatedProject = {
            ...projects[projectIndex],
            commitments,
            updatedAt: new Date()
        };
        projects[projectIndex] = updatedProject;
        await this.fileStorage.writeProjects(projects);
        return updatedProject;
    }
    async updateReservations(id, reservations) {
        const projects = await this.fileStorage.readProjects();
        const projectIndex = projects.findIndex(project => project.id === id);
        if (projectIndex === -1) {
            return null;
        }
        const updatedProject = {
            ...projects[projectIndex],
            reservations,
            updatedAt: new Date()
        };
        projects[projectIndex] = updatedProject;
        await this.fileStorage.writeProjects(projects);
        return updatedProject;
    }
    async updateCommitmentReservationData(id, data) {
        const projects = await this.fileStorage.readProjects();
        const projectIndex = projects.findIndex(project => project.id === id);
        if (projectIndex === -1) {
            return null;
        }
        const updatedProject = {
            ...projects[projectIndex],
            commitments: data.commitments,
            reservations: data.reservations,
            updatedAt: new Date()
        };
        projects[projectIndex] = updatedProject;
        await this.fileStorage.writeProjects(projects);
        return updatedProject;
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}
exports.ProjectRepository = ProjectRepository;
//# sourceMappingURL=ProjectRepository.js.map