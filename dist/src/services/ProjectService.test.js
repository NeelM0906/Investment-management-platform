"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProjectService_1 = require("./ProjectService");
const ProjectRepository_1 = require("../repositories/ProjectRepository");
jest.mock('../repositories/ProjectRepository');
describe('ProjectService Delete Functionality', () => {
    let projectService;
    let mockProjectRepository;
    const mockProject = {
        id: 'test-id-123',
        projectName: 'Test Project',
        legalProjectName: 'Test Project LLC',
        unitCalculationPrecision: 2,
        targetAmount: 1000000,
        currency: 'USD',
        timeframe: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31')
        },
        commitments: {
            totalAmount: 500000,
            investorCount: 3
        },
        reservations: {
            totalAmount: 200000,
            investorCount: 2
        },
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
    };
    beforeEach(() => {
        mockProjectRepository = new ProjectRepository_1.ProjectRepository();
        projectService = new ProjectService_1.ProjectService();
        projectService.projectRepository = mockProjectRepository;
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('deleteProject', () => {
        test('should successfully delete an existing project', async () => {
            mockProjectRepository.delete.mockResolvedValue(true);
            await projectService.deleteProject('test-id-123');
            expect(mockProjectRepository.delete).toHaveBeenCalledWith('test-id-123');
            expect(mockProjectRepository.delete).toHaveBeenCalledTimes(1);
        });
        test('should throw error when project does not exist', async () => {
            mockProjectRepository.delete.mockResolvedValue(false);
            await expect(projectService.deleteProject('non-existent-id'))
                .rejects.toThrow('Project not found');
            expect(mockProjectRepository.delete).toHaveBeenCalledWith('non-existent-id');
        });
        test('should handle repository errors gracefully', async () => {
            const repositoryError = new Error('Database connection failed');
            mockProjectRepository.delete.mockRejectedValue(repositoryError);
            await expect(projectService.deleteProject('test-id-123'))
                .rejects.toThrow('Database connection failed');
            expect(mockProjectRepository.delete).toHaveBeenCalledWith('test-id-123');
        });
        test('should delete projects with commitments and reservations', async () => {
            mockProjectRepository.delete.mockResolvedValue(true);
            await projectService.deleteProject('test-id-123');
            expect(mockProjectRepository.delete).toHaveBeenCalledWith('test-id-123');
            expect(mockProjectRepository.delete).toHaveBeenCalledTimes(1);
        });
        test('should delete projects without commitments and reservations', async () => {
            mockProjectRepository.delete.mockResolvedValue(true);
            await projectService.deleteProject('test-id-456');
            expect(mockProjectRepository.delete).toHaveBeenCalledWith('test-id-456');
            expect(mockProjectRepository.delete).toHaveBeenCalledTimes(1);
        });
    });
    describe('getProject for delete validation', () => {
        test('should retrieve project before deletion for validation', async () => {
            mockProjectRepository.findById.mockResolvedValue(mockProject);
            const result = await projectService.getProject('test-id-123');
            expect(result).toEqual(mockProject);
            expect(mockProjectRepository.findById).toHaveBeenCalledWith('test-id-123');
        });
        test('should throw error when project not found for validation', async () => {
            mockProjectRepository.findById.mockResolvedValue(null);
            await expect(projectService.getProject('non-existent-id'))
                .rejects.toThrow('Project not found');
            expect(mockProjectRepository.findById).toHaveBeenCalledWith('non-existent-id');
        });
    });
});
//# sourceMappingURL=ProjectService.test.js.map