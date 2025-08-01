import { useState, useEffect, useRef, useCallback } from 'react';
import { getSessionId } from '../utils/sessionManager';

export interface SaveStatus {
  status: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
  lastSaved?: Date;
  lastAutoSave?: Date;
  hasUnsavedChanges: boolean;
  version: number;
  error?: string;
  conflictId?: string;
}

export interface DraftData {
  [key: string]: any;
}

export interface AutoSaveOptions {
  projectId: string;
  autoSaveInterval?: number; // milliseconds
  enableAutoSave?: boolean;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: string) => void;
  onConflictDetected?: (conflictId: string) => void;
  validateBeforeSave?: (data: DraftData) => { isValid: boolean; errors: string[] };
}

export interface AutoSaveHook {
  saveStatus: SaveStatus;
  saveDraft: (data: DraftData, isAutoSave?: boolean) => Promise<void>;
  publishDraft: (changeDescription?: string) => Promise<void>;
  recoverUnsavedChanges: () => Promise<DraftData | null>;
  clearDraft: () => Promise<void>;
  setSaving: (saving: boolean) => void;
  hasUnsavedChanges: boolean;
  lastSaved?: Date;
  error?: string;
}

export const useAutoSave = (options: AutoSaveOptions): AutoSaveHook => {
  const {
    projectId,
    autoSaveInterval = 2000,
    enableAutoSave = true,
    onSaveSuccess,
    onSaveError,
    onConflictDetected,
    validateBeforeSave
  } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'saved',
    hasUnsavedChanges: false,
    version: 0
  });

  const [pendingData, setPendingData] = useState<DraftData | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = getSessionId();
  const isInitializedRef = useRef(false);

  // Initialize save status
  useEffect(() => {
    if (!isInitializedRef.current && projectId) {
      fetchSaveStatus();
      recoverUnsavedChanges();
      isInitializedRef.current = true;
    }
  }, [projectId]);

  // Auto-save effect
  useEffect(() => {
    if (enableAutoSave && pendingData && saveStatus.status !== 'saving') {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [pendingData, enableAutoSave, autoSaveInterval, saveStatus.status]);

  const fetchSaveStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/projects/${projectId}/deal-room/save-status?sessionId=${sessionId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSaveStatus(prev => ({
            ...prev,
            ...result.data,
            lastSaved: result.data.lastSaved ? new Date(result.data.lastSaved) : undefined,
            lastAutoSave: result.data.lastAutoSave ? new Date(result.data.lastAutoSave) : undefined
          }));
        }
      }
    } catch (error) {
      console.warn('Error fetching save status:', error);
    }
  }, [projectId, sessionId]);

  const performAutoSave = useCallback(async () => {
    if (!pendingData || saveStatus.status === 'saving') return;

    try {
      setSaveStatus(prev => ({ ...prev, status: 'saving' }));

      // Validate data if validator is provided
      if (validateBeforeSave) {
        const validation = validateBeforeSave(pendingData);
        if (!validation.isValid) {
          setSaveStatus(prev => ({
            ...prev,
            status: 'error',
            error: `Validation failed: ${validation.errors.join(', ')}`
          }));
          onSaveError?.(`Validation failed: ${validation.errors.join(', ')}`);
          return;
        }
      }

      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/deal-room/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          draftData: pendingData,
          isAutoSave: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSaveStatus(prev => ({
            ...prev,
            status: 'saved',
            lastAutoSave: new Date(),
            version: result.data.version,
            error: undefined
          }));
          setPendingData(null);
          onSaveSuccess?.(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to save draft');
        }
      } else if (response.status === 409) {
        // Conflict detected
        const result = await response.json();
        const conflictId = result.error?.conflictId;
        setSaveStatus(prev => ({
          ...prev,
          status: 'conflict',
          conflictId,
          error: 'Conflict detected during save'
        }));
        onConflictDetected?.(conflictId);
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSaveStatus(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));
      onSaveError?.(errorMessage);
    }
  }, [pendingData, projectId, sessionId, validateBeforeSave, onSaveSuccess, onSaveError, onConflictDetected, saveStatus.status]);

  const saveDraft = useCallback(async (data: DraftData, isAutoSave: boolean = false) => {
    if (isAutoSave) {
      // For auto-save, just set pending data
      setPendingData(data);
      setSaveStatus(prev => ({
        ...prev,
        hasUnsavedChanges: true,
        status: prev.status === 'saved' ? 'unsaved' : prev.status
      }));
    } else {
      // For manual save, save immediately
      setPendingData(data);
      setSaveStatus(prev => ({
        ...prev,
        hasUnsavedChanges: true,
        status: 'saving'
      }));

      try {
        // Validate data if validator is provided
        if (validateBeforeSave) {
          const validation = validateBeforeSave(data);
          if (!validation.isValid) {
            setSaveStatus(prev => ({
              ...prev,
              status: 'error',
              error: `Validation failed: ${validation.errors.join(', ')}`
            }));
            onSaveError?.(`Validation failed: ${validation.errors.join(', ')}`);
            return;
          }
        }

        const response = await fetch(`http://localhost:3001/api/projects/${projectId}/deal-room/draft`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            draftData: data,
            isAutoSave: false
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setSaveStatus(prev => ({
              ...prev,
              status: 'saved',
              lastSaved: new Date(),
              version: result.data.version,
              hasUnsavedChanges: false,
              error: undefined
            }));
            setPendingData(null);
            onSaveSuccess?.(result.data);
          } else {
            throw new Error(result.error?.message || 'Failed to save draft');
          }
        } else if (response.status === 409) {
          // Conflict detected
          const result = await response.json();
          const conflictId = result.error?.conflictId;
          setSaveStatus(prev => ({
            ...prev,
            status: 'conflict',
            conflictId,
            error: 'Conflict detected during save'
          }));
          onConflictDetected?.(conflictId);
        } else {
          throw new Error('Failed to save draft');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setSaveStatus(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage
        }));
        onSaveError?.(errorMessage);
      }
    }
  }, [projectId, sessionId, validateBeforeSave, onSaveSuccess, onSaveError, onConflictDetected]);

  const publishDraft = useCallback(async (changeDescription?: string) => {
    try {
      setSaveStatus(prev => ({ ...prev, status: 'saving' }));

      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/deal-room/draft/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          changeDescription
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSaveStatus(prev => ({
            ...prev,
            status: 'saved',
            lastSaved: new Date(),
            version: result.data.version.version,
            hasUnsavedChanges: false,
            error: undefined
          }));
          setPendingData(null);
          onSaveSuccess?.(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to publish draft');
        }
      } else if (response.status === 409) {
        // Conflict detected
        const result = await response.json();
        const conflictId = result.error?.conflictId;
        setSaveStatus(prev => ({
          ...prev,
          status: 'conflict',
          conflictId,
          error: 'Conflict detected during publish'
        }));
        onConflictDetected?.(conflictId);
      } else if (response.status === 404) {
        throw new Error('No draft found to publish');
      } else {
        throw new Error('Failed to publish draft');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSaveStatus(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));
      onSaveError?.(errorMessage);
    }
  }, [projectId, sessionId, onSaveSuccess, onSaveError, onConflictDetected]);

  const recoverUnsavedChanges = useCallback(async (): Promise<DraftData | null> => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/projects/${projectId}/deal-room/recover-changes?sessionId=${sessionId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSaveStatus(prev => ({
            ...prev,
            hasUnsavedChanges: true,
            status: 'unsaved',
            version: result.data.version
          }));
          return result.data.draftData;
        }
      }
      return null;
    } catch (error) {
      console.warn('Error recovering unsaved changes:', error);
      return null;
    }
  }, [projectId, sessionId]);

  const clearDraft = useCallback(async () => {
    try {
      // Clear local state
      setPendingData(null);
      setSaveStatus(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        status: 'saved',
        error: undefined
      }));

      // Clear timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    } catch (error) {
      console.warn('Error clearing draft:', error);
    }
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    setSaveStatus(prev => ({
      ...prev,
      status: saving ? 'saving' : (prev.hasUnsavedChanges ? 'unsaved' : 'saved')
    }));
  }, []);

  return {
    saveStatus,
    saveDraft,
    publishDraft,
    recoverUnsavedChanges,
    clearDraft,
    setSaving,
    hasUnsavedChanges: saveStatus.hasUnsavedChanges,
    lastSaved: saveStatus.lastSaved,
    error: saveStatus.error
  };
};