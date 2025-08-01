"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const DealRoomDraftRepository_1 = require("./DealRoomDraftRepository");
jest.mock('fs/promises');
const mockFs = promises_1.default;
describe('DealRoomDraftRepository', () => {
    let repository;
    const testDataDir = path_1.default.join(process.cwd(), 'data');
    beforeEach(() => {
        repository = new DealRoomDraftRepository_1.DealRoomDraftRepository();
        jest.clearAllMocks();
    });
    describe('ensureDataFilesExist', () => {
        it('creates data files if they do not exist', async () => {
            mockFs.access.mockRejectedValue(new Error('File not found'));
            mockFs.mkdir.mockResolvedValue(undefined);
            mockFs.writeFile.mockResolvedValue(undefined);
            await repository.ensureDataFilesExist();
            expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true });
            expect(mockFs.writeFile).toHaveBeenCalledTimes(3);
            expect(mockFs.writeFile).toHaveBeenCalledWith(path_1.default.join(testDataDir, 'deal-room-drafts.json'), JSON.stringify([], null, 2));
        });
        it('does not create files if they already exist', async () => {
            mockFs.access.mockResolvedValue(undefined);
            await repository.ensureDataFilesExist();
            expect(mockFs.mkdir).not.toHaveBeenCalled();
            expect(mockFs.writeFile).not.toHaveBeenCalled();
        });
    });
    describe('readDrafts', () => {
        it('reads and parses draft data correctly', async () => {
            const mockDrafts = [
                {
                    id: 'draft-1',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    draftData: { investmentBlurb: 'Test' },
                    version: 1,
                    isAutoSave: true,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                    expiresAt: '2023-01-02T00:00:00.000Z'
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockDrafts));
            const result = await repository.readDrafts();
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('draft-1');
            expect(result[0].createdAt).toBeInstanceOf(Date);
            expect(result[0].updatedAt).toBeInstanceOf(Date);
            expect(result[0].expiresAt).toBeInstanceOf(Date);
        });
        it('filters out expired drafts', async () => {
            const now = new Date();
            const expired = new Date(now.getTime() - 1000);
            const valid = new Date(now.getTime() + 1000);
            const mockDrafts = [
                {
                    id: 'draft-expired',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: expired.toISOString(),
                    updatedAt: expired.toISOString(),
                    expiresAt: expired.toISOString()
                },
                {
                    id: 'draft-valid',
                    projectId: 'project-2',
                    sessionId: 'session-2',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: valid.toISOString(),
                    updatedAt: valid.toISOString(),
                    expiresAt: valid.toISOString()
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockDrafts));
            mockFs.writeFile.mockResolvedValue(undefined);
            const result = await repository.readDrafts();
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('draft-valid');
            expect(mockFs.writeFile).toHaveBeenCalled();
        });
        it('returns empty array on read error', async () => {
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockRejectedValue(new Error('Read error'));
            const result = await repository.readDrafts();
            expect(result).toEqual([]);
        });
        it('handles showcase photo date conversion', async () => {
            const mockDrafts = [
                {
                    id: 'draft-1',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    draftData: {
                        showcasePhoto: {
                            filename: 'test.jpg',
                            originalName: 'test.jpg',
                            mimeType: 'image/jpeg',
                            size: 1024,
                            uploadedAt: '2023-01-01T00:00:00.000Z'
                        }
                    },
                    version: 1,
                    isAutoSave: true,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                    expiresAt: '2023-01-02T00:00:00.000Z'
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockDrafts));
            const result = await repository.readDrafts();
            expect(result[0].draftData.showcasePhoto?.uploadedAt).toBeInstanceOf(Date);
        });
    });
    describe('writeDrafts', () => {
        it('writes draft data to file', async () => {
            const drafts = [
                {
                    id: 'draft-1',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    expiresAt: new Date()
                }
            ];
            mockFs.writeFile.mockResolvedValue(undefined);
            await repository.writeDrafts(drafts);
            expect(mockFs.writeFile).toHaveBeenCalledWith(path_1.default.join(testDataDir, 'deal-room-drafts.json'), JSON.stringify(drafts, null, 2));
        });
        it('throws error on write failure', async () => {
            mockFs.writeFile.mockRejectedValue(new Error('Write error'));
            await expect(repository.writeDrafts([])).rejects.toThrow('Failed to save draft data');
        });
    });
    describe('findDraftByProjectAndSession', () => {
        it('finds draft by project and session ID', async () => {
            const mockDrafts = [
                {
                    id: 'draft-1',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                    expiresAt: '2023-01-02T00:00:00.000Z'
                },
                {
                    id: 'draft-2',
                    projectId: 'project-2',
                    sessionId: 'session-2',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                    expiresAt: '2023-01-02T00:00:00.000Z'
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockDrafts));
            const result = await repository.findDraftByProjectAndSession('project-1', 'session-1');
            expect(result).not.toBeNull();
            expect(result.id).toBe('draft-1');
        });
        it('returns null when draft not found', async () => {
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([]));
            const result = await repository.findDraftByProjectAndSession('project-1', 'session-1');
            expect(result).toBeNull();
        });
    });
    describe('findDraftsByProject', () => {
        it('finds all drafts for a project', async () => {
            const mockDrafts = [
                {
                    id: 'draft-1',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                    expiresAt: '2023-01-02T00:00:00.000Z'
                },
                {
                    id: 'draft-2',
                    projectId: 'project-1',
                    sessionId: 'session-2',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                    expiresAt: '2023-01-02T00:00:00.000Z'
                },
                {
                    id: 'draft-3',
                    projectId: 'project-2',
                    sessionId: 'session-3',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                    expiresAt: '2023-01-02T00:00:00.000Z'
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockDrafts));
            const result = await repository.findDraftsByProject('project-1');
            expect(result).toHaveLength(2);
            expect(result.every(draft => draft.projectId === 'project-1')).toBe(true);
        });
    });
    describe('createDraft', () => {
        it('creates new draft when none exists', async () => {
            const createData = {
                projectId: 'project-1',
                sessionId: 'session-1',
                draftData: { investmentBlurb: 'Test' },
                isAutoSave: true
            };
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([]));
            mockFs.writeFile.mockResolvedValue(undefined);
            const result = await repository.createDraft(createData);
            expect(result.projectId).toBe('project-1');
            expect(result.sessionId).toBe('session-1');
            expect(result.draftData).toEqual({ investmentBlurb: 'Test' });
            expect(result.version).toBe(1);
            expect(result.id).toMatch(/^draft_/);
            expect(mockFs.writeFile).toHaveBeenCalled();
        });
        it('updates existing draft when one exists', async () => {
            const existingDraft = {
                id: 'existing-draft',
                projectId: 'project-1',
                sessionId: 'session-1',
                draftData: { investmentBlurb: 'Old' },
                version: 2,
                lastSavedVersion: 1,
                isAutoSave: true,
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z',
                expiresAt: '2023-01-02T00:00:00.000Z'
            };
            const createData = {
                projectId: 'project-1',
                sessionId: 'session-1',
                draftData: { investmentBlurb: 'New' },
                isAutoSave: false
            };
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([existingDraft]));
            mockFs.writeFile.mockResolvedValue(undefined);
            const result = await repository.createDraft(createData);
            expect(result.id).toBe('existing-draft');
            expect(result.version).toBe(3);
            expect(result.draftData).toEqual({ investmentBlurb: 'New' });
            expect(result.isAutoSave).toBe(false);
            expect(result.lastSavedVersion).toBe(1);
        });
    });
    describe('updateDraft', () => {
        it('updates existing draft', async () => {
            const existingDraft = {
                id: 'draft-1',
                projectId: 'project-1',
                sessionId: 'session-1',
                draftData: { investmentBlurb: 'Old' },
                version: 1,
                isAutoSave: true,
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z',
                expiresAt: '2023-01-02T00:00:00.000Z'
            };
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([existingDraft]));
            mockFs.writeFile.mockResolvedValue(undefined);
            const result = await repository.updateDraft('project-1', 'session-1', {
                draftData: { investmentSummary: 'New summary' },
                isAutoSave: false
            });
            expect(result.draftData).toEqual({
                investmentBlurb: 'Old',
                investmentSummary: 'New summary'
            });
            expect(result.version).toBe(2);
            expect(result.isAutoSave).toBe(false);
        });
        it('throws error when draft not found', async () => {
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([]));
            await expect(repository.updateDraft('project-1', 'session-1', {})).rejects.toThrow('Draft not found');
        });
        it('extends expiration time on update', async () => {
            const existingDraft = {
                id: 'draft-1',
                projectId: 'project-1',
                sessionId: 'session-1',
                draftData: {},
                version: 1,
                isAutoSave: true,
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z',
                expiresAt: '2023-01-02T00:00:00.000Z'
            };
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([existingDraft]));
            mockFs.writeFile.mockResolvedValue(undefined);
            const result = await repository.updateDraft('project-1', 'session-1', {});
            expect(result.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
        });
    });
    describe('deleteDraft', () => {
        it('deletes existing draft', async () => {
            const existingDraft = {
                id: 'draft-1',
                projectId: 'project-1',
                sessionId: 'session-1',
                draftData: {},
                version: 1,
                isAutoSave: true,
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z',
                expiresAt: '2023-01-02T00:00:00.000Z'
            };
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([existingDraft]));
            mockFs.writeFile.mockResolvedValue(undefined);
            const result = await repository.deleteDraft('project-1', 'session-1');
            expect(result).toBe(true);
            expect(mockFs.writeFile).toHaveBeenCalledWith(path_1.default.join(testDataDir, 'deal-room-drafts.json'), JSON.stringify([], null, 2));
        });
        it('returns false when draft not found', async () => {
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([]));
            const result = await repository.deleteDraft('project-1', 'session-1');
            expect(result).toBe(false);
        });
    });
    describe('cleanupExpiredDrafts', () => {
        it('removes expired drafts and returns count', async () => {
            const now = new Date();
            const expired = new Date(now.getTime() - 1000);
            const valid = new Date(now.getTime() + 1000);
            const mockDrafts = [
                {
                    id: 'draft-expired-1',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: expired.toISOString(),
                    updatedAt: expired.toISOString(),
                    expiresAt: expired.toISOString()
                },
                {
                    id: 'draft-expired-2',
                    projectId: 'project-2',
                    sessionId: 'session-2',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: expired.toISOString(),
                    updatedAt: expired.toISOString(),
                    expiresAt: expired.toISOString()
                },
                {
                    id: 'draft-valid',
                    projectId: 'project-3',
                    sessionId: 'session-3',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: valid.toISOString(),
                    updatedAt: valid.toISOString(),
                    expiresAt: valid.toISOString()
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockDrafts));
            mockFs.writeFile.mockResolvedValue(undefined);
            const expiredCount = await repository.cleanupExpiredDrafts();
            expect(expiredCount).toBe(2);
            expect(mockFs.writeFile).toHaveBeenCalledWith(path_1.default.join(testDataDir, 'deal-room-drafts.json'), expect.stringContaining('draft-valid'));
        });
        it('returns 0 when no drafts are expired', async () => {
            const valid = new Date(Date.now() + 1000);
            const mockDrafts = [
                {
                    id: 'draft-valid',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    draftData: {},
                    version: 1,
                    isAutoSave: true,
                    createdAt: valid.toISOString(),
                    updatedAt: valid.toISOString(),
                    expiresAt: valid.toISOString()
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockDrafts));
            const expiredCount = await repository.cleanupExpiredDrafts();
            expect(expiredCount).toBe(0);
            expect(mockFs.writeFile).not.toHaveBeenCalled();
        });
    });
    describe('createVersion', () => {
        it('creates new version with incremented version number', async () => {
            const existingVersions = [
                {
                    id: 'version-1',
                    projectId: 'project-1',
                    version: 1,
                    data: { investmentBlurb: 'Version 1' },
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: 'version-2',
                    projectId: 'project-1',
                    version: 2,
                    data: { investmentBlurb: 'Version 2' },
                    createdAt: '2023-01-01T00:00:00.000Z'
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(existingVersions));
            mockFs.writeFile.mockResolvedValue(undefined);
            const versionData = {
                showcasePhoto: undefined,
                investmentBlurb: 'Version 3',
                investmentSummary: 'Summary',
                keyInfo: [],
                externalLinks: []
            };
            const result = await repository.createVersion('project-1', versionData, 'Updated investment blurb', 'user-123');
            expect(result.projectId).toBe('project-1');
            expect(result.version).toBe(3);
            expect(result.data).toEqual(versionData);
            expect(result.changeDescription).toBe('Updated investment blurb');
            expect(result.createdBy).toBe('user-123');
            expect(result.id).toMatch(/^version_/);
        });
        it('starts with version 1 for new project', async () => {
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([]));
            mockFs.writeFile.mockResolvedValue(undefined);
            const versionData = {
                showcasePhoto: undefined,
                investmentBlurb: 'First version',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: []
            };
            const result = await repository.createVersion('project-1', versionData);
            expect(result.version).toBe(1);
        });
        it('limits versions to 10 per project', async () => {
            const existingVersions = Array.from({ length: 12 }, (_, i) => ({
                id: `version-${i + 1}`,
                projectId: 'project-1',
                version: i + 1,
                data: { investmentBlurb: `Version ${i + 1}` },
                createdAt: '2023-01-01T00:00:00.000Z'
            }));
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(existingVersions));
            mockFs.writeFile.mockResolvedValue(undefined);
            const versionData = {
                showcasePhoto: undefined,
                investmentBlurb: 'Version 13',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: []
            };
            await repository.createVersion('project-1', versionData);
            const writeCall = mockFs.writeFile.mock.calls.find(call => call[0].includes('deal-room-versions.json'));
            expect(writeCall).toBeDefined();
            const savedVersions = JSON.parse(writeCall[1]);
            const projectVersions = savedVersions.filter((v) => v.projectId === 'project-1');
            expect(projectVersions).toHaveLength(10);
        });
    });
    describe('getVersionsByProject', () => {
        it('returns versions for project sorted by version descending', async () => {
            const mockVersions = [
                {
                    id: 'version-1',
                    projectId: 'project-1',
                    version: 1,
                    data: { investmentBlurb: 'Version 1' },
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: 'version-3',
                    projectId: 'project-1',
                    version: 3,
                    data: { investmentBlurb: 'Version 3' },
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: 'version-2',
                    projectId: 'project-1',
                    version: 2,
                    data: { investmentBlurb: 'Version 2' },
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: 'version-other',
                    projectId: 'project-2',
                    version: 1,
                    data: { investmentBlurb: 'Other project' },
                    createdAt: '2023-01-01T00:00:00.000Z'
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockVersions));
            const result = await repository.getVersionsByProject('project-1');
            expect(result).toHaveLength(3);
            expect(result[0].version).toBe(3);
            expect(result[1].version).toBe(2);
            expect(result[2].version).toBe(1);
        });
        it('respects limit parameter', async () => {
            const mockVersions = Array.from({ length: 15 }, (_, i) => ({
                id: `version-${i + 1}`,
                projectId: 'project-1',
                version: i + 1,
                data: { investmentBlurb: `Version ${i + 1}` },
                createdAt: '2023-01-01T00:00:00.000Z'
            }));
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockVersions));
            const result = await repository.getVersionsByProject('project-1', 5);
            expect(result).toHaveLength(5);
            expect(result[0].version).toBe(15);
        });
    });
    describe('createConflict', () => {
        it('creates new conflict resolution record', async () => {
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([]));
            mockFs.writeFile.mockResolvedValue(undefined);
            const conflictData = {
                projectId: 'project-1',
                sessionId: 'session-1',
                conflictType: 'concurrent_edit',
                localVersion: 2,
                serverVersion: 3,
                localData: { investmentBlurb: 'Local' },
                serverData: { investmentBlurb: 'Server' },
                conflictFields: ['investmentBlurb']
            };
            const result = await repository.createConflict(conflictData);
            expect(result.projectId).toBe('project-1');
            expect(result.conflictType).toBe('concurrent_edit');
            expect(result.conflictId).toMatch(/^conflict_/);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.resolvedAt).toBeUndefined();
        });
    });
    describe('resolveConflict', () => {
        it('resolves existing conflict', async () => {
            const existingConflict = {
                conflictId: 'conflict-123',
                projectId: 'project-1',
                sessionId: 'session-1',
                conflictType: 'concurrent_edit',
                localVersion: 2,
                serverVersion: 3,
                localData: { investmentBlurb: 'Local' },
                serverData: { investmentBlurb: 'Server' },
                conflictFields: ['investmentBlurb'],
                createdAt: '2023-01-01T00:00:00.000Z'
            };
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([existingConflict]));
            mockFs.writeFile.mockResolvedValue(undefined);
            const resolvedData = { investmentBlurb: 'Merged' };
            const result = await repository.resolveConflict('conflict-123', 'merge', resolvedData);
            expect(result.resolution).toBe('merge');
            expect(result.resolvedData).toEqual(resolvedData);
            expect(result.resolvedAt).toBeInstanceOf(Date);
        });
        it('throws error when conflict not found', async () => {
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify([]));
            await expect(repository.resolveConflict('conflict-123', 'use_local')).rejects.toThrow('Conflict not found');
        });
    });
    describe('getUnresolvedConflictsByProject', () => {
        it('returns only unresolved conflicts for project', async () => {
            const mockConflicts = [
                {
                    conflictId: 'conflict-1',
                    projectId: 'project-1',
                    sessionId: 'session-1',
                    conflictType: 'concurrent_edit',
                    localVersion: 1,
                    serverVersion: 2,
                    localData: {},
                    serverData: {},
                    conflictFields: [],
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    conflictId: 'conflict-2',
                    projectId: 'project-1',
                    sessionId: 'session-2',
                    conflictType: 'version_mismatch',
                    localVersion: 2,
                    serverVersion: 3,
                    localData: {},
                    serverData: {},
                    conflictFields: [],
                    createdAt: '2023-01-01T00:00:00.000Z',
                    resolvedAt: '2023-01-01T01:00:00.000Z'
                },
                {
                    conflictId: 'conflict-3',
                    projectId: 'project-2',
                    sessionId: 'session-3',
                    conflictType: 'concurrent_edit',
                    localVersion: 1,
                    serverVersion: 2,
                    localData: {},
                    serverData: {},
                    conflictFields: [],
                    createdAt: '2023-01-01T00:00:00.000Z'
                }
            ];
            mockFs.access.mockResolvedValue(undefined);
            mockFs.readFile.mockResolvedValue(JSON.stringify(mockConflicts));
            const result = await repository.getUnresolvedConflictsByProject('project-1');
            expect(result).toHaveLength(1);
            expect(result[0].conflictId).toBe('conflict-1');
        });
    });
});
//# sourceMappingURL=DealRoomDraftRepository.test.js.map