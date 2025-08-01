import { DealRoom, DealRoomCreateData, DealRoomUpdateData, DealRoomModel, ShowcasePhoto } from '../models/DealRoom';
import { DealRoomRepository } from '../repositories/DealRoomRepository';
import { DealRoomDraft, DealRoomDraftCreateData, DealRoomDraftUpdateData, DealRoomVersion, ConflictResolution, SaveStatus, DealRoomDraftModel } from '../models/DealRoomDraft';
import { DealRoomDraftRepository } from '../repositories/DealRoomDraftRepository';

export class DealRoomService {
  private dealRoomRepository: DealRoomRepository;
  private draftRepository: DealRoomDraftRepository;

  constructor() {
    this.dealRoomRepository = new DealRoomRepository();
    this.draftRepository = new DealRoomDraftRepository();
  }

  async getDealRoomByProjectId(projectId: string): Promise<DealRoom | null> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    return await this.dealRoomRepository.findByProjectId(projectId);
  }

  async createDealRoom(data: DealRoomCreateData): Promise<DealRoom> {
    // Validate the input data
    const validation = DealRoomModel.validate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      return await this.dealRoomRepository.create(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new Error('Deal room already exists for this project');
      }
      throw new Error('Failed to create deal room');
    }
  }

  async updateDealRoom(projectId: string, data: DealRoomUpdateData): Promise<DealRoom> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    // Validate the update data
    const validation = DealRoomModel.validate({ projectId, ...data });
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      return await this.dealRoomRepository.update(projectId, data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error('Deal room not found');
      }
      throw new Error('Failed to update deal room');
    }
  }

  async getOrCreateDealRoom(projectId: string): Promise<DealRoom> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    // Try to get existing deal room
    let dealRoom = await this.dealRoomRepository.findByProjectId(projectId);
    
    // If it doesn't exist, create a default one
    if (!dealRoom) {
      const defaultData: DealRoomCreateData = {
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

  async deleteDealRoom(projectId: string): Promise<boolean> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    return await this.dealRoomRepository.delete(projectId);
  }

  async uploadShowcasePhoto(projectId: string, file: Buffer, originalName: string, mimeType: string): Promise<DealRoom> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (!file || file.length === 0) {
      throw new Error('File is required');
    }

    if (!originalName || typeof originalName !== 'string' || originalName.trim() === '') {
      throw new Error('Original filename is required');
    }

    if (!mimeType || typeof mimeType !== 'string' || !DealRoomModel.isValidImageMimeType(mimeType)) {
      throw new Error('Invalid image format. Only JPEG, PNG, and WebP are supported');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.length > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB');
    }

    try {
      // Get or create deal room
      let dealRoom = await this.getOrCreateDealRoom(projectId);

      // Delete old showcase photo if it exists
      if (dealRoom.showcasePhoto) {
        await this.dealRoomRepository.deleteShowcasePhotoFile(dealRoom.showcasePhoto.filename);
      }

      // Save new photo
      const showcasePhoto = await this.dealRoomRepository.saveShowcasePhoto(projectId, file, originalName, mimeType);

      // Update deal room with new photo
      dealRoom = await this.dealRoomRepository.update(projectId, { showcasePhoto });

      return dealRoom;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload showcase photo');
    }
  }

  async removeShowcasePhoto(projectId: string): Promise<DealRoom> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    try {
      const dealRoom = await this.dealRoomRepository.findByProjectId(projectId);
      if (!dealRoom) {
        throw new Error('Deal room not found');
      }

      // Delete photo file if it exists
      if (dealRoom.showcasePhoto) {
        await this.dealRoomRepository.deleteShowcasePhotoFile(dealRoom.showcasePhoto.filename);
      }

      // Update deal room to remove photo reference
      return await this.dealRoomRepository.update(projectId, { showcasePhoto: undefined });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to remove showcase photo');
    }
  }

  async getShowcasePhotoPath(projectId: string): Promise<string | null> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    const dealRoom = await this.dealRoomRepository.findByProjectId(projectId);
    if (!dealRoom || !dealRoom.showcasePhoto) {
      return null;
    }

    return await this.dealRoomRepository.getShowcasePhotoPath(dealRoom.showcasePhoto.filename);
  }

  async updateInvestmentBlurb(projectId: string, investmentBlurb: string): Promise<DealRoom> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (typeof investmentBlurb !== 'string') {
      throw new Error('Investment blurb must be a string');
    }

    if (investmentBlurb.length > 500) {
      throw new Error('Investment blurb must be less than 500 characters');
    }

    // Get or create deal room first
    await this.getOrCreateDealRoom(projectId);

    return await this.dealRoomRepository.update(projectId, { investmentBlurb });
  }

  async updateInvestmentSummary(projectId: string, investmentSummary: string): Promise<DealRoom> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (typeof investmentSummary !== 'string') {
      throw new Error('Investment summary must be a string');
    }

    if (investmentSummary.length > 10000) {
      throw new Error('Investment summary must be less than 10,000 characters');
    }

    // Get or create deal room first
    await this.getOrCreateDealRoom(projectId);

    return await this.dealRoomRepository.update(projectId, { investmentSummary });
  }

  async updateKeyInfo(projectId: string, keyInfo: Array<{ name: string; link: string; order: number }>): Promise<DealRoom> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (!Array.isArray(keyInfo)) {
      throw new Error('Key info must be an array');
    }

    // Validate each key info item
    keyInfo.forEach((item, index) => {
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        throw new Error(`Key info item ${index + 1}: Name is required`);
      }
      if (!item.link || typeof item.link !== 'string' || item.link.trim() === '') {
        throw new Error(`Key info item ${index + 1}: Link is required`);
      }
      if (!DealRoomModel.isValidUrl(item.link)) {
        throw new Error(`Key info item ${index + 1}: Link must be a valid URL`);
      }
      if (typeof item.order !== 'number' || item.order < 0) {
        throw new Error(`Key info item ${index + 1}: Order must be a non-negative number`);
      }
    });

    // Get or create deal room first
    await this.getOrCreateDealRoom(projectId);

    return await this.dealRoomRepository.update(projectId, { keyInfo });
  }

  async updateExternalLinks(projectId: string, externalLinks: Array<{ name: string; url: string; order: number }>): Promise<DealRoom> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (!Array.isArray(externalLinks)) {
      throw new Error('External links must be an array');
    }

    // Validate each external link
    externalLinks.forEach((link, index) => {
      if (!link.name || typeof link.name !== 'string' || link.name.trim() === '') {
        throw new Error(`External link ${index + 1}: Name is required`);
      }
      if (!link.url || typeof link.url !== 'string' || link.url.trim() === '') {
        throw new Error(`External link ${index + 1}: URL is required`);
      }
      if (!DealRoomModel.isValidUrl(link.url)) {
        throw new Error(`External link ${index + 1}: URL must be a valid URL`);
      }
      if (typeof link.order !== 'number' || link.order < 0) {
        throw new Error(`External link ${index + 1}: Order must be a non-negative number`);
      }
    });

    // Get or create deal room first
    await this.getOrCreateDealRoom(projectId);

    return await this.dealRoomRepository.update(projectId, { externalLinks });
  }

  async getDealRoomCompletionStatus(projectId: string): Promise<{
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
  }> {
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

  // Draft Management Methods

  async getDraftByProjectAndSession(projectId: string, sessionId: string): Promise<DealRoomDraft | null> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }

    return await this.draftRepository.findDraftByProjectAndSession(projectId, sessionId);
  }

  async createOrUpdateDraft(projectId: string, sessionId: string, draftData: DealRoomDraft['draftData'], isAutoSave: boolean = true, userId?: string): Promise<DealRoomDraft> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }

    // Validate draft data
    const validation = DealRoomDraftModel.validate({ projectId, sessionId, draftData, isAutoSave });
    if (!validation.isValid) {
      throw new Error(`Draft validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Check if draft already exists
      const existingDraft = await this.draftRepository.findDraftByProjectAndSession(projectId, sessionId);

      if (existingDraft) {
        // Update existing draft
        return await this.draftRepository.updateDraft(projectId, sessionId, {
          draftData,
          isAutoSave
        });
      } else {
        // Create new draft
        const createData: DealRoomDraftCreateData = {
          projectId,
          sessionId,
          draftData,
          isAutoSave,
          userId
        };
        return await this.draftRepository.createDraft(createData);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to save draft');
    }
  }

  async publishDraft(projectId: string, sessionId: string, changeDescription?: string): Promise<{ dealRoom: DealRoom; version: DealRoomVersion }> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }

    try {
      // Get the draft
      const draft = await this.draftRepository.findDraftByProjectAndSession(projectId, sessionId);
      if (!draft) {
        throw new Error('No draft found to publish');
      }

      // Check for conflicts with current deal room data
      const currentDealRoom = await this.getDealRoomByProjectId(projectId);
      if (currentDealRoom && draft.lastSavedVersion) {
        // Check if the deal room has been modified since the draft was last saved
        const currentVersions = await this.draftRepository.getVersionsByProject(projectId, 1);
        if (currentVersions.length > 0 && currentVersions[0].version > draft.lastSavedVersion) {
          // There's a potential conflict
          const conflicts = DealRoomDraftModel.detectConflicts(draft.draftData, {
            showcasePhoto: currentDealRoom.showcasePhoto,
            investmentBlurb: currentDealRoom.investmentBlurb,
            investmentSummary: currentDealRoom.investmentSummary,
            keyInfo: currentDealRoom.keyInfo.map(item => ({ name: item.name, link: item.link, order: item.order })),
            externalLinks: currentDealRoom.externalLinks.map(link => ({ name: link.name, url: link.url, order: link.order }))
          });

          if (conflicts.length > 0) {
            // Create conflict record
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

      // Get or create deal room
      let dealRoom = await this.getOrCreateDealRoom(projectId);

      // Apply draft changes to deal room
      const updateData: DealRoomUpdateData = {};

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

      // Update deal room
      dealRoom = await this.dealRoomRepository.update(projectId, updateData);

      // Create version record
      const version = await this.draftRepository.createVersion(
        projectId,
        {
          showcasePhoto: dealRoom.showcasePhoto,
          investmentBlurb: dealRoom.investmentBlurb,
          investmentSummary: dealRoom.investmentSummary,
          keyInfo: dealRoom.keyInfo,
          externalLinks: dealRoom.externalLinks
        },
        changeDescription,
        draft.userId
      );

      // Update draft with last saved version
      await this.draftRepository.updateDraft(projectId, sessionId, {
        lastSavedVersion: version.version
      });

      return { dealRoom, version };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to publish draft');
    }
  }

  async getSaveStatus(projectId: string, sessionId: string): Promise<SaveStatus> {
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
    } catch (error) {
      return {
        status: 'error',
        hasUnsavedChanges: true,
        version: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getVersionHistory(projectId: string, limit: number = 10): Promise<DealRoomVersion[]> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    return await this.draftRepository.getVersionsByProject(projectId, limit);
  }

  async restoreVersion(projectId: string, versionId: string, sessionId: string): Promise<DealRoom> {
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

      // Update deal room with version data
      const updateData: DealRoomUpdateData = {
        showcasePhoto: version.data.showcasePhoto,
        investmentBlurb: version.data.investmentBlurb,
        investmentSummary: version.data.investmentSummary,
        keyInfo: version.data.keyInfo.map(item => ({ name: item.name, link: item.link, order: item.order })),
        externalLinks: version.data.externalLinks.map(link => ({ name: link.name, url: link.url, order: link.order }))
      };

      const dealRoom = await this.dealRoomRepository.update(projectId, updateData);

      // Create new version record for the restoration
      await this.draftRepository.createVersion(
        projectId,
        version.data,
        `Restored to version ${version.version}`,
        version.createdBy
      );

      // Clear any existing draft for this session
      await this.draftRepository.deleteDraft(projectId, sessionId);

      return dealRoom;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to restore version');
    }
  }

  async resolveConflict(conflictId: string, resolution: 'use_local' | 'use_server' | 'merge', customData?: DealRoomDraft['draftData']): Promise<{ dealRoom: DealRoom; conflict: ConflictResolution }> {
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

      let resolvedData: DealRoomDraft['draftData'];

      if (customData) {
        resolvedData = customData;
      } else {
        resolvedData = DealRoomDraftModel.mergeData(conflict.localData, conflict.serverData, resolution);
      }

      // Update deal room with resolved data
      const updateData: DealRoomUpdateData = {};
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

      // Mark conflict as resolved
      const actualResolution = customData ? 'manual' : resolution;
      const resolvedConflict = await this.draftRepository.resolveConflict(conflictId, actualResolution, resolvedData);

      // Create version record
      await this.draftRepository.createVersion(
        conflict.projectId,
        {
          showcasePhoto: dealRoom.showcasePhoto,
          investmentBlurb: dealRoom.investmentBlurb,
          investmentSummary: dealRoom.investmentSummary,
          keyInfo: dealRoom.keyInfo,
          externalLinks: dealRoom.externalLinks
        },
        `Conflict resolved using ${resolution} strategy`
      );

      // Update or clear draft
      if (resolution === 'use_local') {
        await this.draftRepository.updateDraft(conflict.projectId, conflict.sessionId, {
          lastSavedVersion: (await this.draftRepository.getVersionsByProject(conflict.projectId, 1))[0]?.version
        });
      } else {
        await this.draftRepository.deleteDraft(conflict.projectId, conflict.sessionId);
      }

      return { dealRoom, conflict: resolvedConflict };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to resolve conflict');
    }
  }

  async getUnresolvedConflicts(projectId: string): Promise<ConflictResolution[]> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    return await this.draftRepository.getUnresolvedConflictsByProject(projectId);
  }

  async cleanupExpiredDrafts(): Promise<number> {
    return await this.draftRepository.cleanupExpiredDrafts();
  }

  async recoverUnsavedChanges(projectId: string, sessionId: string): Promise<DealRoomDraft | null> {
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

    // Check if there are unsaved changes
    const hasUnsavedChanges = !draft.lastSavedVersion || draft.version > draft.lastSavedVersion;
    
    return hasUnsavedChanges ? draft : null;
  }

  // Alias for createOrUpdateDraft to fix test compatibility
  async saveDraft(projectId: string, sessionId: string, draftData: DealRoomDraft['draftData'], isAutoSave: boolean = true): Promise<DealRoomDraft> {
    return this.createOrUpdateDraft(projectId, sessionId, draftData, isAutoSave);
  }

  // Alias for getShowcasePhotoPath to fix test compatibility
  async getShowcasePhoto(projectId: string): Promise<string | null> {
    return this.getShowcasePhotoPath(projectId);
  }
}