"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealRoomDraftRepository = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class DealRoomDraftRepository {
    constructor() {
        this.draftsPath = path_1.default.join(process.cwd(), 'data', 'deal-room-drafts.json');
        this.versionsPath = path_1.default.join(process.cwd(), 'data', 'deal-room-versions.json');
        this.conflictsPath = path_1.default.join(process.cwd(), 'data', 'deal-room-conflicts.json');
    }
    async ensureDataFilesExist() {
        const files = [
            { path: this.draftsPath, defaultData: [] },
            { path: this.versionsPath, defaultData: [] },
            { path: this.conflictsPath, defaultData: [] }
        ];
        for (const file of files) {
            try {
                await promises_1.default.access(file.path);
            }
            catch {
                await promises_1.default.mkdir(path_1.default.dirname(file.path), { recursive: true });
                await promises_1.default.writeFile(file.path, JSON.stringify(file.defaultData, null, 2));
            }
        }
    }
    async readDrafts() {
        await this.ensureDataFilesExist();
        try {
            const data = await promises_1.default.readFile(this.draftsPath, 'utf-8');
            const drafts = JSON.parse(data);
            const now = new Date();
            const validDrafts = drafts
                .map((draft) => ({
                ...draft,
                createdAt: new Date(draft.createdAt),
                updatedAt: new Date(draft.updatedAt),
                expiresAt: new Date(draft.expiresAt),
                draftData: {
                    ...draft.draftData,
                    showcasePhoto: draft.draftData.showcasePhoto ? {
                        ...draft.draftData.showcasePhoto,
                        uploadedAt: new Date(draft.draftData.showcasePhoto.uploadedAt)
                    } : undefined
                }
            }))
                .filter((draft) => draft.expiresAt > now);
            if (validDrafts.length !== drafts.length) {
                await this.writeDrafts(validDrafts);
            }
            return validDrafts;
        }
        catch (error) {
            console.error('Error reading deal room drafts:', error);
            return [];
        }
    }
    async writeDrafts(drafts) {
        try {
            await promises_1.default.writeFile(this.draftsPath, JSON.stringify(drafts, null, 2));
        }
        catch (error) {
            console.error('Error writing deal room drafts:', error);
            throw new Error('Failed to save draft data');
        }
    }
    async findDraftByProjectAndSession(projectId, sessionId) {
        const drafts = await this.readDrafts();
        return drafts.find(draft => draft.projectId === projectId && draft.sessionId === sessionId) || null;
    }
    async findDraftsByProject(projectId) {
        const drafts = await this.readDrafts();
        return drafts.filter(draft => draft.projectId === projectId);
    }
    async createDraft(data) {
        const drafts = await this.readDrafts();
        const existingDraftIndex = drafts.findIndex(d => d.projectId === data.projectId && d.sessionId === data.sessionId);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        const newDraft = {
            id: this.generateId(),
            projectId: data.projectId,
            sessionId: data.sessionId,
            userId: data.userId,
            draftData: data.draftData,
            version: 1,
            isAutoSave: data.isAutoSave,
            createdAt: now,
            updatedAt: now,
            expiresAt
        };
        if (existingDraftIndex >= 0) {
            const existingDraft = drafts[existingDraftIndex];
            newDraft.id = existingDraft.id;
            newDraft.version = existingDraft.version + 1;
            newDraft.createdAt = existingDraft.createdAt;
            newDraft.lastSavedVersion = existingDraft.lastSavedVersion;
            drafts[existingDraftIndex] = newDraft;
        }
        else {
            drafts.push(newDraft);
        }
        await this.writeDrafts(drafts);
        return newDraft;
    }
    async updateDraft(projectId, sessionId, data) {
        const drafts = await this.readDrafts();
        const draftIndex = drafts.findIndex(d => d.projectId === projectId && d.sessionId === sessionId);
        if (draftIndex === -1) {
            throw new Error('Draft not found');
        }
        const existingDraft = drafts[draftIndex];
        const now = new Date();
        const updatedDraftData = {
            ...existingDraft.draftData,
            ...data.draftData
        };
        const updatedDraft = {
            ...existingDraft,
            draftData: updatedDraftData,
            version: data.version !== undefined ? data.version : existingDraft.version + 1,
            lastSavedVersion: data.lastSavedVersion !== undefined ? data.lastSavedVersion : existingDraft.lastSavedVersion,
            isAutoSave: data.isAutoSave !== undefined ? data.isAutoSave : existingDraft.isAutoSave,
            updatedAt: now,
            expiresAt: new Date(now.getTime() + (24 * 60 * 60 * 1000))
        };
        drafts[draftIndex] = updatedDraft;
        await this.writeDrafts(drafts);
        return updatedDraft;
    }
    async deleteDraft(projectId, sessionId) {
        const drafts = await this.readDrafts();
        const draftIndex = drafts.findIndex(d => d.projectId === projectId && d.sessionId === sessionId);
        if (draftIndex === -1) {
            return false;
        }
        drafts.splice(draftIndex, 1);
        await this.writeDrafts(drafts);
        return true;
    }
    async cleanupExpiredDrafts() {
        const drafts = await this.readDrafts();
        const now = new Date();
        const validDrafts = drafts.filter(draft => draft.expiresAt > now);
        const expiredCount = drafts.length - validDrafts.length;
        if (expiredCount > 0) {
            await this.writeDrafts(validDrafts);
        }
        return expiredCount;
    }
    async readVersions() {
        await this.ensureDataFilesExist();
        try {
            const data = await promises_1.default.readFile(this.versionsPath, 'utf-8');
            const versions = JSON.parse(data);
            return versions.map((version) => ({
                ...version,
                createdAt: new Date(version.createdAt),
                data: {
                    ...version.data,
                    showcasePhoto: version.data.showcasePhoto ? {
                        ...version.data.showcasePhoto,
                        uploadedAt: new Date(version.data.showcasePhoto.uploadedAt)
                    } : undefined
                }
            }));
        }
        catch (error) {
            console.error('Error reading deal room versions:', error);
            return [];
        }
    }
    async writeVersions(versions) {
        try {
            await promises_1.default.writeFile(this.versionsPath, JSON.stringify(versions, null, 2));
        }
        catch (error) {
            console.error('Error writing deal room versions:', error);
            throw new Error('Failed to save version data');
        }
    }
    async createVersion(projectId, data, changeDescription, createdBy) {
        const versions = await this.readVersions();
        const projectVersions = versions.filter(v => v.projectId === projectId);
        const nextVersion = projectVersions.length > 0 ? Math.max(...projectVersions.map(v => v.version)) + 1 : 1;
        const newVersion = {
            id: this.generateVersionId(),
            projectId,
            version: nextVersion,
            data,
            changeDescription,
            createdBy,
            createdAt: new Date()
        };
        versions.push(newVersion);
        const allProjectVersions = versions.filter(v => v.projectId === projectId);
        if (allProjectVersions.length > 10) {
            const versionsToKeep = allProjectVersions
                .sort((a, b) => b.version - a.version)
                .slice(0, 10);
            const otherVersions = versions.filter(v => v.projectId !== projectId);
            const cleanedVersions = [...otherVersions, ...versionsToKeep];
            await this.writeVersions(cleanedVersions);
        }
        else {
            await this.writeVersions(versions);
        }
        return newVersion;
    }
    async getVersionsByProject(projectId, limit = 10) {
        const versions = await this.readVersions();
        return versions
            .filter(v => v.projectId === projectId)
            .sort((a, b) => b.version - a.version)
            .slice(0, limit);
    }
    async getVersionById(versionId) {
        const versions = await this.readVersions();
        return versions.find(v => v.id === versionId) || null;
    }
    async readConflicts() {
        await this.ensureDataFilesExist();
        try {
            const data = await promises_1.default.readFile(this.conflictsPath, 'utf-8');
            const conflicts = JSON.parse(data);
            return conflicts.map((conflict) => ({
                ...conflict,
                createdAt: new Date(conflict.createdAt),
                resolvedAt: conflict.resolvedAt ? new Date(conflict.resolvedAt) : undefined
            }));
        }
        catch (error) {
            console.error('Error reading deal room conflicts:', error);
            return [];
        }
    }
    async writeConflicts(conflicts) {
        try {
            await promises_1.default.writeFile(this.conflictsPath, JSON.stringify(conflicts, null, 2));
        }
        catch (error) {
            console.error('Error writing deal room conflicts:', error);
            throw new Error('Failed to save conflict data');
        }
    }
    async createConflict(conflict) {
        const conflicts = await this.readConflicts();
        const newConflict = {
            ...conflict,
            conflictId: this.generateConflictId(),
            createdAt: new Date()
        };
        conflicts.push(newConflict);
        await this.writeConflicts(conflicts);
        return newConflict;
    }
    async resolveConflict(conflictId, resolution, resolvedData) {
        const conflicts = await this.readConflicts();
        const conflictIndex = conflicts.findIndex(c => c.conflictId === conflictId);
        if (conflictIndex === -1) {
            throw new Error('Conflict not found');
        }
        const updatedConflict = {
            ...conflicts[conflictIndex],
            resolution,
            resolvedData,
            resolvedAt: new Date()
        };
        conflicts[conflictIndex] = updatedConflict;
        await this.writeConflicts(conflicts);
        return updatedConflict;
    }
    async getUnresolvedConflictsByProject(projectId) {
        const conflicts = await this.readConflicts();
        return conflicts.filter(c => c.projectId === projectId && !c.resolvedAt);
    }
    async getConflictById(conflictId) {
        const conflicts = await this.readConflicts();
        return conflicts.find(c => c.conflictId === conflictId) || null;
    }
    generateId() {
        return 'draft_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    generateVersionId() {
        return 'version_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    generateConflictId() {
        return 'conflict_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
}
exports.DealRoomDraftRepository = DealRoomDraftRepository;
//# sourceMappingURL=DealRoomDraftRepository.js.map