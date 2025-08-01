"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
const uuid_1 = require("uuid");
class ProjectModel {
    static fromFormData(formData) {
        return {
            projectName: formData.projectName.trim(),
            legalProjectName: formData.legalProjectName.trim(),
            unitCalculationPrecision: formData.unitCalculationPrecision,
            targetAmount: formData.targetAmount,
            minimumInvestment: formData.minimumInvestment,
            currency: formData.currency,
            timeframe: {
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate)
            },
            commitments: {
                totalAmount: 0,
                investorCount: 0
            },
            reservations: {
                totalAmount: 0,
                investorCount: 0
            }
        };
    }
    static create(projectData) {
        const now = new Date();
        return {
            id: (0, uuid_1.v4)(),
            ...projectData,
            createdAt: now,
            updatedAt: now
        };
    }
    static update(existingProject, updateData) {
        return {
            ...existingProject,
            ...updateData,
            updatedAt: new Date()
        };
    }
    static validate(projectData) {
        const errors = [];
        if (!projectData.projectName || projectData.projectName.trim().length === 0) {
            errors.push('Project name is required');
        }
        else if (projectData.projectName.length > 255) {
            errors.push('Project name must be less than 255 characters');
        }
        if (!projectData.legalProjectName || projectData.legalProjectName.trim().length === 0) {
            errors.push('Legal project name is required');
        }
        else if (projectData.legalProjectName.length > 255) {
            errors.push('Legal project name must be less than 255 characters');
        }
        if (!projectData.targetAmount || projectData.targetAmount <= 0) {
            errors.push('Target amount must be greater than 0');
        }
        if (projectData.minimumInvestment !== undefined && projectData.minimumInvestment !== null) {
            if (projectData.minimumInvestment < 0) {
                errors.push('Minimum investment must be a positive number');
            }
            if (projectData.targetAmount && projectData.minimumInvestment > projectData.targetAmount) {
                errors.push('Minimum investment cannot be greater than target amount');
            }
        }
        if (projectData.unitCalculationPrecision < 0 || projectData.unitCalculationPrecision > 10) {
            errors.push('Unit calculation precision must be between 0 and 10');
        }
        if (!projectData.startDate) {
            errors.push('Start date is required');
        }
        if (!projectData.endDate) {
            errors.push('End date is required');
        }
        if (projectData.startDate && projectData.endDate) {
            const startDate = new Date(projectData.startDate);
            const endDate = new Date(projectData.endDate);
            if (startDate >= endDate) {
                errors.push('End date must be after start date');
            }
        }
        return errors;
    }
    static validateCommitmentReservationData(data) {
        const errors = [];
        if (data.commitments.totalAmount < 0) {
            errors.push('Commitment amount must be a positive number');
        }
        if (data.commitments.investorCount < 0 || !Number.isInteger(data.commitments.investorCount)) {
            errors.push('Commitment investor count must be a positive integer');
        }
        if (data.reservations.totalAmount < 0) {
            errors.push('Reservation amount must be a positive number');
        }
        if (data.reservations.investorCount < 0 || !Number.isInteger(data.reservations.investorCount)) {
            errors.push('Reservation investor count must be a positive integer');
        }
        return errors;
    }
    static calculateKPIs(project) {
        const now = new Date();
        const endDate = new Date(project.timeframe.endDate);
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const fundingPercentage = project.targetAmount > 0
            ? Math.round((project.commitments.totalAmount / project.targetAmount) * 100)
            : 0;
        return {
            totalCommitments: project.commitments.investorCount,
            totalCommittedAmount: project.commitments.totalAmount,
            fundingPercentage: Math.min(100, fundingPercentage),
            daysRemaining,
            currency: project.currency
        };
    }
    static updateCommitments(project, commitments) {
        return {
            ...project,
            commitments,
            updatedAt: new Date()
        };
    }
    static updateReservations(project, reservations) {
        return {
            ...project,
            reservations,
            updatedAt: new Date()
        };
    }
}
exports.ProjectModel = ProjectModel;
//# sourceMappingURL=Project.js.map