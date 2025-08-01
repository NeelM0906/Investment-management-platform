import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave, AutoSaveOptions } from './useAutoSave';

// Mock session manager
jest.mock('../utils/sessionManager', () => ({
  getSessionId: () => 'test-session-id'
}));

// Mock fetch
global.fetch = jest.fn();

describe('useAutoSave', () => {
  const defaultOptions: AutoSaveOptions = {
    projectId: 'test-project-id',
    autoSaveInterval: 100, // Short interval for testing
    enableAutoSave: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock successful responses by default
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        data: { version: 1, lastSaved: new Date().toISOString() }
      })
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default save status', () => {
    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    expect(result.current.saveStatus.status).toBe('saved');
    expect(result.current.saveStatus.hasUnsavedChanges).toBe(false);
    expect(result.current.saveStatus.version).toBe(0);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('fetches save status on initialization', async () => {
    renderHook(() => useAutoSave(defaultOptions));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/projects/test-project-id/deal-room/save-status?sessionId=test-session-id'
      );
    });
  });

  it('attempts to recover unsaved changes on initialization', async () => {
    const mockRecoveredData = {
      investmentBlurb: 'Recovered content'
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { version: 1 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          data: { draftData: mockRecoveredData, version: 2 }
        })
      });

    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/projects/test-project-id/deal-room/recover-changes?sessionId=test-session-id'
      );
    });

    const recoveredData = await result.current.recoverUnsavedChanges();
    expect(recoveredData).toEqual(mockRecoveredData);
  });

  it('triggers auto-save after interval when data changes', async () => {
    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    // Save draft data
    act(() => {
      result.current.saveDraft({ investmentBlurb: 'Test content' }, true);
    });

    expect(result.current.saveStatus.status).toBe('unsaved');
    expect(result.current.hasUnsavedChanges).toBe(true);

    // Fast-forward time to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(defaultOptions.autoSaveInterval!);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/projects/test-project-id/deal-room/draft',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'test-session-id',
            draftData: { investmentBlurb: 'Test content' },
            isAutoSave: true
          })
        })
      );
    });
  });

  it('saves draft manually when isAutoSave is false', async () => {
    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    await act(async () => {
      await result.current.saveDraft({ investmentBlurb: 'Manual save' }, false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/test-project-id/deal-room/draft',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'test-session-id',
          draftData: { investmentBlurb: 'Manual save' },
          isAutoSave: false
        })
      })
    );
  });

  it('validates data before saving when validator is provided', async () => {
    const validator = jest.fn().mockReturnValue({
      isValid: false,
      errors: ['Investment blurb is too long']
    });

    const onSaveError = jest.fn();

    const { result } = renderHook(() => useAutoSave({
      ...defaultOptions,
      validateBeforeSave: validator,
      onSaveError
    }));
    
    await act(async () => {
      await result.current.saveDraft({ investmentBlurb: 'a'.repeat(501) }, false);
    });

    expect(validator).toHaveBeenCalledWith({ investmentBlurb: 'a'.repeat(501) });
    expect(onSaveError).toHaveBeenCalledWith('Validation failed: Investment blurb is too long');
    expect(result.current.saveStatus.status).toBe('error');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('publishes draft successfully', async () => {
    const onSaveSuccess = jest.fn();
    
    const { result } = renderHook(() => useAutoSave({
      ...defaultOptions,
      onSaveSuccess
    }));
    
    await act(async () => {
      await result.current.publishDraft('Updated investment summary');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/test-project-id/deal-room/draft/publish',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'test-session-id',
          changeDescription: 'Updated investment summary'
        })
      })
    );

    expect(onSaveSuccess).toHaveBeenCalled();
    expect(result.current.saveStatus.status).toBe('saved');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('handles conflict detection during save', async () => {
    const onConflictDetected = jest.fn();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({
        error: { conflictId: 'conflict-123' }
      })
    });

    const { result } = renderHook(() => useAutoSave({
      ...defaultOptions,
      onConflictDetected
    }));
    
    await act(async () => {
      await result.current.saveDraft({ investmentBlurb: 'Conflicting content' }, false);
    });

    expect(onConflictDetected).toHaveBeenCalledWith('conflict-123');
    expect(result.current.saveStatus.status).toBe('conflict');
    expect(result.current.saveStatus.conflictId).toBe('conflict-123');
  });

  it('handles save errors gracefully', async () => {
    const onSaveError = jest.fn();
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAutoSave({
      ...defaultOptions,
      onSaveError
    }));
    
    await act(async () => {
      await result.current.saveDraft({ investmentBlurb: 'Test content' }, false);
    });

    expect(onSaveError).toHaveBeenCalledWith('Network error');
    expect(result.current.saveStatus.status).toBe('error');
    expect(result.current.saveStatus.error).toBe('Network error');
  });

  it('clears draft and resets state', async () => {
    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    // Set some unsaved changes
    act(() => {
      result.current.saveDraft({ investmentBlurb: 'Test content' }, true);
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    // Clear draft
    await act(async () => {
      await result.current.clearDraft();
    });

    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.saveStatus.status).toBe('saved');
  });

  it('handles setSaving state updates', () => {
    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    act(() => {
      result.current.setSaving(true);
    });

    expect(result.current.saveStatus.status).toBe('saving');

    act(() => {
      result.current.setSaving(false);
    });

    expect(result.current.saveStatus.status).toBe('saved');
  });

  it('does not auto-save when enableAutoSave is false', async () => {
    const { result } = renderHook(() => useAutoSave({
      ...defaultOptions,
      enableAutoSave: false
    }));
    
    act(() => {
      result.current.saveDraft({ investmentBlurb: 'Test content' }, true);
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(defaultOptions.autoSaveInterval! * 2);
    });

    // Should not have made auto-save request
    expect(global.fetch).toHaveBeenCalledTimes(2); // Only initial status and recovery calls
  });

  it('cancels previous auto-save timeout when new data is set', async () => {
    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    // Set first data
    act(() => {
      result.current.saveDraft({ investmentBlurb: 'First content' }, true);
    });

    // Set second data before first auto-save triggers
    act(() => {
      result.current.saveDraft({ investmentBlurb: 'Second content' }, true);
    });

    // Fast-forward time to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(defaultOptions.autoSaveInterval!);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/projects/test-project-id/deal-room/draft',
        expect.objectContaining({
          body: JSON.stringify({
            sessionId: 'test-session-id',
            draftData: { investmentBlurb: 'Second content' },
            isAutoSave: true
          })
        })
      );
    });

    // Should only have been called once for the second content
    const draftCalls = (global.fetch as jest.Mock).mock.calls.filter(
      call => call[0].includes('/draft') && !call[0].includes('/publish')
    );
    expect(draftCalls).toHaveLength(1);
  });

  it('handles publish errors gracefully', async () => {
    const onSaveError = jest.fn();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({
        error: { message: 'No draft found to publish' }
      })
    });

    const { result } = renderHook(() => useAutoSave({
      ...defaultOptions,
      onSaveError
    }));
    
    await act(async () => {
      await result.current.publishDraft();
    });

    expect(onSaveError).toHaveBeenCalledWith('No draft found to publish');
    expect(result.current.saveStatus.status).toBe('error');
  });

  it('recovers unsaved changes successfully', async () => {
    const mockRecoveredData = {
      investmentBlurb: 'Recovered content',
      investmentSummary: 'Recovered summary'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        data: { draftData: mockRecoveredData, version: 3 }
      })
    });

    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    const recoveredData = await act(async () => {
      return await result.current.recoverUnsavedChanges();
    });

    expect(recoveredData).toEqual(mockRecoveredData);
    expect(result.current.saveStatus.hasUnsavedChanges).toBe(true);
    expect(result.current.saveStatus.status).toBe('unsaved');
    expect(result.current.saveStatus.version).toBe(3);
  });

  it('handles recovery when no unsaved changes exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, data: null })
    });

    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    const recoveredData = await act(async () => {
      return await result.current.recoverUnsavedChanges();
    });

    expect(recoveredData).toBeNull();
  });

  it('handles recovery errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Recovery failed'));

    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    const recoveredData = await act(async () => {
      return await result.current.recoverUnsavedChanges();
    });

    expect(recoveredData).toBeNull();
  });

  it('calls success callback on successful save', async () => {
    const onSaveSuccess = jest.fn();
    const mockResponseData = { version: 2, lastSaved: new Date().toISOString() };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockResponseData })
    });

    const { result } = renderHook(() => useAutoSave({
      ...defaultOptions,
      onSaveSuccess
    }));
    
    await act(async () => {
      await result.current.saveDraft({ investmentBlurb: 'Test content' }, false);
    });

    expect(onSaveSuccess).toHaveBeenCalledWith(mockResponseData);
  });

  it('updates save status correctly after successful auto-save', async () => {
    const { result } = renderHook(() => useAutoSave(defaultOptions));
    
    act(() => {
      result.current.saveDraft({ investmentBlurb: 'Auto-save content' }, true);
    });

    expect(result.current.saveStatus.status).toBe('unsaved');

    // Trigger auto-save
    act(() => {
      jest.advanceTimersByTime(defaultOptions.autoSaveInterval!);
    });

    await waitFor(() => {
      expect(result.current.saveStatus.status).toBe('saved');
      expect(result.current.saveStatus.lastAutoSave).toBeInstanceOf(Date);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });
});