import fs from 'fs/promises';
import path from 'path';
import { DealRoomDraft, DealRoomDraftCreateData, DealRoomDraftUpdateData, DealRoomVersion, ConflictResolution } from '../models/DealRoomDraft';

export class DealRoomDraftRepository {
  private draftsPath: string;
  private versionsPath: string;
  private conflictsPath: string;

  constructor() {
    this.draftsPath = path.join(process.cwd(), 'data', 'deal-room-drafts.json');
    this.versionsPath = path.join(process.cwd(), 'data', 'deal-room-versions.json');
    this.conflictsPath = path.join(process.cwd(), 'data', 'deal-room-conflicts.json');
  }

  async ensureDataFilesExist(): Promise<void> {
    const files = [
      { path: this.draftsPath, defaultData: [] },
      { path: this.versionsPath, defaultData: [] },
      { path: this.conflictsPath, defaultData: [] }
    ];

    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch {
        // File doesn't exist, create it
        await fs.mkdir(path.dirname(file.path), { recursive: true });
        await fs.writeFile(file.path, JSON.stringify(file.defaultData, null, 2));
      }
    }
  }

  // Draft operations
  async readDrafts(): Promise<DealRoomDraft[]> {
    await this.ensureDataFilesExist();
    
    try {
      const data = await fs.readFile(this.draftsPath, 'utf-8');
      const drafts = JSON.parse(data);
      
      // Convert date strings back to Date objects and filter expired drafts
      const now = new Date();
      const validDrafts = drafts
        .map((draft: any) => ({
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
        .filter((draft: DealRoomDraft) => draft.expiresAt > now);

      // If we filtered out expired drafts, save the cleaned data
      if (validDrafts.length !== drafts.length) {
        await this.writeDrafts(validDrafts);
      }

      return validDrafts;
    } catch (error) {
      console.error('Error reading deal room drafts:', error);
      return [];
    }
  }

  async writeDrafts(drafts: DealRoomDraft[]): Promise<void> {
    try {
      await fs.writeFile(this.draftsPath, JSON.stringify(drafts, null, 2));
    } catch (error) {
      console.error('Error writing deal room drafts:', error);
      throw new Error('Failed to save draft data');
    }
  }

  async findDraftByProjectAndSession(projectId: string, sessionId: string): Promise<DealRoomDraft | null> {
    const drafts = await this.readDrafts();
    return drafts.find(draft => draft.projectId === projectId && draft.sessionId === sessionId) || null;
  }

  async findDraftsByProject(projectId: string): Promise<DealRoomDraft[]> {
    const drafts = await this.readDrafts();
    return drafts.filter(draft => draft.projectId === projectId);
  }

  async createDraft(data: DealRoomDraftCreateData): Promise<DealRoomDraft> {
    const drafts = await this.readDrafts();
    
    // Check if draft already exists for this project and session
    const existingDraftIndex = drafts.findIndex(d => d.projectId === data.projectId && d.sessionId === data.sessionId);
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now

    const newDraft: DealRoomDraft = {
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
      // Update existing draft
      const existingDraft = drafts[existingDraftIndex];
      newDraft.id = existingDraft.id;
      newDraft.version = existingDraft.version + 1;
      newDraft.createdAt = existingDraft.createdAt;
      newDraft.lastSavedVersion = existingDraft.lastSavedVersion;
      drafts[existingDraftIndex] = newDraft;
    } else {
      // Add new draft
      drafts.push(newDraft);
    }

    await this.writeDrafts(drafts);
    return newDraft;
  }

  async updateDraft(projectId: string, sessionId: string, data: DealRoomDraftUpdateData): Promise<DealRoomDraft> {
    const drafts = await this.readDrafts();
    const draftIndex = drafts.findIndex(d => d.projectId === projectId && d.sessionId === sessionId);
    
    if (draftIndex === -1) {
      throw new Error('Draft not found');
    }

    const existingDraft = drafts[draftIndex];
    const now = new Date();

    // Merge draft data
    const updatedDraftData = {
      ...existingDraft.draftData,
      ...data.draftData
    };

    const updatedDraft: DealRoomDraft = {
      ...existingDraft,
      draftData: updatedDraftData,
      version: data.version !== undefined ? data.version : existingDraft.version + 1,
      lastSavedVersion: data.lastSavedVersion !== undefined ? data.lastSavedVersion : existingDraft.lastSavedVersion,
      isAutoSave: data.isAutoSave !== undefined ? data.isAutoSave : existingDraft.isAutoSave,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + (24 * 60 * 60 * 1000)) // Extend expiration
    };

    drafts[draftIndex] = updatedDraft;
    await this.writeDrafts(drafts);
    
    return updatedDraft;
  }

  async deleteDraft(projectId: string, sessionId: string): Promise<boolean> {
    const drafts = await this.readDrafts();
    const draftIndex = drafts.findIndex(d => d.projectId === projectId && d.sessionId === sessionId);
    
    if (draftIndex === -1) {
      return false;
    }

    drafts.splice(draftIndex, 1);
    await this.writeDrafts(drafts);
    
    return true;
  }

  async cleanupExpiredDrafts(): Promise<number> {
    const drafts = await this.readDrafts();
    const now = new Date();
    const validDrafts = drafts.filter(draft => draft.expiresAt > now);
    const expiredCount = drafts.length - validDrafts.length;

    if (expiredCount > 0) {
      await this.writeDrafts(validDrafts);
    }

    return expiredCount;
  }

  // Version operations
  async readVersions(): Promise<DealRoomVersion[]> {
    await this.ensureDataFilesExist();
    
    try {
      const data = await fs.readFile(this.versionsPath, 'utf-8');
      const versions = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return versions.map((version: any) => ({
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
    } catch (error) {
      console.error('Error reading deal room versions:', error);
      return [];
    }
  }

  async writeVersions(versions: DealRoomVersion[]): Promise<void> {
    try {
      await fs.writeFile(this.versionsPath, JSON.stringify(versions, null, 2));
    } catch (error) {
      console.error('Error writing deal room versions:', error);
      throw new Error('Failed to save version data');
    }
  }

  async createVersion(projectId: string, data: DealRoomVersion['data'], changeDescription?: string, createdBy?: string): Promise<DealRoomVersion> {
    const versions = await this.readVersions();
    
    // Get the next version number for this project
    const projectVersions = versions.filter(v => v.projectId === projectId);
    const nextVersion = projectVersions.length > 0 ? Math.max(...projectVersions.map(v => v.version)) + 1 : 1;

    const newVersion: DealRoomVersion = {
      id: this.generateVersionId(),
      projectId,
      version: nextVersion,
      data,
      changeDescription,
      createdBy,
      createdAt: new Date()
    };

    versions.push(newVersion);
    
    // Keep only the last 10 versions per project to avoid unlimited growth
    const allProjectVersions = versions.filter(v => v.projectId === projectId);
    if (allProjectVersions.length > 10) {
      const versionsToKeep = allProjectVersions
        .sort((a, b) => b.version - a.version)
        .slice(0, 10);
      
      const otherVersions = versions.filter(v => v.projectId !== projectId);
      const cleanedVersions = [...otherVersions, ...versionsToKeep];
      await this.writeVersions(cleanedVersions);
    } else {
      await this.writeVersions(versions);
    }
    
    return newVersion;
  }

  async getVersionsByProject(projectId: string, limit: number = 10): Promise<DealRoomVersion[]> {
    const versions = await this.readVersions();
    return versions
      .filter(v => v.projectId === projectId)
      .sort((a, b) => b.version - a.version)
      .slice(0, limit);
  }

  async getVersionById(versionId: string): Promise<DealRoomVersion | null> {
    const versions = await this.readVersions();
    return versions.find(v => v.id === versionId) || null;
  }

  // Conflict operations
  async readConflicts(): Promise<ConflictResolution[]> {
    await this.ensureDataFilesExist();
    
    try {
      const data = await fs.readFile(this.conflictsPath, 'utf-8');
      const conflicts = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return conflicts.map((conflict: any) => ({
        ...conflict,
        createdAt: new Date(conflict.createdAt),
        resolvedAt: conflict.resolvedAt ? new Date(conflict.resolvedAt) : undefined
      }));
    } catch (error) {
      console.error('Error reading deal room conflicts:', error);
      return [];
    }
  }

  async writeConflicts(conflicts: ConflictResolution[]): Promise<void> {
    try {
      await fs.writeFile(this.conflictsPath, JSON.stringify(conflicts, null, 2));
    } catch (error) {
      console.error('Error writing deal room conflicts:', error);
      throw new Error('Failed to save conflict data');
    }
  }

  async createConflict(conflict: Omit<ConflictResolution, 'conflictId' | 'createdAt'>): Promise<ConflictResolution> {
    const conflicts = await this.readConflicts();
    
    const newConflict: ConflictResolution = {
      ...conflict,
      conflictId: this.generateConflictId(),
      createdAt: new Date()
    };

    conflicts.push(newConflict);
    await this.writeConflicts(conflicts);
    
    return newConflict;
  }

  async resolveConflict(conflictId: string, resolution: 'use_local' | 'use_server' | 'merge' | 'manual', resolvedData?: ConflictResolution['resolvedData']): Promise<ConflictResolution> {
    const conflicts = await this.readConflicts();
    const conflictIndex = conflicts.findIndex(c => c.conflictId === conflictId);
    
    if (conflictIndex === -1) {
      throw new Error('Conflict not found');
    }

    const updatedConflict: ConflictResolution = {
      ...conflicts[conflictIndex],
      resolution,
      resolvedData,
      resolvedAt: new Date()
    };

    conflicts[conflictIndex] = updatedConflict;
    await this.writeConflicts(conflicts);
    
    return updatedConflict;
  }

  async getUnresolvedConflictsByProject(projectId: string): Promise<ConflictResolution[]> {
    const conflicts = await this.readConflicts();
    return conflicts.filter(c => c.projectId === projectId && !c.resolvedAt);
  }

  async getConflictById(conflictId: string): Promise<ConflictResolution | null> {
    const conflicts = await this.readConflicts();
    return conflicts.find(c => c.conflictId === conflictId) || null;
  }

  private generateId(): string {
    return 'draft_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateVersionId(): string {
    return 'version_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateConflictId(): string {
    return 'conflict_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}