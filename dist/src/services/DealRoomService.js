"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealRoomService = void 0;
const DealRoom_1 = require("../models/DealRoom");
const DealRoomRepository_1 = require("../repositories/DealRoomRepository");
const DealRoomDraft_1 = require("../models/DealRoomDraft");
const DealRoomDraftRepository_1 = require("../repositories/DealRoomDraftRepository");
class DealRoomService {
    constructor() {
        this.dealRoomRepository = new DealRoomRepository_1.DealRoomRepository();
        this.draftRepository = new DealRoomDraftRepository_1.DealRoomDraftRepository();
    }
    async getDealRoomByProjectId(projectId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        return await this.dealRoomRepository.findByProjectId(projectId);
    }
    async createDealRoom(data) {
        const validation = DealRoom_1.DealRoomModel.validate(data);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        try {
            return await this.dealRoomRepository.create(data);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                throw new Error('Deal room already exists for this project');
            }
            throw new Error('Failed to create deal room');
        }
    }
    async updateDealRoom(projectId, data) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        const validation = DealRoom_1.DealRoomModel.validate({ projectId, ...data });
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        try {
            return await this.dealRoomRepository.update(projectId, data);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new Error('Deal room not found');
            }
            throw new Error('Failed to update deal room');
        }
    }
    async getOrCreateDealRoom(projectId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        let dealRoom = await this.dealRoomRepository.findByProjectId(projectId);
        if (!dealRoom) {
            const defaultData = {
                projectId,
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: []
            };
            dealRoom = await this.dealRoomRepository.create(defaultData);
        }
        return dealRoom;
    }
    async deleteDealRoom(projectId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        return await this.dealRoomRepository.delete(projectId);
    }
    async uploadShowcasePhoto(projectId, file, originalName, mimeType) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!file || file.length === 0) {
            throw new Error('File is required');
        }
        if (!originalName || typeof originalName !== 'string' || originalName.trim() === '') {
            throw new Error('Original filename is required');
        }
        if (!mimeType || typeof mimeType !== 'string' || !DealRoom_1.DealRoomModel.isValidImageMimeType(mimeType)) {
            throw new Error('Invalid image format. Only JPEG, PNG, and WebP are supported');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.length > maxSize) {
            throw new Error('File size too large. Maximum size is 10MB');
        }
        try {
            let dealRoom = await this.getOrCreateDealRoom(projectId);
            if (dealRoom.showcasePhoto) {
                await this.dealRoomRepository.deleteShowcasePhotoFile(dealRoom.showcasePhoto.filename);
            }
            const showcasePhoto = await this.dealRoomRepository.saveShowcasePhoto(projectId, file, originalName, mimeType);
            dealRoom = await this.dealRoomRepository.update(projectId, { showcasePhoto });
            return dealRoom;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to upload showcase photo');
        }
    }
    async removeShowcasePhoto(projectId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        try {
            const dealRoom = await this.dealRoomRepository.findByProjectId(projectId);
            if (!dealRoom) {
                throw new Error('Deal room not found');
            }
            if (dealRoom.showcasePhoto) {
                await this.dealRoomRepository.deleteShowcasePhotoFile(dealRoom.showcasePhoto.filename);
            }
            return await this.dealRoomRepository.update(projectId, { showcasePhoto: undefined });
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to remove showcase photo');
        }
    }
    async getShowcasePhotoPath(projectId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        const dealRoom = await this.dealRoomRepository.findByProjectId(projectId);
        if (!dealRoom || !dealRoom.showcasePhoto) {
            return null;
        }
        return await this.dealRoomRepository.getShowcasePhotoPath(dealRoom.showcasePhoto.filename);
    }
    async updateInvestmentBlurb(projectId, investmentBlurb) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (typeof investmentBlurb !== 'string') {
            throw new Error('Investment blurb must be a string');
        }
        if (investmentBlurb.length > 500) {
            throw new Error('Investment blurb must be less than 500 characters');
        }
        await this.getOrCreateDealRoom(projectId);
        return await this.dealRoomRepository.update(projectId, { investmentBlurb });
    }
    async updateInvestmentSummary(projectId, investmentSummary) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (typeof investmentSummary !== 'string') {
            throw new Error('Investment summary must be a string');
        }
        if (investmentSummary.length > 10000) {
            throw new Error('Investment summary must be less than 10,000 characters');
        }
        await this.getOrCreateDealRoom(projectId);
        return await this.dealRoomRepository.update(projectId, { investmentSummary });
    }
    async updateKeyInfo(projectId, keyInfo) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!Array.isArray(keyInfo)) {
            throw new Error('Key info must be an array');
        }
        keyInfo.forEach((item, index) => {
            if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
                throw new Error(`Key info item ${index + 1}: Name is required`);
            }
            if (!item.link || typeof item.link !== 'string' || item.link.trim() === '') {
                throw new Error(`Key info item ${index + 1}: Link is required`);
            }
            if (!DealRoom_1.DealRoomModel.isValidUrl(item.link)) {
                throw new Error(`Key info item ${index + 1}: Link must be a valid URL`);
            }
            if (typeof item.order !== 'number' || item.order < 0) {
                throw new Error(`Key info item ${index + 1}: Order must be a non-negative number`);
            }
        });
        await this.getOrCreateDealRoom(projectId);
        return await this.dealRoomRepository.update(projectId, { keyInfo });
    }
    async updateExternalLinks(projectId, externalLinks) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!Array.isArray(externalLinks)) {
            throw new Error('External links must be an array');
        }
        externalLinks.forEach((link, index) => {
            if (!link.name || typeof link.name !== 'string' || link.name.trim() === '') {
                throw new Error(`External link ${index + 1}: Name is required`);
            }
            if (!link.url || typeof link.url !== 'string' || link.url.trim() === '') {
                throw new Error(`External link ${index + 1}: URL is required`);
            }
            if (!DealRoom_1.DealRoomModel.isValidUrl(link.url)) {
                throw new Error(`External link ${index + 1}: URL must be a valid URL`);
            }
            if (typeof link.order !== 'number' || link.order < 0) {
                throw new Error(`External link ${index + 1}: Order must be a non-negative number`);
            }
        });
        await this.getOrCreateDealRoom(projectId);
        return await this.dealRoomRepository.update(projectId, { externalLinks });
    }
    async getDealRoomCompletionStatus(projectId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        const dealRoom = await this.getDealRoomByProjectId(projectId);
        const sectionStatus = {
            showcasePhoto: !!(dealRoom?.showcasePhoto),
            investmentBlurb: !!(dealRoom?.investmentBlurb && dealRoom.investmentBlurb.trim().length > 0),
            investmentSummary: !!(dealRoom?.investmentSummary && dealRoom.investmentSummary.trim().length > 0),
            keyInfo: !!(dealRoom?.keyInfo && dealRoom.keyInfo.length > 0),
            externalLinks: !!(dealRoom?.externalLinks && dealRoom.externalLinks.length > 0)
        };
        const completedSections = Object.entries(sectionStatus)
            .filter(([_, isCompleted]) => isCompleted)
            .map(([section, _]) => section);
        const totalSections = Object.keys(sectionStatus).length;
        const completionPercentage = Math.round((completedSections.length / totalSections) * 100);
        return {
            completionPercentage,
            completedSections,
            totalSections,
            sectionStatus
        };
    }
    async getDraftByProjectAndSession(projectId, sessionId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
            throw new Error('Session ID is required');
        }
        return await this.draftRepository.findDraftByProjectAndSession(projectId, sessionId);
    }
    async createOrUpdateDraft(projectId, sessionId, draftData, isAutoSave = true, userId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
            throw new Error('Session ID is required');
        }
        const validation = DealRoomDraft_1.DealRoomDraftModel.validate({ projectId, sessionId, draftData, isAutoSave });
        if (!validation.isValid) {
            throw new Error(`Draft validation failed: ${validation.errors.join(', ')}`);
        }
        try {
            const existingDraft = await this.draftRepository.findDraftByProjectAndSession(projectId, sessionId);
            if (existingDraft) {
                return await this.draftRepository.updateDraft(projectId, sessionId, {
                    draftData,
                    isAutoSave
                });
            }
            else {
                const createData = {
                    projectId,
                    sessionId,
                    draftData,
                    isAutoSave,
                    userId
                };
                return await this.draftRepository.createDraft(createData);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to save draft');
        }
    }
    async publishDraft(projectId, sessionId, changeDescription) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
            throw new Error('Session ID is required');
        }
        try {
            const draft = await this.draftRepository.findDraftByProjectAndSession(projectId, sessionId);
            if (!draft) {
                throw new Error('No draft found to publish');
            }
            const currentDealRoom = await this.getDealRoomByProjectId(projectId);
            if (currentDealRoom && draft.lastSavedVersion) {
                const currentVersions = await this.draftRepository.getVersionsByProject(projectId, 1);
                if (currentVersions.length > 0 && currentVersions[0].version > draft.lastSavedVersion) {
                    const conflicts = DealRoomDraft_1.DealRoomDraftModel.detectConflicts(draft.draftData, {
                        showcasePhoto: currentDealRoom.showcasePhoto,
                        investmentBlurb: currentDealRoom.investmentBlurb,
                        investmentSummary: currentDealRoom.investmentSummary,
                        keyInfo: currentDealRoom.keyInfo.map(item => ({ name: item.name, link: item.link, order: item.order })),
                        externalLinks: currentDealRoom.externalLinks.map(link => ({ name: link.name, url: link.url, order: link.order }))
                    });
                    if (conflicts.length > 0) {
                        const conflict = await this.draftRepository.createConflict({
                            projectId,
                            sessionId,
                            conflictType: 'concurrent_edit',
                            localVersion: draft.version,
                            serverVersion: currentVersions[0].version,
                            localData: draft.draftData,
                            serverData: {
                                showcasePhoto: currentDealRoom.showcasePhoto,
                                investmentBlurb: currentDealRoom.investmentBlurb,
                                investmentSummary: currentDealRoom.investmentSummary,
                                keyInfo: currentDealRoom.keyInfo.map(item => ({ name: item.name, link: item.link, order: item.order })),
                                externalLinks: currentDealRoom.externalLinks.map(link => ({ name: link.name, url: link.url, order: link.order }))
                            },
                            conflictFields: conflicts
                        });
                        throw new Error(`Conflict detected: ${conflict.conflictId}`);
                    }
                }
            }
            let dealRoom = await this.getOrCreateDealRoom(projectId);
            const updateData = {};
            if (draft.draftData.showcasePhoto !== undefined) {
                updateData.showcasePhoto = draft.draftData.showcasePhoto;
            }
            if (draft.draftData.investmentBlurb !== undefined) {
                updateData.investmentBlurb = draft.draftData.investmentBlurb;
            }
            if (draft.draftData.investmentSummary !== undefined) {
                updateData.investmentSummary = draft.draftData.investmentSummary;
            }
            if (draft.draftData.keyInfo !== undefined) {
                updateData.keyInfo = draft.draftData.keyInfo;
            }
            if (draft.draftData.externalLinks !== undefined) {
                updateData.externalLinks = draft.draftData.externalLinks;
            }
            dealRoom = await this.dealRoomRepository.update(projectId, updateData);
            const version = await this.draftRepository.createVersion(projectId, {
                showcasePhoto: dealRoom.showcasePhoto,
                investmentBlurb: dealRoom.investmentBlurb,
                investmentSummary: dealRoom.investmentSummary,
                keyInfo: dealRoom.keyInfo,
                externalLinks: dealRoom.externalLinks
            }, changeDescription, draft.userId);
            await this.draftRepository.updateDraft(projectId, sessionId, {
                lastSavedVersion: version.version
            });
            return { dealRoom, version };
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to publish draft');
        }
    }
    async getSaveStatus(projectId, sessionId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
            throw new Error('Session ID is required');
        }
        try {
            const draft = await this.draftRepository.findDraftByProjectAndSession(projectId, sessionId);
            const conflicts = await this.draftRepository.getUnresolvedConflictsByProject(projectId);
            const sessionConflicts = conflicts.filter(c => c.sessionId === sessionId);
            if (sessionConflicts.length > 0) {
                return {
                    status: 'conflict',
                    hasUnsavedChanges: true,
                    version: draft?.version || 0,
                    conflictId: sessionConflicts[0].conflictId
                };
            }
            if (!draft) {
                return {
                    status: 'saved',
                    hasUnsavedChanges: false,
                    version: 0
                };
            }
            const hasUnsavedChanges = !draft.lastSavedVersion || draft.version > draft.lastSavedVersion;
            return {
                status: hasUnsavedChanges ? 'unsaved' : 'saved',
                lastSaved: draft.lastSavedVersion ? draft.updatedAt : undefined,
                lastAutoSave: draft.isAutoSave ? draft.updatedAt : undefined,
                hasUnsavedChanges,
                version: draft.version
            };
        }
        catch (error) {
            return {
                status: 'error',
                hasUnsavedChanges: true,
                version: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getVersionHistory(projectId, limit = 10) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        return await this.draftRepository.getVersionsByProject(projectId, limit);
    }
    async restoreVersion(projectId, versionId, sessionId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!versionId || typeof versionId !== 'string' || versionId.trim() === '') {
            throw new Error('Version ID is required');
        }
        if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
            throw new Error('Session ID is required');
        }
        try {
            const version = await this.draftRepository.getVersionById(versionId);
            if (!version || version.projectId !== projectId) {
                throw new Error('Version not found');
            }
            const updateData = {
                showcasePhoto: version.data.showcasePhoto,
                investmentBlurb: version.data.investmentBlurb,
                investmentSummary: version.data.investmentSummary,
                keyInfo: version.data.keyInfo.map(item => ({ name: item.name, link: item.link, order: item.order })),
                externalLinks: version.data.externalLinks.map(link => ({ name: link.name, url: link.url, order: link.order }))
            };
            const dealRoom = await this.dealRoomRepository.update(projectId, updateData);
            await this.draftRepository.createVersion(projectId, version.data, `Restored to version ${version.version}`, version.createdBy);
            await this.draftRepository.deleteDraft(projectId, sessionId);
            return dealRoom;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to restore version');
        }
    }
    async resolveConflict(conflictId, resolution, customData) {
        if (!conflictId || typeof conflictId !== 'string' || conflictId.trim() === '') {
            throw new Error('Conflict ID is required');
        }
        try {
            const conflict = await this.draftRepository.getConflictById(conflictId);
            if (!conflict) {
                throw new Error('Conflict not found');
            }
            if (conflict.resolvedAt) {
                throw new Error('Conflict already resolved');
            }
            let resolvedData;
            if (customData) {
                resolvedData = customData;
            }
            else {
                resolvedData = DealRoomDraft_1.DealRoomDraftModel.mergeData(conflict.localData, conflict.serverData, resolution);
            }
            const updateData = {};
            if (resolvedData.showcasePhoto !== undefined) {
                updateData.showcasePhoto = resolvedData.showcasePhoto;
            }
            if (resolvedData.investmentBlurb !== undefined) {
                updateData.investmentBlurb = resolvedData.investmentBlurb;
            }
            if (resolvedData.investmentSummary !== undefined) {
                updateData.investmentSummary = resolvedData.investmentSummary;
            }
            if (resolvedData.keyInfo !== undefined) {
                updateData.keyInfo = resolvedData.keyInfo;
            }
            if (resolvedData.externalLinks !== undefined) {
                updateData.externalLinks = resolvedData.externalLinks;
            }
            const dealRoom = await this.dealRoomRepository.update(conflict.projectId, updateData);
            const actualResolution = customData ? 'manual' : resolution;
            const resolvedConflict = await this.draftRepository.resolveConflict(conflictId, actualResolution, resolvedData);
            await this.draftRepository.createVersion(conflict.projectId, {
                showcasePhoto: dealRoom.showcasePhoto,
                investmentBlurb: dealRoom.investmentBlurb,
                investmentSummary: dealRoom.investmentSummary,
                keyInfo: dealRoom.keyInfo,
                externalLinks: dealRoom.externalLinks
            }, `Conflict resolved using ${resolution} strategy`);
            if (resolution === 'use_local') {
                await this.draftRepository.updateDraft(conflict.projectId, conflict.sessionId, {
                    lastSavedVersion: (await this.draftRepository.getVersionsByProject(conflict.projectId, 1))[0]?.version
                });
            }
            else {
                await this.draftRepository.deleteDraft(conflict.projectId, conflict.sessionId);
            }
            return { dealRoom, conflict: resolvedConflict };
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to resolve conflict');
        }
    }
    async getUnresolvedConflicts(projectId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        return await this.draftRepository.getUnresolvedConflictsByProject(projectId);
    }
    async cleanupExpiredDrafts() {
        return await this.draftRepository.cleanupExpiredDrafts();
    }
    async recoverUnsavedChanges(projectId, sessionId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
            throw new Error('Session ID is required');
        }
        const draft = await this.draftRepository.findDraftByProjectAndSession(projectId, sessionId);
        if (!draft) {
            return null;
        }
        const hasUnsavedChanges = !draft.lastSavedVersion || draft.version > draft.lastSavedVersion;
        return hasUnsavedChanges ? draft : null;
    }
    async saveDraft(projectId, sessionId, draftData, isAutoSave = true) {
        return this.createOrUpdateDraft(projectId, sessionId, draftData, isAutoSave);
    }
    async getShowcasePhoto(projectId) {
        return this.getShowcasePhotoPath(projectId);
    }
}
exports.DealRoomService = DealRoomService;
//# sourceMappingURL=DealRoomService.js.map