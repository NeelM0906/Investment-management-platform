export interface DealRoomDraft {
  id: string;
  projectId: string;
  userId?: string; // For future user management
  sessionId: string; // Browser session identifier
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
  lastSavedVersion?: number; // Version that was last successfully saved to main deal room
  isAutoSave: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // Drafts expire after a certain time
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
  createdBy?: string; // For future user management
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

export class DealRoomDraftModel {
  static validate(data: Partial<DealRoomDraftCreateData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate project ID
    if (!data.projectId || typeof data.projectId !== 'string' || data.projectId.trim() === '') {
      errors.push('Project ID is required');
    }

    // Validate session ID
    if (!data.sessionId || typeof data.sessionId !== 'string' || data.sessionId.trim() === '') {
      errors.push('Session ID is required');
    }

    // Validate draft data structure
    if (data.draftData) {
      const { draftData } = data;

      // Validate investment blurb
      if (draftData.investmentBlurb !== undefined) {
        if (typeof draftData.investmentBlurb !== 'string') {
          errors.push('Investment blurb must be a string');
        } else if (draftData.investmentBlurb.length > 500) {
          errors.push('Investment blurb must be less than 500 characters');
        }
      }

      // Validate investment summary
      if (draftData.investmentSummary !== undefined) {
        if (typeof draftData.investmentSummary !== 'string') {
          errors.push('Investment summary must be a string');
        } else if (draftData.investmentSummary.length > 10000) {
          errors.push('Investment summary must be less than 10,000 characters');
        }
      }

      // Validate key info items
      if (draftData.keyInfo) {
        if (!Array.isArray(draftData.keyInfo)) {
          errors.push('Key info must be an array');
        } else {
          draftData.keyInfo.forEach((item, index) => {
            if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
              errors.push(`Key info item ${index + 1}: Name is required`);
            }
            if (!item.link || typeof item.link !== 'string' || item.link.trim() === '') {
              errors.push(`Key info item ${index + 1}: Link is required`);
            } else if (!this.isValidUrl(item.link)) {
              errors.push(`Key info item ${index + 1}: Link must be a valid URL`);
            }
            if (typeof item.order !== 'number' || item.order < 0) {
              errors.push(`Key info item ${index + 1}: Order must be a non-negative number`);
            }
          });
        }
      }

      // Validate external links
      if (draftData.externalLinks) {
        if (!Array.isArray(draftData.externalLinks)) {
          errors.push('External links must be an array');
        } else {
          draftData.externalLinks.forEach((link, index) => {
            if (!link.name || typeof link.name !== 'string' || link.name.trim() === '') {
              errors.push(`External link ${index + 1}: Name is required`);
            }
            if (!link.url || typeof link.url !== 'string' || link.url.trim() === '') {
              errors.push(`External link ${index + 1}: URL is required`);
            } else if (!this.isValidUrl(link.url)) {
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

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static generateId(): string {
    return 'draft_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static generateConflictId(): string {
    return 'conflict_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static createDefault(projectId: string, sessionId: string): DealRoomDraft {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now

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

  static detectConflicts(localData: DealRoomDraft['draftData'], serverData: DealRoomDraft['draftData']): string[] {
    const conflicts: string[] = [];

    // Check each field for conflicts
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

  static mergeData(localData: DealRoomDraft['draftData'], serverData: DealRoomDraft['draftData'], resolution: 'use_local' | 'use_server' | 'merge'): DealRoomDraft['draftData'] {
    switch (resolution) {
      case 'use_local':
        return localData;
      case 'use_server':
        return serverData;
      case 'merge':
        // Simple merge strategy: prefer local changes, but include server changes for undefined fields
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