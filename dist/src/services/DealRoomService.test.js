"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DealRoomService_1 = require("./DealRoomService");
const DealRoomRepository_1 = require("../repositories/DealRoomRepository");
jest.mock('../repositories/DealRoomRepository');
describe('DealRoomService', () => {
    let dealRoomService;
    let mockRepository;
    beforeEach(() => {
        dealRoomService = new DealRoomService_1.DealRoomService();
        mockRepository = new DealRoomRepository_1.DealRoomRepository();
        dealRoomService.dealRoomRepository = mockRepository;
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getDealRoomByProjectId', () => {
        it('should return deal room for valid project ID', async () => {
            const projectId = 'project-123';
            const mockDealRoom = {
                id: 'dr-123',
                projectId,
                investmentBlurb: 'Test blurb',
                investmentSummary: 'Test summary',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findByProjectId.mockResolvedValue(mockDealRoom);
            const result = await dealRoomService.getDealRoomByProjectId(projectId);
            expect(result).toBe(mockDealRoom);
            expect(mockRepository.findByProjectId).toHaveBeenCalledWith(projectId);
        });
        it('should throw error for invalid project ID', async () => {
            await expect(dealRoomService.getDealRoomByProjectId('')).rejects.toThrow('Project ID is required');
            await expect(dealRoomService.getDealRoomByProjectId(null)).rejects.toThrow('Project ID is required');
        });
    });
    describe('createDealRoom', () => {
        it('should create deal room with valid data', async () => {
            const createData = {
                projectId: 'project-123',
                investmentBlurb: 'Test blurb',
                investmentSummary: 'Test summary',
                keyInfo: [],
                externalLinks: []
            };
            const mockDealRoom = {
                id: 'dr-123',
                projectId: createData.projectId,
                investmentBlurb: createData.investmentBlurb,
                investmentSummary: createData.investmentSummary,
                keyInfo: createData.keyInfo.map((item, index) => ({ ...item, id: `item-${index}` })),
                externalLinks: createData.externalLinks.map((link, index) => ({ ...link, id: `link-${index}` })),
                showcasePhoto: createData.showcasePhoto,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.create.mockResolvedValue(mockDealRoom);
            const result = await dealRoomService.createDealRoom(createData);
            expect(result).toBe(mockDealRoom);
            expect(mockRepository.create).toHaveBeenCalledWith(createData);
        });
        it('should throw error for invalid data', async () => {
            const invalidData = {
                projectId: '',
                investmentBlurb: 'Test blurb',
                investmentSummary: 'Test summary',
                keyInfo: [],
                externalLinks: []
            };
            await expect(dealRoomService.createDealRoom(invalidData)).rejects.toThrow('Validation failed');
        });
        it('should handle repository errors', async () => {
            const createData = {
                projectId: 'project-123',
                investmentBlurb: 'Test blurb',
                investmentSummary: 'Test summary',
                keyInfo: [],
                externalLinks: []
            };
            mockRepository.create.mockRejectedValue(new Error('Deal room already exists for this project'));
            await expect(dealRoomService.createDealRoom(createData)).rejects.toThrow('Deal room already exists for this project');
        });
    });
    describe('updateDealRoom', () => {
        it('should update deal room with valid data', async () => {
            const projectId = 'project-123';
            const updateData = {
                investmentBlurb: 'Updated blurb'
            };
            const mockDealRoom = {
                id: 'dr-123',
                projectId,
                investmentBlurb: 'Updated blurb',
                investmentSummary: 'Test summary',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.update.mockResolvedValue(mockDealRoom);
            const result = await dealRoomService.updateDealRoom(projectId, updateData);
            expect(result).toBe(mockDealRoom);
            expect(mockRepository.update).toHaveBeenCalledWith(projectId, updateData);
        });
        it('should throw error for invalid project ID', async () => {
            await expect(dealRoomService.updateDealRoom('', {})).rejects.toThrow('Project ID is required');
        });
        it('should handle repository errors', async () => {
            const projectId = 'project-123';
            const updateData = { investmentBlurb: 'Updated blurb' };
            mockRepository.update.mockRejectedValue(new Error('Deal room not found'));
            await expect(dealRoomService.updateDealRoom(projectId, updateData)).rejects.toThrow('Deal room not found');
        });
    });
    describe('getOrCreateDealRoom', () => {
        it('should return existing deal room', async () => {
            const projectId = 'project-123';
            const mockDealRoom = {
                id: 'dr-123',
                projectId,
                investmentBlurb: 'Test blurb',
                investmentSummary: 'Test summary',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findByProjectId.mockResolvedValue(mockDealRoom);
            const result = await dealRoomService.getOrCreateDealRoom(projectId);
            expect(result).toBe(mockDealRoom);
            expect(mockRepository.findByProjectId).toHaveBeenCalledWith(projectId);
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
        it('should create new deal room if none exists', async () => {
            const projectId = 'project-123';
            const mockDealRoom = {
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findByProjectId.mockResolvedValue(null);
            mockRepository.create.mockResolvedValue(mockDealRoom);
            const result = await dealRoomService.getOrCreateDealRoom(projectId);
            expect(result).toBe(mockDealRoom);
            expect(mockRepository.findByProjectId).toHaveBeenCalledWith(projectId);
            expect(mockRepository.create).toHaveBeenCalledWith({
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: []
            });
        });
    });
    describe('uploadShowcasePhoto', () => {
        it('should upload photo with valid data', async () => {
            const projectId = 'project-123';
            const file = Buffer.from('fake image data');
            const originalName = 'photo.jpg';
            const mimeType = 'image/jpeg';
            const mockDealRoom = {
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                showcasePhoto: {
                    filename: 'showcase_123.jpg',
                    originalName,
                    mimeType,
                    size: file.length,
                    uploadedAt: new Date()
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findByProjectId.mockResolvedValue(null);
            mockRepository.create.mockResolvedValue(mockDealRoom);
            mockRepository.saveShowcasePhoto.mockResolvedValue(mockDealRoom.showcasePhoto);
            mockRepository.update.mockResolvedValue(mockDealRoom);
            const result = await dealRoomService.uploadShowcasePhoto(projectId, file, originalName, mimeType);
            expect(result).toBe(mockDealRoom);
            expect(mockRepository.saveShowcasePhoto).toHaveBeenCalledWith(projectId, file, originalName, mimeType);
        });
        it('should throw error for invalid file type', async () => {
            const projectId = 'project-123';
            const file = Buffer.from('fake data');
            const originalName = 'document.pdf';
            const mimeType = 'application/pdf';
            await expect(dealRoomService.uploadShowcasePhoto(projectId, file, originalName, mimeType))
                .rejects.toThrow('Invalid image format');
        });
        it('should throw error for file too large', async () => {
            const projectId = 'project-123';
            const file = Buffer.alloc(11 * 1024 * 1024);
            const originalName = 'photo.jpg';
            const mimeType = 'image/jpeg';
            await expect(dealRoomService.uploadShowcasePhoto(projectId, file, originalName, mimeType))
                .rejects.toThrow('File size too large');
        });
    });
    describe('updateInvestmentBlurb', () => {
        it('should update investment blurb', async () => {
            const projectId = 'project-123';
            const investmentBlurb = 'Updated blurb';
            const mockDealRoom = {
                id: 'dr-123',
                projectId,
                investmentBlurb,
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findByProjectId.mockResolvedValue(null);
            mockRepository.create.mockResolvedValue(mockDealRoom);
            mockRepository.update.mockResolvedValue(mockDealRoom);
            const result = await dealRoomService.updateInvestmentBlurb(projectId, investmentBlurb);
            expect(result).toBe(mockDealRoom);
            expect(mockRepository.update).toHaveBeenCalledWith(projectId, { investmentBlurb });
        });
        it('should throw error for blurb too long', async () => {
            const projectId = 'project-123';
            const investmentBlurb = 'a'.repeat(501);
            await expect(dealRoomService.updateInvestmentBlurb(projectId, investmentBlurb))
                .rejects.toThrow('Investment blurb must be less than 500 characters');
        });
    });
    describe('updateKeyInfo', () => {
        it('should update key info with valid data', async () => {
            const projectId = 'project-123';
            const keyInfo = [
                { name: 'Prospectus', link: 'https://example.com/prospectus.pdf', order: 0 }
            ];
            const mockDealRoom = {
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: keyInfo.map(item => ({ ...item, id: 'item-123' })),
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findByProjectId.mockResolvedValue(null);
            mockRepository.create.mockResolvedValue(mockDealRoom);
            mockRepository.update.mockResolvedValue(mockDealRoom);
            const result = await dealRoomService.updateKeyInfo(projectId, keyInfo);
            expect(result).toBe(mockDealRoom);
            expect(mockRepository.update).toHaveBeenCalledWith(projectId, { keyInfo });
        });
        it('should throw error for invalid URL', async () => {
            const projectId = 'project-123';
            const keyInfo = [
                { name: 'Prospectus', link: 'invalid-url', order: 0 }
            ];
            await expect(dealRoomService.updateKeyInfo(projectId, keyInfo))
                .rejects.toThrow('Key info item 1: Link must be a valid URL');
        });
    });
});
//# sourceMappingURL=DealRoomService.test.js.map