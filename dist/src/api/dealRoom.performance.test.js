"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DealRoomService_1 = require("../services/DealRoomService");
const DealRoomRepository_1 = require("../repositories/DealRoomRepository");
const DealRoomDraftRepository_1 = require("../repositories/DealRoomDraftRepository");
jest.mock('../repositories/DealRoomRepository');
jest.mock('../repositories/DealRoomDraftRepository');
describe('Deal Room Performance Tests', () => {
    let dealRoomService;
    let mockRepository;
    let mockDraftRepository;
    beforeEach(() => {
        dealRoomService = new DealRoomService_1.DealRoomService();
        mockRepository = new DealRoomRepository_1.DealRoomRepository();
        mockDraftRepository = new DealRoomDraftRepository_1.DealRoomDraftRepository();
        dealRoomService.dealRoomRepository = mockRepository;
        dealRoomService.draftRepository = mockDraftRepository;
    });
    describe('Image Processing Performance', () => {
        it('should handle large image uploads efficiently', async () => {
            const projectId = 'project-123';
            const largeImageSize = 8 * 1024 * 1024;
            const largeImageBuffer = Buffer.alloc(largeImageSize, 'test-data');
            const originalName = 'large-image.jpg';
            const mimeType = 'image/jpeg';
            mockRepository.saveShowcasePhoto = jest.fn().mockResolvedValue({
                filename: 'processed-image.jpg',
                originalName,
                mimeType,
                size: largeImageSize,
                uploadedAt: new Date()
            });
            mockRepository.findByProjectId = jest.fn().mockResolvedValue(null);
            mockRepository.create = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                showcasePhoto: {
                    filename: 'processed-image.jpg',
                    originalName,
                    mimeType,
                    size: largeImageSize,
                    uploadedAt: new Date()
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const startTime = performance.now();
            const result = await dealRoomService.uploadShowcasePhoto(projectId, largeImageBuffer, originalName, mimeType);
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            expect(result).toBeDefined();
            expect(result.showcasePhoto).toBeDefined();
            expect(processingTime).toBeLessThan(5000);
        });
        it('should handle multiple concurrent image uploads', async () => {
            const projectIds = ['project-1', 'project-2', 'project-3', 'project-4', 'project-5'];
            const imageSize = 2 * 1024 * 1024;
            const imageBuffer = Buffer.alloc(imageSize, 'test-data');
            mockRepository.saveShowcasePhoto = jest.fn().mockResolvedValue({
                filename: 'test-image.jpg',
                originalName: 'test.jpg',
                mimeType: 'image/jpeg',
                size: imageSize,
                uploadedAt: new Date()
            });
            mockRepository.findByProjectId = jest.fn().mockResolvedValue(null);
            mockRepository.create = jest.fn().mockImplementation((data) => Promise.resolve({
                id: `dr-${Math.random()}`,
                ...data,
                showcasePhoto: {
                    filename: 'test-image.jpg',
                    originalName: 'test.jpg',
                    mimeType: 'image/jpeg',
                    size: imageSize,
                    uploadedAt: new Date()
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            const startTime = performance.now();
            const uploadPromises = projectIds.map(projectId => dealRoomService.uploadShowcasePhoto(projectId, imageBuffer, 'test.jpg', 'image/jpeg'));
            const results = await Promise.all(uploadPromises);
            const endTime = performance.now();
            const totalProcessingTime = endTime - startTime;
            expect(results).toHaveLength(5);
            expect(results.every(result => result.showcasePhoto)).toBe(true);
            expect(totalProcessingTime).toBeLessThan(10000);
        });
        it('should handle image format conversion efficiently', async () => {
            const projectId = 'project-123';
            const pngImageSize = 4 * 1024 * 1024;
            const pngImageBuffer = Buffer.alloc(pngImageSize, 'png-data');
            mockRepository.saveShowcasePhoto = jest.fn().mockResolvedValue({
                filename: 'converted-image.jpg',
                originalName: 'original.png',
                mimeType: 'image/jpeg',
                size: pngImageSize * 0.7,
                uploadedAt: new Date()
            });
            mockRepository.findByProjectId = jest.fn().mockResolvedValue(null);
            mockRepository.create = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                showcasePhoto: {
                    filename: 'converted-image.jpg',
                    originalName: 'original.png',
                    mimeType: 'image/jpeg',
                    size: pngImageSize * 0.7,
                    uploadedAt: new Date()
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const startTime = performance.now();
            const result = await dealRoomService.uploadShowcasePhoto(projectId, pngImageBuffer, 'original.png', 'image/png');
            const endTime = performance.now();
            const conversionTime = endTime - startTime;
            expect(result.showcasePhoto?.mimeType).toBe('image/jpeg');
            expect(conversionTime).toBeLessThan(3000);
        });
    });
    describe('Large Content Processing Performance', () => {
        it('should handle very long investment summaries efficiently', async () => {
            const projectId = 'project-123';
            const longSummary = 'A'.repeat(9000);
            mockRepository.findByProjectId = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            mockRepository.update = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: longSummary,
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const startTime = performance.now();
            const result = await dealRoomService.updateInvestmentSummary(projectId, longSummary);
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            expect(result.investmentSummary).toBe(longSummary);
            expect(processingTime).toBeLessThan(1000);
        });
        it('should handle large numbers of key info items efficiently', async () => {
            const projectId = 'project-123';
            const largeKeyInfoList = Array.from({ length: 100 }, (_, i) => ({
                name: `Key Info Item ${i + 1}`,
                link: `https://example.com/item-${i + 1}`,
                order: i
            }));
            mockRepository.findByProjectId = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            mockRepository.update = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: largeKeyInfoList.map((item, index) => ({ ...item, id: `item-${index}` })),
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const startTime = performance.now();
            const result = await dealRoomService.updateKeyInfo(projectId, largeKeyInfoList);
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            expect(result.keyInfo).toHaveLength(100);
            expect(processingTime).toBeLessThan(2000);
        });
        it('should handle large numbers of external links efficiently', async () => {
            const projectId = 'project-123';
            const largeExternalLinksList = Array.from({ length: 50 }, (_, i) => ({
                name: `External Link ${i + 1}`,
                url: `https://external-site-${i + 1}.com`,
                order: i
            }));
            mockRepository.findByProjectId = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            mockRepository.update = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: largeExternalLinksList.map((link, index) => ({ ...link, id: `link-${index}` })),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const startTime = performance.now();
            const result = await dealRoomService.updateExternalLinks(projectId, largeExternalLinksList);
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            expect(result.externalLinks).toHaveLength(50);
            expect(processingTime).toBeLessThan(1500);
        });
    });
    describe('Auto-save Performance', () => {
        it('should handle rapid auto-save operations efficiently', async () => {
            const projectId = 'project-123';
            const sessionId = 'session-456';
            const numberOfSaves = 20;
            mockDraftRepository.findDraftByProjectAndSession = jest.fn().mockResolvedValue(null);
            mockDraftRepository.createDraft = jest.fn().mockImplementation((data) => Promise.resolve({
                id: `draft-${Math.random()}`,
                projectId: data.projectId,
                sessionId: data.sessionId,
                draftData: data.draftData,
                version: 1,
                isAutoSave: data.isAutoSave,
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }));
            const startTime = performance.now();
            const savePromises = Array.from({ length: numberOfSaves }, (_, i) => dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: `Auto-save content ${i + 1}`
            }, true));
            const results = await Promise.all(savePromises);
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const averageTimePerSave = totalTime / numberOfSaves;
            expect(results).toHaveLength(numberOfSaves);
            expect(averageTimePerSave).toBeLessThan(100);
            expect(totalTime).toBeLessThan(3000);
        });
        it('should handle concurrent auto-saves from multiple sessions', async () => {
            const projectId = 'project-123';
            const sessionIds = ['session-1', 'session-2', 'session-3', 'session-4', 'session-5'];
            mockDraftRepository.findDraftByProjectAndSession = jest.fn().mockResolvedValue(null);
            mockDraftRepository.createDraft = jest.fn().mockImplementation((data) => Promise.resolve({
                id: `draft-${Math.random()}`,
                projectId: data.projectId,
                sessionId: data.sessionId,
                draftData: data.draftData,
                version: 1,
                isAutoSave: data.isAutoSave,
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }));
            const startTime = performance.now();
            const savePromises = sessionIds.map(sessionId => dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: `Content from ${sessionId}`
            }, true));
            const results = await Promise.all(savePromises);
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            expect(results).toHaveLength(5);
            expect(totalTime).toBeLessThan(2000);
        });
    });
    describe('Memory Usage Performance', () => {
        it('should not cause memory leaks with repeated operations', async () => {
            const projectId = 'project-123';
            const iterations = 100;
            mockRepository.findByProjectId = jest.fn().mockResolvedValue({
                id: 'dr-123',
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            mockRepository.update = jest.fn().mockImplementation((_, updates) => Promise.resolve({
                id: 'dr-123',
                projectId,
                investmentBlurb: updates.investmentBlurb || '',
                investmentSummary: updates.investmentSummary || '',
                keyInfo: updates.keyInfo || [],
                externalLinks: updates.externalLinks || [],
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            const initialMemory = process.memoryUsage().heapUsed;
            for (let i = 0; i < iterations; i++) {
                await dealRoomService.updateInvestmentBlurb(projectId, `Blurb ${i}`);
                if (i % 10 === 0 && global.gc) {
                    global.gc();
                }
            }
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            const memoryIncreasePerOperation = memoryIncrease / iterations;
            expect(memoryIncreasePerOperation).toBeLessThan(1024);
        });
    });
    describe('Database Operation Performance', () => {
        it('should handle batch operations efficiently', async () => {
            const projectIds = Array.from({ length: 50 }, (_, i) => `project-${i + 1}`);
            mockRepository.findByProjectId = jest.fn().mockImplementation((projectId) => Promise.resolve({
                id: `dr-${projectId}`,
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            const startTime = performance.now();
            const retrievalPromises = projectIds.map(projectId => dealRoomService.getDealRoomByProjectId(projectId));
            const results = await Promise.all(retrievalPromises);
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const averageTimePerOperation = totalTime / projectIds.length;
            expect(results).toHaveLength(50);
            expect(averageTimePerOperation).toBeLessThan(50);
            expect(totalTime).toBeLessThan(5000);
        });
    });
});
//# sourceMappingURL=dealRoom.performance.test.js.map