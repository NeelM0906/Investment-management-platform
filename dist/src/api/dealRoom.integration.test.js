"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const DealRoomService_1 = require("../services/DealRoomService");
jest.mock('../services/DealRoomService');
jest.mock('../repositories/DealRoomRepository');
const createTestApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/api/projects/:id/deal-room', async (req, res) => {
        try {
            const dealRoomService = new DealRoomService_1.DealRoomService();
            const dealRoom = await dealRoomService.getOrCreateDealRoom(req.params.id);
            res.json({ success: true, data: dealRoom });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    });
    app.put('/api/projects/:id/deal-room', async (req, res) => {
        try {
            const dealRoomService = new DealRoomService_1.DealRoomService();
            const dealRoom = await dealRoomService.updateDealRoom(req.params.id, req.body);
            res.json({ success: true, data: dealRoom });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    });
    app.post('/api/projects/:id/deal-room/showcase-photo', async (req, res) => {
        try {
            const file = Buffer.from('fake image data');
            const originalName = 'test.jpg';
            const mimeType = 'image/jpeg';
            const dealRoomService = new DealRoomService_1.DealRoomService();
            const dealRoom = await dealRoomService.uploadShowcasePhoto(req.params.id, file, originalName, mimeType);
            res.json({ success: true, data: dealRoom });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('Invalid') ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    });
    app.delete('/api/projects/:id/deal-room/showcase-photo', async (req, res) => {
        try {
            const dealRoomService = new DealRoomService_1.DealRoomService();
            await dealRoomService.removeShowcasePhoto(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    });
    app.get('/api/projects/:id/deal-room/showcase-photo', async (req, res) => {
        try {
            const dealRoomService = new DealRoomService_1.DealRoomService();
            const photoData = await dealRoomService.getShowcasePhoto(req.params.id);
            if (!photoData) {
                return res.status(404).json({ success: false, error: { message: 'Photo not found' } });
            }
            res.setHeader('Content-Type', photoData.mimeType);
            res.send(photoData.buffer);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    });
    app.post('/api/projects/:id/deal-room/draft', async (req, res) => {
        try {
            const dealRoomService = new DealRoomService_1.DealRoomService();
            const draft = await dealRoomService.saveDraft(req.params.id, req.body.sessionId, req.body.draftData, req.body.isAutoSave);
            res.json({ success: true, data: draft });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('Conflict') ? 409 : 400;
            res.status(statusCode).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    conflictId: statusCode === 409 ? 'conflict-123' : undefined
                }
            });
        }
    });
    app.post('/api/projects/:id/deal-room/draft/publish', async (req, res) => {
        try {
            const dealRoomService = new DealRoomService_1.DealRoomService();
            const result = await dealRoomService.publishDraft(req.params.id, req.body.sessionId, req.body.changeDescription);
            res.json({ success: true, data: result });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    });
    app.get('/api/projects/:id/deal-room/save-status', async (req, res) => {
        try {
            const dealRoomService = new DealRoomService_1.DealRoomService();
            const status = await dealRoomService.getSaveStatus(req.params.id, req.query.sessionId);
            res.json({ success: true, data: status });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    });
    app.get('/api/projects/:id/deal-room/recover-changes', async (req, res) => {
        try {
            const dealRoomService = new DealRoomService_1.DealRoomService();
            const changes = await dealRoomService.recoverUnsavedChanges(req.params.id, req.query.sessionId);
            res.json({ success: true, data: changes });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    });
    return app;
};
describe('Deal Room API Integration Tests', () => {
    let app;
    let mockDealRoomService;
    const testProjectId = 'test-project-123';
    beforeAll(async () => {
        app = createTestApp();
    });
    beforeEach(() => {
        jest.clearAllMocks();
        mockDealRoomService = new DealRoomService_1.DealRoomService();
        mockDealRoomService.getOrCreateDealRoom = jest.fn();
        mockDealRoomService.updateDealRoom = jest.fn();
        mockDealRoomService.uploadShowcasePhoto = jest.fn();
        mockDealRoomService.removeShowcasePhoto = jest.fn();
        mockDealRoomService.getShowcasePhoto = jest.fn();
        mockDealRoomService.saveDraft = jest.fn();
        mockDealRoomService.publishDraft = jest.fn();
        mockDealRoomService.getSaveStatus = jest.fn();
        mockDealRoomService.recoverUnsavedChanges = jest.fn();
    });
    afterAll(async () => {
    });
    describe('GET /projects/:id/deal-room', () => {
        it('should get or create deal room for project', async () => {
            const mockDealRoom = {
                id: 'dr-123',
                projectId: testProjectId,
                investmentBlurb: 'Test blurb',
                investmentSummary: 'Test summary',
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDealRoomService.getOrCreateDealRoom.mockResolvedValue(mockDealRoom);
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${testProjectId}/deal-room`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(expect.objectContaining({
                id: 'dr-123',
                projectId: testProjectId
            }));
        });
        it('should return 500 for service errors', async () => {
            mockDealRoomService.getOrCreateDealRoom.mockRejectedValue(new Error('Service error'));
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${testProjectId}/deal-room`)
                .expect(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Service error');
        });
    });
    describe('PUT /projects/:id/deal-room', () => {
        it('should update deal room data', async () => {
            const updateData = {
                investmentBlurb: 'Updated blurb',
                investmentSummary: 'Updated summary'
            };
            const mockUpdatedDealRoom = {
                id: 'dr-123',
                projectId: testProjectId,
                ...updateData,
                keyInfo: [],
                externalLinks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDealRoomService.updateDealRoom.mockResolvedValue(mockUpdatedDealRoom);
            const response = await (0, supertest_1.default)(app)
                .put(`/api/projects/${testProjectId}/deal-room`)
                .send(updateData)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.investmentBlurb).toBe('Updated blurb');
            expect(mockDealRoomService.updateDealRoom).toHaveBeenCalledWith(testProjectId, updateData);
        });
        it('should validate input data', async () => {
            mockDealRoomService.updateDealRoom.mockRejectedValue(new Error('Validation failed'));
            const response = await (0, supertest_1.default)(app)
                .put(`/api/projects/${testProjectId}/deal-room`)
                .send({ investmentBlurb: 'a'.repeat(501) })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Validation failed');
        });
    });
    describe('POST /projects/:id/deal-room/showcase-photo', () => {
        it('should upload showcase photo', async () => {
            const mockDealRoom = {
                id: 'dr-123',
                projectId: testProjectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                showcasePhoto: {
                    filename: 'test.jpg',
                    originalName: 'test.jpg',
                    mimeType: 'image/jpeg',
                    size: 1024,
                    uploadedAt: new Date()
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockDealRoomService.uploadShowcasePhoto.mockResolvedValue(mockDealRoom);
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/deal-room/showcase-photo`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.showcasePhoto).toBeDefined();
        });
        it('should reject invalid file types', async () => {
            mockDealRoomService.uploadShowcasePhoto.mockRejectedValue(new Error('Invalid image format'));
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/deal-room/showcase-photo`)
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Invalid image format');
        });
        it('should reject files that are too large', async () => {
            mockDealRoomService.uploadShowcasePhoto.mockRejectedValue(new Error('File size too large'));
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/deal-room/showcase-photo`)
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('File size too large');
        });
    });
    describe('DELETE /projects/:id/deal-room/showcase-photo', () => {
        it('should remove showcase photo', async () => {
            mockDealRoomService.removeShowcasePhoto.mockResolvedValue(undefined);
            const response = await (0, supertest_1.default)(app)
                .delete(`/api/projects/${testProjectId}/deal-room/showcase-photo`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(mockDealRoomService.removeShowcasePhoto).toHaveBeenCalledWith(testProjectId);
        });
        it('should handle removal errors', async () => {
            mockDealRoomService.removeShowcasePhoto.mockRejectedValue(new Error('Photo not found'));
            const response = await (0, supertest_1.default)(app)
                .delete(`/api/projects/${testProjectId}/deal-room/showcase-photo`)
                .expect(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Photo not found');
        });
    });
    describe('GET /projects/:id/deal-room/showcase-photo', () => {
        it('should serve showcase photo', async () => {
            const mockPhotoData = {
                buffer: Buffer.from('fake image data'),
                mimeType: 'image/jpeg'
            };
            mockDealRoomService.getShowcasePhoto.mockResolvedValue(mockPhotoData);
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${testProjectId}/deal-room/showcase-photo`)
                .expect(200);
            expect(response.headers['content-type']).toBe('image/jpeg');
            expect(response.body).toEqual(mockPhotoData.buffer);
        });
        it('should return 404 for non-existent photo', async () => {
            mockDealRoomService.getShowcasePhoto.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${testProjectId}/deal-room/showcase-photo`)
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Photo not found');
        });
    });
    describe('POST /projects/:id/deal-room/draft', () => {
        it('should save draft successfully', async () => {
            const draftData = {
                sessionId: 'session-123',
                draftData: { investmentBlurb: 'Draft content' },
                isAutoSave: true
            };
            const mockDraft = {
                id: 'draft-123',
                projectId: testProjectId,
                sessionId: 'session-123',
                draftData: { investmentBlurb: 'Draft content' },
                version: 1,
                isAutoSave: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: new Date()
            };
            mockDealRoomService.saveDraft.mockResolvedValue(mockDraft);
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/deal-room/draft`)
                .send(draftData)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.version).toBe(1);
        });
        it('should handle validation errors', async () => {
            mockDealRoomService.saveDraft.mockRejectedValue(new Error('Validation failed'));
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/deal-room/draft`)
                .send({
                sessionId: 'session-123',
                draftData: { investmentBlurb: 'a'.repeat(501) },
                isAutoSave: false
            })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Validation failed');
        });
        it('should handle conflicts with 409 status', async () => {
            mockDealRoomService.saveDraft.mockRejectedValue(new Error('Conflict detected'));
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/deal-room/draft`)
                .send({
                sessionId: 'session-123',
                draftData: { investmentBlurb: 'Conflicting content' },
                isAutoSave: false
            })
                .expect(409);
            expect(response.body.success).toBe(false);
            expect(response.body.error.conflictId).toBe('conflict-123');
        });
    });
    describe('POST /projects/:id/deal-room/draft/publish', () => {
        it('should publish draft successfully', async () => {
            const publishData = {
                sessionId: 'session-123',
                changeDescription: 'Updated investment blurb'
            };
            const mockResult = {
                dealRoom: {
                    id: 'dr-123',
                    projectId: testProjectId,
                    investmentBlurb: 'Published content',
                    investmentSummary: '',
                    keyInfo: [],
                    externalLinks: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                version: { version: 2, createdAt: new Date() }
            };
            mockDealRoomService.publishDraft.mockResolvedValue(mockResult);
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/deal-room/draft/publish`)
                .send(publishData)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.version.version).toBe(2);
        });
        it('should return 404 when no draft found', async () => {
            mockDealRoomService.publishDraft.mockRejectedValue(new Error('No draft found to publish'));
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/deal-room/draft/publish`)
                .send({
                sessionId: 'session-123',
                changeDescription: 'Test publish'
            })
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('No draft found to publish');
        });
    });
    describe('GET /projects/:id/deal-room/save-status', () => {
        it('should return save status', async () => {
            const mockStatus = {
                status: 'saved',
                lastSaved: new Date(),
                hasUnsavedChanges: false,
                version: 2
            };
            mockDealRoomService.getSaveStatus.mockResolvedValue(mockStatus);
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${testProjectId}/deal-room/save-status`)
                .query({ sessionId: 'session-123' })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('saved');
            expect(response.body.data.version).toBe(2);
        });
    });
    describe('GET /projects/:id/deal-room/recover-changes', () => {
        it('should recover unsaved changes', async () => {
            const mockChanges = {
                draftData: { investmentBlurb: 'Recovered content' },
                version: 3
            };
            mockDealRoomService.recoverUnsavedChanges.mockResolvedValue(mockChanges);
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${testProjectId}/deal-room/recover-changes`)
                .query({ sessionId: 'session-123' })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.draftData.investmentBlurb).toBe('Recovered content');
        });
        it('should return null when no changes to recover', async () => {
            mockDealRoomService.recoverUnsavedChanges.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${testProjectId}/deal-room/recover-changes`)
                .query({ sessionId: 'session-123' })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeNull();
        });
    });
});
//# sourceMappingURL=dealRoom.integration.test.js.map