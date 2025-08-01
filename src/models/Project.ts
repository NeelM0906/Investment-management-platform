import { v4 as uuidv4 } from 'uuid';
import { Project, ProjectFormData, CommitmentReservationData, ProjectKPIs } from '../types';

export class ProjectModel {
  static fromFormData(formData: ProjectFormData): Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {
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

  static create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const now = new Date();
    return {
      id: uuidv4(),
      ...projectData,
      createdAt: now,
      updatedAt: now
    };
  }

  static update(existingProject: Project, updateData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Project {
    return {
      ...existingProject,
      ...updateData,
      updatedAt: new Date()
    };
  }

  static validate(projectData: ProjectFormData): string[] {
    const errors: string[] = [];

    // Project name validation
    if (!projectData.projectName || projectData.projectName.trim().length === 0) {
      errors.push('Project name is required');
    } else if (projectData.projectName.length > 255) {
      errors.push('Project name must be less than 255 characters');
    }

    // Legal project name validation
    if (!projectData.legalProjectName || projectData.legalProjectName.trim().length === 0) {
      errors.push('Legal project name is required');
    } else if (projectData.legalProjectName.length > 255) {
      errors.push('Legal project name must be less than 255 characters');
    }

    // Target amount validation
    if (!projectData.targetAmount || projectData.targetAmount <= 0) {
      errors.push('Target amount must be greater than 0');
    }

    // Minimum investment validation (optional field)
    if (projectData.minimumInvestment !== undefined && projectData.minimumInvestment !== null) {
      if (projectData.minimumInvestment < 0) {
        errors.push('Minimum investment must be a positive number');
      }
      if (projectData.targetAmount && projectData.minimumInvestment > projectData.targetAmount) {
        errors.push('Minimum investment cannot be greater than target amount');
      }
    }

    // Unit calculation precision validation
    if (projectData.unitCalculationPrecision < 0 || projectData.unitCalculationPrecision > 10) {
      errors.push('Unit calculation precision must be between 0 and 10');
    }

    // Date validation
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

  static validateCommitmentReservationData(data: CommitmentReservationData): string[] {
    const errors: string[] = [];

    // Commitment validation
    if (data.commitments.totalAmount < 0) {
      errors.push('Commitment amount must be a positive number');
    }

    if (data.commitments.investorCount < 0 || !Number.isInteger(data.commitments.investorCount)) {
      errors.push('Commitment investor count must be a positive integer');
    }

    // Reservation validation
    if (data.reservations.totalAmount < 0) {
      errors.push('Reservation amount must be a positive number');
    }

    if (data.reservations.investorCount < 0 || !Number.isInteger(data.reservations.investorCount)) {
      errors.push('Reservation investor count must be a positive integer');
    }

    return errors;
  }

  static calculateKPIs(project: Project): ProjectKPIs {
    const now = new Date();
    const endDate = new Date(project.timeframe.endDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    const fundingPercentage = project.targetAmount > 0 
      ? Math.round((project.commitments.totalAmount / project.targetAmount) * 100)
      : 0;

    return {
      totalCommitments: project.commitments.investorCount,
      totalCommittedAmount: project.commitments.totalAmount,
      fundingPercentage: Math.min(100, fundingPercentage), // Cap at 100%
      daysRemaining,
      currency: project.currency
    };
  }

  static updateCommitments(project: Project, commitments: { totalAmount: number; investorCount: number }): Project {
    return {
      ...project,
      commitments,
      updatedAt: new Date()
    };
  }

  static updateReservations(project: Project, reservations: { totalAmount: number; investorCount: number }): Project {
    return {
      ...project,
      reservations,
      updatedAt: new Date()
    };
  }
}