import { DealRoomDraft, DealRoomDraftCreateData, DealRoomDraftUpdateData, DealRoomVersion, ConflictResolution } from '../models/DealRoomDraft';
export declare class DealRoomDraftRepository {
    private draftsPath;
    private versionsPath;
    private conflictsPath;
    constructor();
    ensureDataFilesExist(): Promise<void>;
    readDrafts(): Promise<DealRoomDraft[]>;
    writeDrafts(drafts: DealRoomDraft[]): Promise<void>;
    findDraftByProjectAndSession(projectId: string, sessionId: string): Promise<DealRoomDraft | null>;
    findDraftsByProject(projectId: string): Promise<DealRoomDraft[]>;
    createDraft(data: DealRoomDraftCreateData): Promise<DealRoomDraft>;
    updateDraft(projectId: string, sessionId: string, data: DealRoomDraftUpdateData): Promise<DealRoomDraft>;
    deleteDraft(projectId: string, sessionId: string): Promise<boolean>;
    cleanupExpiredDrafts(): Promise<number>;
    readVersions(): Promise<DealRoomVersion[]>;
    writeVersions(versions: DealRoomVersion[]): Promise<void>;
    createVersion(projectId: string, data: DealRoomVersion['data'], changeDescription?: string, createdBy?: string): Promise<DealRoomVersion>;
    getVersionsByProject(projectId: string, limit?: number): Promise<DealRoomVersion[]>;
    getVersionById(versionId: string): Promise<DealRoomVersion | null>;
    readConflicts(): Promise<ConflictResolution[]>;
    writeConflicts(conflicts: ConflictResolution[]): Promise<void>;
    createConflict(conflict: Omit<ConflictResolution, 'conflictId' | 'createdAt'>): Promise<ConflictResolution>;
    resolveConflict(conflictId: string, resolution: 'use_local' | 'use_server' | 'merge' | 'manual', resolvedData?: ConflictResolution['resolvedData']): Promise<ConflictResolution>;
    getUnresolvedConflictsByProject(projectId: string): Promise<ConflictResolution[]>;
    getConflictById(conflictId: string): Promise<ConflictResolution | null>;
    private generateId;
    private generateVersionId;
    private generateConflictId;
}
//# sourceMappingURL=DealRoomDraftRepository.d.ts.map