"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DealRoomService_1 = require("../services/DealRoomService");
const DealRoomRepository_1 = require("../repositories/DealRoomRepository");
const DealRoomDraftRepository_1 = require("../repositories/DealRoomDraftRepository");
jest.mock('../repositories/DealRoomRepository');
jest.mock('../repositories/DealRoomDraftRepository');
describe('Deal Room End-to-End Tests', () => {
    let dealRoomService;
    let mockRepository;
    let mockDraftRepository;
    let dealRooms = new Map();
    let drafts = new Map();
    let versions = [];
    beforeEach(() => {
        dealRoomService = new DealRoomService_1.DealRoomService();
        mockRepository = new DealRoomRepository_1.DealRoomRepository();
        mockDraftRepository = new DealRoomDraftRepository_1.DealRoomDraftRepository();
        dealRoomService.dealRoomRepository = mockRepository;
        dealRoomService.draftRepository = mockDraftRepository;
        dealRooms.clear();
        drafts.clear();
        versions.length = 0;
        setupRepositoryMocks();
    });
    const setupRepositoryMocks = () => {
        mockRepository.findByProjectId = jest.fn().mockImplementation((projectId) => {
            const dealRoom = Array.from(dealRooms.values()).find(dr => dr.projectId === projectId);
            return Promise.resolve(dealRoom || null);
        });
        mockRepository.create = jest.fn().mockImplementation((data) => {
            const dealRoom = {
                id: `dr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                projectId: data.projectId,
                investmentBlurb: data.investmentBlurb,
                investmentSummary: data.investmentSummary,
                keyInfo: data.keyInfo.map((item, index) => ({ ...item, id: `item_${index}` })),
                externalLinks: data.externalLinks.map((link, index) => ({ ...link, id: `link_${index}` })),
                showcasePhoto: data.showcasePhoto,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            dealRooms.set(dealRoom.id, dealRoom);
            return Promise.resolve(dealRoom);
        });
        mockRepository.update = jest.fn().mockImplementation((projectId, updates) => {
            const existingDealRoom = Array.from(dealRooms.values()).find(dr => dr.projectId === projectId);
            if (!existingDealRoom) {
                throw new Error('Deal room not found');
            }
            const updatedDealRoom = {
                ...existingDealRoom,
                ...updates,
                updatedAt: new Date()
            };
            dealRooms.set(updatedDealRoom.id, updatedDealRoom);
            return Promise.resolve(updatedDealRoom);
        });
        mockDraftRepository.findDraftByProjectAndSession = jest.fn().mockImplementation((projectId, sessionId) => {
            const draftKey = `${projectId}_${sessionId}`;
            return Promise.resolve(drafts.get(draftKey) || null);
        });
        mockDraftRepository.createDraft = jest.fn().mockImplementation((data) => {
            const draftKey = `${data.projectId}_${data.sessionId}`;
            const existingDraft = drafts.get(draftKey);
            const draft = {
                id: existingDraft?.id || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                projectId: data.projectId,
                sessionId: data.sessionId,
                draftData: data.draftData,
                version: existingDraft ? existingDraft.version + 1 : 1,
                isAutoSave: data.isAutoSave,
                createdAt: existingDraft?.createdAt || new Date(),
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
            drafts.set(draftKey, draft);
            return Promise.resolve(draft);
        });
        mockDraftRepository.deleteDraft = jest.fn().mockImplementation((projectId, sessionId) => {
            const draftKey = `${projectId}_${sessionId}`;
            const existed = drafts.has(draftKey);
            drafts.delete(draftKey);
            return Promise.resolve(existed);
        });
        mockDraftRepository.createVersion = jest.fn().mockImplementation((projectId, data, changeDescription) => {
            const version = {
                id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                projectId,
                version: versions.filter(v => v.projectId === projectId).length + 1,
                data,
                changeDescription,
                createdAt: new Date()
            };
            versions.push(version);
            return Promise.resolve(version);
        });
    };
    describe('Complete Deal Room Creation Workflow', () => {
        it('should create a complete deal room from scratch', async () => {
            const projectId = 'project-123';
            const initialDealRoom = await dealRoomService.getOrCreateDealRoom(projectId);
            expect(initialDealRoom).toBeDefined();
            expect(initialDealRoom.projectId).toBe(projectId);
            expect(initialDealRoom.investmentBlurb).toBe('');
            expect(initialDealRoom.investmentSummary).toBe('');
            expect(initialDealRoom.keyInfo).toHaveLength(0);
            expect(initialDealRoom.externalLinks).toHaveLength(0);
            const blurbUpdate = await dealRoomService.updateInvestmentBlurb(projectId, 'This is an exciting investment opportunity in renewable energy.');
            expect(blurbUpdate.investmentBlurb).toBe('This is an exciting investment opportunity in renewable energy.');
            const summaryUpdate = await dealRoomService.updateInvestmentSummary(projectId, 'Our company is developing cutting-edge solar technology that will revolutionize the energy sector. We are seeking $5M in Series A funding to scale our operations and bring our product to market.');
            expect(summaryUpdate.investmentSummary).toContain('cutting-edge solar technology');
            const keyInfoItems = [
                { name: 'Business Plan', link: 'https://example.com/business-plan.pdf', order: 0 },
                { name: 'Financial Projections', link: 'https://example.com/financials.xlsx', order: 1 },
                { name: 'Market Analysis', link: 'https://example.com/market-analysis.pdf', order: 2 }
            ];
            const keyInfoUpdate = await dealRoomService.updateKeyInfo(projectId, keyInfoItems);
            expect(keyInfoUpdate.keyInfo).toHaveLength(3);
            expect(keyInfoUpdate.keyInfo[0].name).toBe('Business Plan');
            const externalLinks = [
                { name: 'Company Website', url: 'https://ourcompany.com', order: 0 },
                { name: 'Product Demo', url: 'https://demo.ourcompany.com', order: 1 }
            ];
            const externalLinksUpdate = await dealRoomService.updateExternalLinks(projectId, externalLinks);
            expect(externalLinksUpdate.externalLinks).toHaveLength(2);
            expect(externalLinksUpdate.externalLinks[0].name).toBe('Company Website');
            const imageBuffer = Buffer.from('fake-image-data');
            const photoUpdate = await dealRoomService.uploadShowcasePhoto(projectId, imageBuffer, 'company-photo.jpg', 'image/jpeg');
            expect(photoUpdate.showcasePhoto).toBeDefined();
            expect(photoUpdate.showcasePhoto?.originalName).toBe('company-photo.jpg');
            const finalDealRoom = await dealRoomService.getDealRoomByProjectId(projectId);
            expect(finalDealRoom).toBeDefined();
            expect(finalDealRoom.investmentBlurb).toBe('This is an exciting investment opportunity in renewable energy.');
            expect(finalDealRoom.investmentSummary).toContain('cutting-edge solar technology');
            expect(finalDealRoom.keyInfo).toHaveLength(3);
            expect(finalDealRoom.externalLinks).toHaveLength(2);
            expect(finalDealRoom.showcasePhoto).toBeDefined();
        });
    });
    describe('Draft Management Workflow', () => {
        it('should handle complete draft lifecycle', async () => {
            const projectId = 'project-456';
            const sessionId = 'session-789';
            await dealRoomService.getOrCreateDealRoom(projectId);
            const initialDraft = await dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: 'Draft investment blurb'
            }, true);
            expect(initialDraft.version).toBe(1);
            expect(initialDraft.draftData.investmentBlurb).toBe('Draft investment blurb');
            expect(initialDraft.isAutoSave).toBe(true);
            const secondDraft = await dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: 'Updated draft blurb',
                investmentSummary: 'Draft summary'
            }, true);
            expect(secondDraft.version).toBe(2);
            expect(secondDraft.draftData.investmentSummary).toBe('Draft summary');
            const manualSave = await dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: 'Final draft blurb',
                investmentSummary: 'Final draft summary',
                keyInfo: [
                    { name: 'Draft Document', link: 'https://example.com/draft.pdf', order: 0 }
                ]
            }, false);
            expect(manualSave.version).toBe(3);
            expect(manualSave.isAutoSave).toBe(false);
            const publishResult = await dealRoomService.publishDraft(projectId, sessionId, 'Published initial deal room content');
            expect(publishResult.dealRoom.investmentBlurb).toBe('Final draft blurb');
            expect(publishResult.dealRoom.investmentSummary).toBe('Final draft summary');
            expect(publishResult.dealRoom.keyInfo).toHaveLength(1);
            expect(publishResult.version.changeDescription).toBe('Published initial deal room content');
            const draftKey = `${projectId}_${sessionId}`;
            expect(drafts.has(draftKey)).toBe(false);
            expect(versions).toHaveLength(1);
            expect(versions[0].projectId).toBe(projectId);
        });
        it('should handle draft recovery after browser crash', async () => {
            const projectId = 'project-recovery';
            const sessionId = 'session-recovery';
            await dealRoomService.getOrCreateDealRoom(projectId);
            const originalDraft = await dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: 'Unsaved work before crash',
                investmentSummary: 'Important content that must not be lost'
            }, true);
            expect(originalDraft.draftData.investmentBlurb).toBe('Unsaved work before crash');
            const recoveredChanges = await dealRoomService.recoverUnsavedChanges(projectId, sessionId);
            expect(recoveredChanges).toBeDefined();
            expect(recoveredChanges.draftData.investmentBlurb).toBe('Unsaved work before crash');
            expect(recoveredChanges.draftData.investmentSummary).toBe('Important content that must not be lost');
            const continuedDraft = await dealRoomService.saveDraft(projectId, sessionId, {
                ...recoveredChanges.draftData,
                keyInfo: [
                    { name: 'Recovered Document', link: 'https://example.com/recovered.pdf', order: 0 }
                ]
            }, false);
            expect(continuedDraft.draftData.keyInfo).toHaveLength(1);
            expect(continuedDraft.version).toBeGreaterThan(originalDraft.version);
        });
    });
    describe('Conflict Resolution Workflow', () => {
        it('should handle concurrent editing conflicts', async () => {
            const projectId = 'project-conflict';
            const sessionId1 = 'session-user1';
            const sessionId2 = 'session-user2';
            await dealRoomService.getOrCreateDealRoom(projectId);
            const user1Draft = await dealRoomService.saveDraft(projectId, sessionId1, {
                investmentBlurb: 'User 1 version of the blurb'
            }, false);
            const user2Draft = await dealRoomService.saveDraft(projectId, sessionId2, {
                investmentBlurb: 'User 2 version of the blurb'
            }, false);
            expect(user1Draft.draftData.investmentBlurb).toBe('User 1 version of the blurb');
            expect(user2Draft.draftData.investmentBlurb).toBe('User 2 version of the blurb');
            const user1Publish = await dealRoomService.publishDraft(projectId, sessionId1, 'User 1 published changes');
            expect(user1Publish.dealRoom.investmentBlurb).toBe('User 1 version of the blurb');
            try {
                mockDraftRepository.createVersion = jest.fn().mockRejectedValue(new Error('Conflict detected: concurrent modification'));
                await dealRoomService.publishDraft(projectId, sessionId2, 'User 2 attempted publish');
                expect(true).toBe(false);
            }
            catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain('Conflict detected');
            }
            const mergedContent = {
                investmentBlurb: 'User 1 version of the blurb',
                investmentSummary: 'User 2 added this summary'
            };
            mockDraftRepository.createVersion = jest.fn().mockImplementation((projectId, data, changeDescription) => {
                const version = {
                    id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    projectId,
                    version: versions.filter(v => v.projectId === projectId).length + 1,
                    data,
                    changeDescription,
                    createdAt: new Date()
                };
                versions.push(version);
                return Promise.resolve(version);
            });
            const resolvedDraft = await dealRoomService.saveDraft(projectId, sessionId2, mergedContent, false);
            const resolvedPublish = await dealRoomService.publishDraft(projectId, sessionId2, 'User 2 resolved conflict and added summary');
            expect(resolvedPublish.dealRoom.investmentBlurb).toBe('User 1 version of the blurb');
            expect(resolvedPublish.dealRoom.investmentSummary).toBe('User 2 added this summary');
        });
    });
    describe('Version History Workflow', () => {
        it('should maintain complete version history', async () => {
            const projectId = 'project-versioning';
            const sessionId = 'session-versioning';
            await dealRoomService.getOrCreateDealRoom(projectId);
            await dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: 'Version 1 blurb'
            }, false);
            const version1 = await dealRoomService.publishDraft(projectId, sessionId, 'Initial version');
            expect(version1.version.version).toBe(1);
            expect(version1.version.changeDescription).toBe('Initial version');
            await dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: 'Version 2 blurb',
                investmentSummary: 'Added summary in version 2'
            }, false);
            const version2 = await dealRoomService.publishDraft(projectId, sessionId, 'Added investment summary');
            expect(version2.version.version).toBe(2);
            await dealRoomService.saveDraft(projectId, sessionId, {
                investmentBlurb: 'Version 3 blurb',
                investmentSummary: 'Updated summary in version 3',
                keyInfo: [
                    { name: 'New Document', link: 'https://example.com/new.pdf', order: 0 }
                ]
            }, false);
            const version3 = await dealRoomService.publishDraft(projectId, sessionId, 'Added key info section');
            expect(version3.version.version).toBe(3);
            expect(versions.filter(v => v.projectId === projectId)).toHaveLength(3);
            const projectVersions = versions
                .filter(v => v.projectId === projectId)
                .sort((a, b) => a.version - b.version);
            expect(projectVersions[0].data.investmentBlurb).toBe('Version 1 blurb');
            expect(projectVersions[1].data.investmentSummary).toBe('Added summary in version 2');
            expect(projectVersions[2].data.keyInfo).toHaveLength(1);
        });
    });
    describe('Data Validation Workflow', () => {
        it('should validate all data throughout the workflow', async () => {
            const projectId = 'project-validation';
            await dealRoomService.getOrCreateDealRoom(projectId);
            try {
                await dealRoomService.updateInvestmentBlurb(projectId, 'a'.repeat(501));
                expect(true).toBe(false);
            }
            catch (error) {
                expect(error.message).toContain('500 characters');
            }
            try {
                await dealRoomService.updateInvestmentSummary(projectId, 'a'.repeat(10001));
                expect(true).toBe(false);
            }
            catch (error) {
                expect(error.message).toContain('10,000 characters');
            }
            try {
                await dealRoomService.updateKeyInfo(projectId, [
                    { name: 'Invalid Link', link: 'not-a-url', order: 0 }
                ]);
                expect(true).toBe(false);
            }
            catch (error) {
                expect(error.message).toContain('valid URL');
            }
            try {
                await dealRoomService.updateExternalLinks(projectId, [
                    { name: 'Invalid URL', url: 'also-not-a-url', order: 0 }
                ]);
                expect(true).toBe(false);
            }
            catch (error) {
                expect(error.message).toContain('valid URL');
            }
            const validUpdate = await dealRoomService.updateDealRoom(projectId, {
                investmentBlurb: 'Valid blurb under 500 characters',
                investmentSummary: 'Valid summary under 10,000 characters',
                keyInfo: [
                    { name: 'Valid Document', link: 'https://example.com/valid.pdf', order: 0 }
                ],
                externalLinks: [
                    { name: 'Valid Website', url: 'https://validwebsite.com', order: 0 }
                ]
            });
            expect(validUpdate.investmentBlurb).toBe('Valid blurb under 500 characters');
            expect(validUpdate.keyInfo).toHaveLength(1);
            expect(validUpdate.externalLinks).toHaveLength(1);
        });
    });
});
//# sourceMappingURL=dealRoom.e2e.test.js.map