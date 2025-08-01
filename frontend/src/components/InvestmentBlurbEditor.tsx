import React, { useState, useEffect, useRef } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import './InvestmentBlurbEditor.css';

interface InvestmentBlurbEditorProps {
  projectId: string;
  initialValue: string;
  onUpdate: (value: string) => void;
  saving: boolean;
}

const InvestmentBlurbEditor: React.FC<InvestmentBlurbEditorProps> = ({
  projectId,
  initialValue,
  onUpdate,
  saving
}) => {
  const [value, setValue] = useState(initialValue);
  const [characterCount, setCharacterCount] = useState(initialValue.length);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save hook
  const {
    saveStatus,
    saveDraft,
    publishDraft,
    recoverUnsavedChanges,
    hasUnsavedChanges
  } = useAutoSave({
    projectId,
    autoSaveInterval: 2000,
    enableAutoSave: true,
    onSaveSuccess: () => {
      setSuccess('Investment blurb saved successfully!');
      setTimeout(() => setSuccess(null), 2000);
    },
    onSaveError: (errorMsg) => {
      setError(errorMsg);
    },
    onConflictDetected: (conflictId) => {
      setError(`Conflict detected: ${conflictId}. Please resolve the conflict before continuing.`);
    },
    validateBeforeSave: (data) => {
      const blurb = data.investmentBlurb || '';
      const errors: string[] = [];
      
      if (blurb.trim().length === 0) {
        errors.push('Investment blurb cannot be empty');
      }
      if (blurb.length < MIN_LENGTH) {
        errors.push(`Investment blurb should be at least ${MIN_LENGTH} characters for effectiveness`);
      }
      if (blurb.length > MAX_LENGTH) {
        errors.push(`Investment blurb must be less than ${MAX_LENGTH} characters`);
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  });

  const MAX_LENGTH = 500;
  const RECOMMENDED_LENGTH = 300;
  const MIN_LENGTH = 50;

  useEffect(() => {
    setValue(initialValue);
    setCharacterCount(initialValue.length);
  }, [initialValue]);

  // Recover unsaved changes on component mount
  useEffect(() => {
    const recoverChanges = async () => {
      const recoveredData = await recoverUnsavedChanges();
      if (recoveredData && recoveredData.investmentBlurb) {
        setValue(recoveredData.investmentBlurb);
        setCharacterCount(recoveredData.investmentBlurb.length);
        setSuccess('Unsaved changes recovered!');
        setTimeout(() => setSuccess(null), 3000);
      }
    };
    
    recoverChanges();
  }, [recoverUnsavedChanges]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Enforce character limit
    if (newValue.length <= MAX_LENGTH) {
      setValue(newValue);
      setCharacterCount(newValue.length);
      setError(null);
      
      // Trigger auto-save
      saveDraft({ investmentBlurb: newValue }, true);
    }
  };

  const handleSave = async () => {
    if (saveStatus.status === 'saving') return;

    try {
      setError(null);
      await saveDraft({ investmentBlurb: value }, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save investment blurb');
    }
  };

  const handlePublish = async () => {
    if (saveStatus.status === 'saving') return;

    try {
      setError(null);
      await publishDraft('Updated investment blurb');
      await onUpdate(value); // Update parent component
      setSuccess('Investment blurb published successfully!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish investment blurb');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Publish on Ctrl+Shift+S or Cmd+Shift+S
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      handlePublish();
    }
    
    // Format shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertBasicFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          insertBasicFormatting('italic');
          break;
        default:
          break;
      }
    }
  };

  const insertBasicFormatting = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      default:
        return;
    }
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    if (newValue.length <= MAX_LENGTH) {
      setValue(newValue);
      setCharacterCount(newValue.length);
      setError(null);
      
      // Set cursor position
      setTimeout(() => {
        const newPosition = start + newText.length + cursorOffset;
        textarea.selectionStart = textarea.selectionEnd = newPosition;
        textarea.focus();
      }, 0);
    }
  };

  const getCharacterCountColor = () => {
    if (characterCount > MAX_LENGTH * 0.9) return '#dc2626'; // Red
    if (characterCount > RECOMMENDED_LENGTH) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const getCharacterCountStatus = () => {
    if (characterCount === 0) return 'Start writing your investment blurb...';
    if (characterCount > RECOMMENDED_LENGTH) return 'Consider keeping it concise for better impact';
    return 'Good length for an investment blurb';
  };

  return (
    <div className="investment-blurb-editor">
      <div className="section-header">
        <h2>Investment Blurb</h2>
        <p className="section-description">
          Write a compelling, concise summary of your investment opportunity. 
          This will be one of the first things potential investors see.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="dismiss-button">×</button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="dismiss-button">×</button>
        </div>
      )}

      {/* Editor */}
      <div className="editor-container">
        <div className="editor-header">
          <div className="editor-status">
            {saveStatus.status === 'saving' && (
              <div className="saving-indicator">
                <div className="saving-spinner"></div>
                <span>Saving...</span>
              </div>
            )}
            {saveStatus.status === 'unsaved' && (
              <div className="unsaved-indicator">
                <span className="unsaved-dot"></span>
                <span>Unsaved changes</span>
              </div>
            )}
            {saveStatus.status === 'saved' && (
              <div className="saved-indicator">
                <span className="saved-icon">✓</span>
                <span>Saved</span>
                {saveStatus.lastAutoSave && (
                  <span className="save-time">
                    {saveStatus.lastAutoSave.toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
            {saveStatus.status === 'error' && (
              <div className="error-indicator">
                <span className="error-icon">⚠</span>
                <span>Save failed</span>
              </div>
            )}
            {saveStatus.status === 'conflict' && (
              <div className="conflict-indicator">
                <span className="conflict-icon">⚡</span>
                <span>Conflict detected</span>
              </div>
            )}
          </div>
          
          <div className="character-counter">
            <span 
              className="character-count"
              style={{ color: getCharacterCountColor() }}
            >
              {characterCount}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter a compelling investment blurb that captures the essence of your opportunity. Keep it concise and engaging..."
          className="blurb-textarea"
          rows={6}
          disabled={saveStatus.status === 'saving'}
        />

        <div className="editor-footer">
          <div className="character-status">
            <span style={{ color: getCharacterCountColor() }}>
              {getCharacterCountStatus()}
            </span>
          </div>
          
          <div className="editor-actions">
            <button
              onClick={handleSave}
              disabled={saveStatus.status === 'saving' || !hasUnsavedChanges}
              className="save-button"
            >
              {saveStatus.status === 'saving' ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={saveStatus.status === 'saving'}
              className="publish-button"
            >
              {saveStatus.status === 'saving' ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="writing-tips">
        <h3>Writing Tips</h3>
        <ul>
          <li><strong>Be specific:</strong> Mention key numbers, timelines, or unique advantages</li>
          <li><strong>Show value:</strong> Explain what makes this investment opportunity special</li>
          <li><strong>Create urgency:</strong> Highlight time-sensitive aspects or limited availability</li>
          <li><strong>Use active voice:</strong> Make your writing more engaging and direct</li>
          <li><strong>End with impact:</strong> Conclude with your strongest selling point</li>
        </ul>
      </div>

      {/* Auto-save Notice */}
      <div className="auto-save-notice">
        <p>
          <span className="info-icon">ℹ</span>
          Changes are automatically saved as drafts after 2 seconds of inactivity. 
          Press <kbd>Ctrl+S</kbd> to save draft manually or <kbd>Ctrl+Shift+S</kbd> to publish changes.
        </p>
        {saveStatus.version > 0 && (
          <p className="version-info">
            <span className="version-icon">📝</span>
            Draft version: {saveStatus.version}
            {saveStatus.lastSaved && (
              <span className="last-published">
                • Last published: {saveStatus.lastSaved.toLocaleString()}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default InvestmentBlurbEditor;