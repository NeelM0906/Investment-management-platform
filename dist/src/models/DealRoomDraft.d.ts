export interface DealRoomDraft {
    id: string;
    projectId: string;
    userId?: string;
    sessionId: string;
    draftData: {
        showcasePhoto?: {
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            uploadedAt: Date;
        };
        investmentBlurb?: string;
        investmentSummary?: string;
        keyInfo?: Array<{
            name: string;
            link: string;
            order: number;
        }>;
        externalLinks?: Array<{
            name: string;
            url: string;
            order: number;
        }>;
    };
    version: number;
    lastSavedVersion?: number;
    isAutoSave: boolean;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}
export interface DealRoomDraftCreateData {
    projectId: string;
    sessionId: string;
    draftData: DealRoomDraft['draftData'];
    isAutoSave: boolean;
    userId?: string;
}
export interface DealRoomDraftUpdateData {
    draftData?: Partial<DealRoomDraft['draftData']>;
    isAutoSave?: boolean;
    version?: number;
    lastSavedVersion?: number;
}
export interface DealRoomVersion {
    id: string;
    projectId: string;
    version: number;
    data: {
        showcasePhoto?: {
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            uploadedAt: Date;
        };
        investmentBlurb: string;
        investmentSummary: string;
        keyInfo: Array<{
            id: string;
            name: string;
            link: string;
            order: number;
        }>;
        externalLinks: Array<{
            id: string;
            name: string;
            url: string;
            order: number;
        }>;
    };
    changeDescription?: string;
    createdAt: Date;
    createdBy?: string;
}
export interface ConflictResolution {
    conflictId: string;
    projectId: string;
    sessionId: string;
    conflictType: 'concurrent_edit' | 'version_mismatch' | 'data_corruption';
    localVersion: number;
    serverVersion: number;
    localData: DealRoomDraft['draftData'];
    serverData: DealRoomDraft['draftData'];
    conflictFields: string[];
    resolvedData?: DealRoomDraft['draftData'];
    resolution?: 'use_local' | 'use_server' | 'merge' | 'manual';
    createdAt: Date;
    resolvedAt?: Date;
}
export interface SaveStatus {
    status: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
    lastSaved?: Date;
    lastAutoSave?: Date;
    hasUnsavedChanges: boolean;
    version: number;
    error?: string;
    conflictId?: string;
}
export declare class DealRoomDraftModel {
    static validate(data: Partial<DealRoomDraftCreateData>): {
        isValid: boolean;
        errors: string[];
    };
    static isValidUrl(url: string): boolean;
    static generateId(): string;
    static generateSessionId(): string;
    static generateConflictId(): string;
    static createDefault(projectId: string, sessionId: string): DealRoomDraft;
    static detectConflicts(localData: DealRoomDraft['draftData'], serverData: DealRoomDraft['draftData']): string[];
    static mergeData(localData: DealRoomDraft['draftData'], serverData: DealRoomDraft['draftData'], resolution: 'use_local' | 'use_server' | 'merge'): DealRoomDraft['draftData'];
}
//# sourceMappingURL=DealRoomDraft.d.ts.map