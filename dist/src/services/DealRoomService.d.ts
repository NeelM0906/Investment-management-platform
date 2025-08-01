import { DealRoom, DealRoomCreateData, DealRoomUpdateData } from '../models/DealRoom';
import { DealRoomDraft, DealRoomVersion, ConflictResolution, SaveStatus } from '../models/DealRoomDraft';
export declare class DealRoomService {
    private dealRoomRepository;
    private draftRepository;
    constructor();
    getDealRoomByProjectId(projectId: string): Promise<DealRoom | null>;
    createDealRoom(data: DealRoomCreateData): Promise<DealRoom>;
    updateDealRoom(projectId: string, data: DealRoomUpdateData): Promise<DealRoom>;
    getOrCreateDealRoom(projectId: string): Promise<DealRoom>;
    deleteDealRoom(projectId: string): Promise<boolean>;
    uploadShowcasePhoto(projectId: string, file: Buffer, originalName: string, mimeType: string): Promise<DealRoom>;
    removeShowcasePhoto(projectId: string): Promise<DealRoom>;
    getShowcasePhotoPath(projectId: string): Promise<string | null>;
    updateInvestmentBlurb(projectId: string, investmentBlurb: string): Promise<DealRoom>;
    updateInvestmentSummary(projectId: string, investmentSummary: string): Promise<DealRoom>;
    updateKeyInfo(projectId: string, keyInfo: Array<{
        name: string;
        link: string;
        order: number;
    }>): Promise<DealRoom>;
    updateExternalLinks(projectId: string, externalLinks: Array<{
        name: string;
        url: string;
        order: number;
    }>): Promise<DealRoom>;
    getDealRoomCompletionStatus(projectId: string): Promise<{
        completionPercentage: number;
        completedSections: string[];
        totalSections: number;
        sectionStatus: {
            showcasePhoto: boolean;
            investmentBlurb: boolean;
            investmentSummary: boolean;
            keyInfo: boolean;
            externalLinks: boolean;
        };
    }>;
    getDraftByProjectAndSession(projectId: string, sessionId: string): Promise<DealRoomDraft | null>;
    createOrUpdateDraft(projectId: string, sessionId: string, draftData: DealRoomDraft['draftData'], isAutoSave?: boolean, userId?: string): Promise<DealRoomDraft>;
    publishDraft(projectId: string, sessionId: string, changeDescription?: string): Promise<{
        dealRoom: DealRoom;
        version: DealRoomVersion;
    }>;
    getSaveStatus(projectId: string, sessionId: string): Promise<SaveStatus>;
    getVersionHistory(projectId: string, limit?: number): Promise<DealRoomVersion[]>;
    restoreVersion(projectId: string, versionId: string, sessionId: string): Promise<DealRoom>;
    resolveConflict(conflictId: string, resolution: 'use_local' | 'use_server' | 'merge', customData?: DealRoomDraft['draftData']): Promise<{
        dealRoom: DealRoom;
        conflict: ConflictResolution;
    }>;
    getUnresolvedConflicts(projectId: string): Promise<ConflictResolution[]>;
    cleanupExpiredDrafts(): Promise<number>;
    recoverUnsavedChanges(projectId: string, sessionId: string): Promise<DealRoomDraft | null>;
    saveDraft(projectId: string, sessionId: string, draftData: DealRoomDraft['draftData'], isAutoSave?: boolean): Promise<DealRoomDraft>;
    getShowcasePhoto(projectId: string): Promise<string | null>;
}
//# sourceMappingURL=DealRoomService.d.ts.map