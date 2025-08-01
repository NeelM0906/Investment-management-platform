"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealRoomDraftModel = void 0;
class DealRoomDraftModel {
    static validate(data) {
        const errors = [];
        if (!data.projectId || typeof data.projectId !== 'string' || data.projectId.trim() === '') {
            errors.push('Project ID is required');
        }
        if (!data.sessionId || typeof data.sessionId !== 'string' || data.sessionId.trim() === '') {
            errors.push('Session ID is required');
        }
        if (data.draftData) {
            const { draftData } = data;
            if (draftData.investmentBlurb !== undefined) {
                if (typeof draftData.investmentBlurb !== 'string') {
                    errors.push('Investment blurb must be a string');
                }
                else if (draftData.investmentBlurb.length > 500) {
                    errors.push('Investment blurb must be less than 500 characters');
                }
            }
            if (draftData.investmentSummary !== undefined) {
                if (typeof draftData.investmentSummary !== 'string') {
                    errors.push('Investment summary must be a string');
                }
                else if (draftData.investmentSummary.length > 10000) {
                    errors.push('Investment summary must be less than 10,000 characters');
                }
            }
            if (draftData.keyInfo) {
                if (!Array.isArray(draftData.keyInfo)) {
                    errors.push('Key info must be an array');
                }
                else {
                    draftData.keyInfo.forEach((item, index) => {
                        if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
                            errors.push(`Key info item ${index + 1}: Name is required`);
                        }
                        if (!item.link || typeof item.link !== 'string' || item.link.trim() === '') {
                            errors.push(`Key info item ${index + 1}: Link is required`);
                        }
                        else if (!this.isValidUrl(item.link)) {
                            errors.push(`Key info item ${index + 1}: Link must be a valid URL`);
                        }
                        if (typeof item.order !== 'number' || item.order < 0) {
                            errors.push(`Key info item ${index + 1}: Order must be a non-negative number`);
                        }
                    });
                }
            }
            if (draftData.externalLinks) {
                if (!Array.isArray(draftData.externalLinks)) {
                    errors.push('External links must be an array');
                }
                else {
                    draftData.externalLinks.forEach((link, index) => {
                        if (!link.name || typeof link.name !== 'string' || link.name.trim() === '') {
                            errors.push(`External link ${index + 1}: Name is required`);
                        }
                        if (!link.url || typeof link.url !== 'string' || link.url.trim() === '') {
                            errors.push(`External link ${index + 1}: URL is required`);
                        }
                        else if (!this.isValidUrl(link.url)) {
                            errors.push(`External link ${index + 1}: URL must be a valid URL`);
                        }
                        if (typeof link.order !== 'number' || link.order < 0) {
                            errors.push(`External link ${index + 1}: Order must be a non-negative number`);
                        }
                    });
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static generateId() {
        return 'draft_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    static generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    static generateConflictId() {
        return 'conflict_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    static createDefault(projectId, sessionId) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        return {
            id: this.generateId(),
            projectId,
            sessionId,
            draftData: {},
            version: 1,
            isAutoSave: true,
            createdAt: now,
            updatedAt: now,
            expiresAt
        };
    }
    static detectConflicts(localData, serverData) {
        const conflicts = [];
        if (localData.investmentBlurb !== undefined && serverData.investmentBlurb !== undefined) {
            if (localData.investmentBlurb !== serverData.investmentBlurb) {
                conflicts.push('investmentBlurb');
            }
        }
        if (localData.investmentSummary !== undefined && serverData.investmentSummary !== undefined) {
            if (localData.investmentSummary !== serverData.investmentSummary) {
                conflicts.push('investmentSummary');
            }
        }
        if (localData.keyInfo !== undefined && serverData.keyInfo !== undefined) {
            if (JSON.stringify(localData.keyInfo) !== JSON.stringify(serverData.keyInfo)) {
                conflicts.push('keyInfo');
            }
        }
        if (localData.externalLinks !== undefined && serverData.externalLinks !== undefined) {
            if (JSON.stringify(localData.externalLinks) !== JSON.stringify(serverData.externalLinks)) {
                conflicts.push('externalLinks');
            }
        }
        if (localData.showcasePhoto !== undefined && serverData.showcasePhoto !== undefined) {
            if (JSON.stringify(localData.showcasePhoto) !== JSON.stringify(serverData.showcasePhoto)) {
                conflicts.push('showcasePhoto');
            }
        }
        return conflicts;
    }
    static mergeData(localData, serverData, resolution) {
        switch (resolution) {
            case 'use_local':
                return localData;
            case 'use_server':
                return serverData;
            case 'merge':
                return {
                    showcasePhoto: localData.showcasePhoto !== undefined ? localData.showcasePhoto : serverData.showcasePhoto,
                    investmentBlurb: localData.investmentBlurb !== undefined ? localData.investmentBlurb : serverData.investmentBlurb,
                    investmentSummary: localData.investmentSummary !== undefined ? localData.investmentSummary : serverData.investmentSummary,
                    keyInfo: localData.keyInfo !== undefined ? localData.keyInfo : serverData.keyInfo,
                    externalLinks: localData.externalLinks !== undefined ? localData.externalLinks : serverData.externalLinks
                };
            default:
                return localData;
        }
    }
}
exports.DealRoomDraftModel = DealRoomDraftModel;
//# sourceMappingURL=DealRoomDraft.js.map