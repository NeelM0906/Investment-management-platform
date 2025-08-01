"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DealRoomDraft_1 = require("./DealRoomDraft");
describe('DealRoomDraftModel', () => {
    describe('validate', () => {
        it('validates a valid draft creation data', () => {
            const validData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    investmentBlurb: 'A great investment opportunity',
                    investmentSummary: 'This is a comprehensive summary',
                    keyInfo: [
                        { name: 'Prospectus', link: 'https://example.com/prospectus.pdf', order: 0 }
                    ],
                    externalLinks: [
                        { name: 'Company Website', url: 'https://company.com', order: 0 }
                    ]
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('requires project ID', () => {
            const invalidData = {
                sessionId: 'session-456',
                draftData: {},
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Project ID is required');
        });
        it('requires session ID', () => {
            const invalidData = {
                projectId: 'project-123',
                draftData: {},
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Session ID is required');
        });
        it('validates empty project ID', () => {
            const invalidData = {
                projectId: '',
                sessionId: 'session-456',
                draftData: {},
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Project ID is required');
        });
        it('validates empty session ID', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: '',
                draftData: {},
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Session ID is required');
        });
        it('validates investment blurb type', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    investmentBlurb: 123
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Investment blurb must be a string');
        });
        it('validates investment blurb length', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    investmentBlurb: 'a'.repeat(501)
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Investment blurb must be less than 500 characters');
        });
        it('validates investment summary type', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    investmentSummary: 123
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Investment summary must be a string');
        });
        it('validates investment summary length', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    investmentSummary: 'a'.repeat(10001)
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Investment summary must be less than 10,000 characters');
        });
        it('validates key info array type', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    keyInfo: 'not-an-array'
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Key info must be an array');
        });
        it('validates key info item properties', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    keyInfo: [
                        { name: '', link: 'invalid-url', order: -1 }
                    ]
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Key info item 1: Name is required');
            expect(result.errors).toContain('Key info item 1: Link must be a valid URL');
            expect(result.errors).toContain('Key info item 1: Order must be a non-negative number');
        });
        it('validates external links array type', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    externalLinks: 'not-an-array'
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('External links must be an array');
        });
        it('validates external link properties', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    externalLinks: [
                        { name: '', url: 'not-a-url', order: -1 }
                    ]
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('External link 1: Name is required');
            expect(result.errors).toContain('External link 1: URL must be a valid URL');
            expect(result.errors).toContain('External link 1: Order must be a non-negative number');
        });
        it('validates multiple key info and external link items', () => {
            const invalidData = {
                projectId: 'project-123',
                sessionId: 'session-456',
                draftData: {
                    keyInfo: [
                        { name: 'Valid Item', link: 'https://example.com', order: 0 },
                        { name: '', link: 'invalid', order: -1 }
                    ],
                    externalLinks: [
                        { name: 'Valid Link', url: 'https://example.com', order: 0 },
                        { name: '', url: 'invalid', order: -1 }
                    ]
                },
                isAutoSave: true
            };
            const result = DealRoomDraft_1.DealRoomDraftModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Key info item 2: Name is required');
            expect(result.errors).toContain('Key info item 2: Link must be a valid URL');
            expect(result.errors).toContain('Key info item 2: Order must be a non-negative number');
            expect(result.errors).toContain('External link 2: Name is required');
            expect(result.errors).toContain('External link 2: URL must be a valid URL');
            expect(result.errors).toContain('External link 2: Order must be a non-negative number');
        });
    });
    describe('isValidUrl', () => {
        it('validates correct URLs', () => {
            expect(DealRoomDraft_1.DealRoomDraftModel.isValidUrl('https://example.com')).toBe(true);
            expect(DealRoomDraft_1.DealRoomDraftModel.isValidUrl('http://example.com')).toBe(true);
            expect(DealRoomDraft_1.DealRoomDraftModel.isValidUrl('https://example.com/path?query=1')).toBe(true);
            expect(DealRoomDraft_1.DealRoomDraftModel.isValidUrl('ftp://example.com')).toBe(true);
        });
        it('rejects invalid URLs', () => {
            expect(DealRoomDraft_1.DealRoomDraftModel.isValidUrl('not-a-url')).toBe(false);
            expect(DealRoomDraft_1.DealRoomDraftModel.isValidUrl('')).toBe(false);
            expect(DealRoomDraft_1.DealRoomDraftModel.isValidUrl('example.com')).toBe(false);
            expect(DealRoomDraft_1.DealRoomDraftModel.isValidUrl('://example.com')).toBe(false);
        });
    });
    describe('generateId', () => {
        it('generates unique IDs with correct prefix', () => {
            const id1 = DealRoomDraft_1.DealRoomDraftModel.generateId();
            const id2 = DealRoomDraft_1.DealRoomDraftModel.generateId();
            expect(id1).toMatch(/^draft_/);
            expect(id2).toMatch(/^draft_/);
            expect(id1).not.toBe(id2);
        });
    });
    describe('generateSessionId', () => {
        it('generates unique session IDs with correct prefix', () => {
            const id1 = DealRoomDraft_1.DealRoomDraftModel.generateSessionId();
            const id2 = DealRoomDraft_1.DealRoomDraftModel.generateSessionId();
            expect(id1).toMatch(/^session_/);
            expect(id2).toMatch(/^session_/);
            expect(id1).not.toBe(id2);
        });
    });
    describe('generateConflictId', () => {
        it('generates unique conflict IDs with correct prefix', () => {
            const id1 = DealRoomDraft_1.DealRoomDraftModel.generateConflictId();
            const id2 = DealRoomDraft_1.DealRoomDraftModel.generateConflictId();
            expect(id1).toMatch(/^conflict_/);
            expect(id2).toMatch(/^conflict_/);
            expect(id1).not.toBe(id2);
        });
    });
    describe('createDefault', () => {
        it('creates a default draft with correct properties', () => {
            const projectId = 'project-123';
            const sessionId = 'session-456';
            const draft = DealRoomDraft_1.DealRoomDraftModel.createDefault(projectId, sessionId);
            expect(draft.projectId).toBe(projectId);
            expect(draft.sessionId).toBe(sessionId);
            expect(draft.draftData).toEqual({});
            expect(draft.version).toBe(1);
            expect(draft.isAutoSave).toBe(true);
            expect(draft.id).toMatch(/^draft_/);
            expect(draft.createdAt).toBeInstanceOf(Date);
            expect(draft.updatedAt).toBeInstanceOf(Date);
            expect(draft.expiresAt).toBeInstanceOf(Date);
            const expectedExpiration = new Date(draft.createdAt.getTime() + (24 * 60 * 60 * 1000));
            expect(Math.abs(draft.expiresAt.getTime() - expectedExpiration.getTime())).toBeLessThan(1000);
        });
    });
    describe('detectConflicts', () => {
        it('detects no conflicts when data is identical', () => {
            const data1 = {
                investmentBlurb: 'Same content',
                investmentSummary: 'Same summary'
            };
            const data2 = {
                investmentBlurb: 'Same content',
                investmentSummary: 'Same summary'
            };
            const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(data1, data2);
            expect(conflicts).toHaveLength(0);
        });
        it('detects conflicts in investment blurb', () => {
            const localData = { investmentBlurb: 'Local content' };
            const serverData = { investmentBlurb: 'Server content' };
            const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(localData, serverData);
            expect(conflicts).toContain('investmentBlurb');
        });
        it('detects conflicts in investment summary', () => {
            const localData = { investmentSummary: 'Local summary' };
            const serverData = { investmentSummary: 'Server summary' };
            const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(localData, serverData);
            expect(conflicts).toContain('investmentSummary');
        });
        it('detects conflicts in key info', () => {
            const localData = {
                keyInfo: [{ name: 'Local', link: 'https://local.com', order: 0 }]
            };
            const serverData = {
                keyInfo: [{ name: 'Server', link: 'https://server.com', order: 0 }]
            };
            const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(localData, serverData);
            expect(conflicts).toContain('keyInfo');
        });
        it('detects conflicts in external links', () => {
            const localData = {
                externalLinks: [{ name: 'Local', url: 'https://local.com', order: 0 }]
            };
            const serverData = {
                externalLinks: [{ name: 'Server', url: 'https://server.com', order: 0 }]
            };
            const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(localData, serverData);
            expect(conflicts).toContain('externalLinks');
        });
        it('detects conflicts in showcase photo', () => {
            const localData = {
                showcasePhoto: {
                    filename: 'local.jpg',
                    originalName: 'local.jpg',
                    mimeType: 'image/jpeg',
                    size: 1024,
                    uploadedAt: new Date()
                }
            };
            const serverData = {
                showcasePhoto: {
                    filename: 'server.jpg',
                    originalName: 'server.jpg',
                    mimeType: 'image/jpeg',
                    size: 2048,
                    uploadedAt: new Date()
                }
            };
            const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(localData, serverData);
            expect(conflicts).toContain('showcasePhoto');
        });
        it('detects multiple conflicts', () => {
            const localData = {
                investmentBlurb: 'Local blurb',
                investmentSummary: 'Local summary',
                keyInfo: [{ name: 'Local', link: 'https://local.com', order: 0 }]
            };
            const serverData = {
                investmentBlurb: 'Server blurb',
                investmentSummary: 'Server summary',
                keyInfo: [{ name: 'Server', link: 'https://server.com', order: 0 }]
            };
            const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(localData, serverData);
            expect(conflicts).toContain('investmentBlurb');
            expect(conflicts).toContain('investmentSummary');
            expect(conflicts).toContain('keyInfo');
            expect(conflicts).toHaveLength(3);
        });
        it('ignores undefined fields', () => {
            const localData = { investmentBlurb: 'Local content' };
            const serverData = { investmentSummary: 'Server summary' };
            const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(localData, serverData);
            expect(conflicts).toHaveLength(0);
        });
    });
    describe('mergeData', () => {
        const localData = {
            investmentBlurb: 'Local blurb',
            keyInfo: [{ name: 'Local', link: 'https://local.com', order: 0 }]
        };
        const serverData = {
            investmentSummary: 'Server summary',
            externalLinks: [{ name: 'Server', url: 'https://server.com', order: 0 }]
        };
        it('uses local data when resolution is use_local', () => {
            const merged = DealRoomDraft_1.DealRoomDraftModel.mergeData(localData, serverData, 'use_local');
            expect(merged).toEqual(localData);
        });
        it('uses server data when resolution is use_server', () => {
            const merged = DealRoomDraft_1.DealRoomDraftModel.mergeData(localData, serverData, 'use_server');
            expect(merged).toEqual(serverData);
        });
        it('merges data when resolution is merge', () => {
            const merged = DealRoomDraft_1.DealRoomDraftModel.mergeData(localData, serverData, 'merge');
            expect(merged.investmentBlurb).toBe('Local blurb');
            expect(merged.investmentSummary).toBe('Server summary');
            expect(merged.keyInfo).toEqual(localData.keyInfo);
            expect(merged.externalLinks).toEqual(serverData.externalLinks);
        });
        it('prefers local data in merge when both have same field', () => {
            const localWithSummary = { ...localData, investmentSummary: 'Local summary' };
            const merged = DealRoomDraft_1.DealRoomDraftModel.mergeData(localWithSummary, serverData, 'merge');
            expect(merged.investmentSummary).toBe('Local summary');
        });
        it('defaults to local data for unknown resolution', () => {
            const merged = DealRoomDraft_1.DealRoomDraftModel.mergeData(localData, serverData, 'unknown');
            expect(merged).toEqual(localData);
        });
    });
});
//# sourceMappingURL=DealRoomDraft.test.js.map