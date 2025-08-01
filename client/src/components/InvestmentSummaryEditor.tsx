import React, { useState, useEffect, useRef } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import './InvestmentSummaryEditor.css';

interface InvestmentSummaryEditorProps {
  projectId: string;
  initialValue: string;
  onUpdate: (value: string) => void;
  saving: boolean;
}

interface SectionTemplate {
  id: string;
  name: string;
  content: string;
}

const InvestmentSummaryEditor: React.FC<InvestmentSummaryEditorProps> = ({
  projectId,
  initialValue,
  onUpdate,
  saving
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
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
    autoSaveInterval: 3000,
    enableAutoSave: true,
    onSaveSuccess: () => {
      setSuccess('Investment summary saved successfully!');
      setTimeout(() => setSuccess(null), 2000);
    },
    onSaveError: (errorMsg) => {
      setError(errorMsg);
    },
    onConflictDetected: (conflictId) => {
      setError(`Conflict detected: ${conflictId}. Please resolve the conflict before continuing.`);
    },
    validateBeforeSave: (data) => {
      const summary = data.investmentSummary || '';
      const errors: string[] = [];
      
      if (summary.length > 10000) {
        errors.push('Investment summary must be less than 10,000 characters');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  });

  const sectionTemplates: SectionTemplate[] = [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      content: `# Executive Summary

## Investment Opportunity
[Brief description of the investment opportunity]

## Key Highlights
- [Key highlight 1]
- [Key highlight 2]
- [Key highlight 3]

## Financial Overview
- **Target Amount:** $[amount]
- **Expected Return:** [percentage]%
- **Investment Period:** [timeframe]

## Next Steps
[Call to action for potential investors]`
    },
    {
      id: 'real-estate',
      name: 'Real Estate Investment',
      content: `# Real Estate Investment Summary

## Property Overview
**Location:** [Property address/area]
**Property Type:** [Residential/Commercial/Mixed-use]
**Total Square Footage:** [sq ft]

## Investment Details
- **Total Investment:** $[amount]
- **Expected IRR:** [percentage]%
- **Hold Period:** [years] years
- **Target Cash-on-Cash Return:** [percentage]%

## Market Analysis
### Location Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

### Market Trends
[Description of favorable market conditions]

## Financial Projections
### Year 1-3 Projections
- **Rental Income:** $[amount] annually
- **Operating Expenses:** $[amount] annually
- **Net Operating Income:** $[amount] annually

## Risk Factors
- [Risk factor 1]
- [Risk factor 2]
- [Risk factor 3]

## Investment Timeline
1. **Due Diligence:** [timeframe]
2. **Closing:** [date]
3. **Renovation/Improvements:** [timeframe]
4. **Stabilization:** [timeframe]
5. **Exit Strategy:** [timeframe]`
    },
    {
      id: 'startup-funding',
      name: 'Startup Funding',
      content: `# Startup Investment Summary

## Company Overview
**Company Name:** [Company name]
**Industry:** [Industry sector]
**Stage:** [Seed/Series A/Series B/etc.]
**Founded:** [Year]

## The Opportunity
### Problem Statement
[Description of the problem being solved]

### Solution
[Description of the company's solution]

### Market Size
- **Total Addressable Market (TAM):** $[amount]
- **Serviceable Addressable Market (SAM):** $[amount]
- **Serviceable Obtainable Market (SOM):** $[amount]

## Business Model
[Description of how the company makes money]

## Traction & Metrics
- **Revenue:** $[amount] ([growth]% growth)
- **Customers:** [number] ([growth]% growth)
- **Monthly Recurring Revenue:** $[amount]
- **Customer Acquisition Cost:** $[amount]
- **Lifetime Value:** $[amount]

## Team
### Key Team Members
- **[Name], [Title]:** [Brief background]
- **[Name], [Title]:** [Brief background]
- **[Name], [Title]:** [Brief background]

## Funding Details
- **Funding Round:** [Series/Stage]
- **Amount Raising:** $[amount]
- **Valuation:** $[amount]
- **Use of Funds:**
  - [Use 1]: [percentage]%
  - [Use 2]: [percentage]%
  - [Use 3]: [percentage]%

## Financial Projections
### 3-Year Revenue Projection
- **Year 1:** $[amount]
- **Year 2:** $[amount]
- **Year 3:** $[amount]

## Competitive Advantage
- [Advantage 1]
- [Advantage 2]
- [Advantage 3]

## Exit Strategy
[Description of potential exit opportunities]`
    }
  ];

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Recover unsaved changes on component mount
  useEffect(() => {
    const recoverChanges = async () => {
      const recoveredData = await recoverUnsavedChanges();
      if (recoveredData && recoveredData.investmentSummary) {
        setValue(recoveredData.investmentSummary);
        setSuccess('Unsaved changes recovered!');
        setTimeout(() => setSuccess(null), 3000);
      }
    };
    
    recoverChanges();
  }, [recoverUnsavedChanges]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setError(null);
    
    // Trigger auto-save
    saveDraft({ investmentSummary: newValue }, true);
  };

  const handleSave = async () => {
    if (saveStatus.status === 'saving') return;

    try {
      setError(null);
      await saveDraft({ investmentSummary: value }, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save investment summary');
    }
  };

  const handlePublish = async () => {
    if (saveStatus.status === 'saving') return;

    try {
      setError(null);
      await publishDraft('Updated investment summary');
      await onUpdate(value); // Update parent component
      setSuccess('Investment summary published successfully!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish investment summary');
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
          insertFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          insertFormatting('italic');
          break;
        case '1':
          e.preventDefault();
          insertFormatting('heading1');
          break;
        case '2':
          e.preventDefault();
          insertFormatting('heading2');
          break;
        case '3':
          e.preventDefault();
          insertFormatting('heading3');
          break;
        case 'k':
          e.preventDefault();
          insertFormatting('link');
          break;
        case 'e':
          e.preventDefault();
          insertFormatting('code');
          break;
        default:
          break;
      }
    }

    // Handle tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (e.shiftKey) {
        // Remove indentation
        const lines = value.split('\n');
        const startLine = value.substring(0, start).split('\n').length - 1;
        const endLine = value.substring(0, end).split('\n').length - 1;
        
        for (let i = startLine; i <= endLine; i++) {
          if (lines[i].startsWith('  ')) {
            lines[i] = lines[i].substring(2);
          }
        }
        
        const newValue = lines.join('\n');
        setValue(newValue);
        
        // Trigger auto-save
        saveDraft({ investmentSummary: newValue }, true);
      } else {
        // Add indentation
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        setValue(newValue);
        
        // Trigger auto-save
        saveDraft({ investmentSummary: newValue }, true);
        
        // Set cursor position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  const insertTemplate = (template: SectionTemplate) => {
    const newValue = value + (value ? '\n\n' : '') + template.content;
    setValue(newValue);
    setShowTemplates(false);
    
    // Trigger auto-save
    saveDraft({ investmentSummary: newValue }, true);
    
    // Focus textarea and scroll to bottom
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  const insertFormatting = (format: string) => {
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
      case 'heading1':
        newText = `# ${selectedText || 'Main Heading'}`;
        cursorOffset = selectedText ? 0 : -12;
        break;
      case 'heading2':
        newText = `## ${selectedText || 'Section Heading'}`;
        cursorOffset = selectedText ? 0 : -15;
        break;
      case 'heading3':
        newText = `### ${selectedText || 'Subsection'}`;
        cursorOffset = selectedText ? 0 : -10;
        break;
      case 'list':
        newText = `- ${selectedText || 'List item'}`;
        cursorOffset = selectedText ? 0 : -9;
        break;
      case 'numbered-list':
        newText = `1. ${selectedText || 'Numbered item'}`;
        cursorOffset = selectedText ? 0 : -13;
        break;
      case 'link':
        newText = `[${selectedText || 'Link text'}](URL)`;
        cursorOffset = selectedText ? -5 : -13;
        break;
      case 'quote':
        newText = `> ${selectedText || 'Quote text'}`;
        cursorOffset = selectedText ? 0 : -10;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'table':
        newText = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;
        cursorOffset = 0;
        break;
      case 'horizontal-rule':
        newText = '\n---\n';
        cursorOffset = 0;
        break;
      default:
        return;
    }
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    setValue(newValue);
    
    // Trigger auto-save
    saveDraft({ investmentSummary: newValue }, true);
    
    // Set cursor position
    setTimeout(() => {
      const newPosition = start + newText.length + cursorOffset;
      textarea.selectionStart = textarea.selectionEnd = newPosition;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="investment-summary-editor">
      <div className="section-header">
        <h2>Investment Summary</h2>
        <p className="section-description">
          Create a comprehensive investment summary with detailed information about your opportunity. 
          Use formatting and templates to create professional documentation.
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

      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-section">
          <button
            onClick={() => insertFormatting('bold')}
            className="toolbar-button"
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => insertFormatting('italic')}
            className="toolbar-button"
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => insertFormatting('code')}
            className="toolbar-button"
            title="Inline Code"
          >
            &lt;/&gt;
          </button>
        </div>
        
        <div className="toolbar-section">
          <button
            onClick={() => insertFormatting('heading1')}
            className="toolbar-button"
            title="Main Heading"
          >
            H1
          </button>
          <button
            onClick={() => insertFormatting('heading2')}
            className="toolbar-button"
            title="Section Heading"
          >
            H2
          </button>
          <button
            onClick={() => insertFormatting('heading3')}
            className="toolbar-button"
            title="Subsection"
          >
            H3
          </button>
        </div>
        
        <div className="toolbar-section">
          <button
            onClick={() => insertFormatting('list')}
            className="toolbar-button"
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => insertFormatting('numbered-list')}
            className="toolbar-button"
            title="Numbered List"
          >
            1.
          </button>
          <button
            onClick={() => insertFormatting('quote')}
            className="toolbar-button"
            title="Quote"
          >
            "
          </button>
        </div>
        
        <div className="toolbar-section">
          <button
            onClick={() => insertFormatting('link')}
            className="toolbar-button"
            title="Link"
          >
            🔗
          </button>
          <button
            onClick={() => insertFormatting('table')}
            className="toolbar-button"
            title="Table"
          >
            ⊞
          </button>
          <button
            onClick={() => insertFormatting('horizontal-rule')}
            className="toolbar-button"
            title="Horizontal Rule"
          >
            ―
          </button>
        </div>
        
        <div className="toolbar-section">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="toolbar-button template-button"
          >
            📄 Templates
          </button>
        </div>

        <div className="toolbar-section">
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
        </div>
      </div>

      {/* Templates Dropdown */}
      {showTemplates && (
        <div className="templates-dropdown">
          <div className="templates-header">
            <h3>Section Templates</h3>
            <button 
              onClick={() => setShowTemplates(false)}
              className="close-templates"
            >
              ×
            </button>
          </div>
          <div className="templates-list">
            {sectionTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => insertTemplate(template)}
                className="template-item"
              >
                <span className="template-name">{template.name}</span>
                <span className="template-preview">
                  {template.content.split('\n')[0].replace('#', '').trim()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="editor-container">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write your comprehensive investment summary here. Use the toolbar above for formatting, or insert a template to get started..."
          className="summary-textarea"
          rows={20}
          disabled={saveStatus.status === 'saving'}
        />

        <div className="editor-footer">
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

      {/* Formatting Guide */}
      <div className="formatting-guide">
        <h3>Formatting Guide & Shortcuts</h3>
        <div className="formatting-examples">
          <div className="format-example">
            <code>**Bold text**</code> → <strong>Bold text</strong> <kbd>Ctrl+B</kbd>
          </div>
          <div className="format-example">
            <code>*Italic text*</code> → <em>Italic text</em> <kbd>Ctrl+I</kbd>
          </div>
          <div className="format-example">
            <code># Main Heading</code> → <strong>Main Heading</strong> <kbd>Ctrl+1</kbd>
          </div>
          <div className="format-example">
            <code>## Section</code> → <strong>Section</strong> <kbd>Ctrl+2</kbd>
          </div>
          <div className="format-example">
            <code>### Subsection</code> → <strong>Subsection</strong> <kbd>Ctrl+3</kbd>
          </div>
          <div className="format-example">
            <code>- List item</code> → • List item
          </div>
          <div className="format-example">
            <code>1. Numbered</code> → 1. Numbered item
          </div>
          <div className="format-example">
            <code>[Link text](URL)</code> → <span style={{color: '#0066cc'}}>Link text</span> <kbd>Ctrl+K</kbd>
          </div>
          <div className="format-example">
            <code>`code`</code> → <code>code</code> <kbd>Ctrl+E</kbd>
          </div>
          <div className="format-example">
            <code>&gt; Quote</code> → <em>Quote text</em>
          </div>
        </div>
      </div>

      {/* Auto-save Notice */}
      <div className="auto-save-notice">
        <p>
          <span className="info-icon">ℹ</span>
          Changes are automatically saved as drafts after 3 seconds of inactivity. 
          Press <kbd>Ctrl+S</kbd> to save draft manually or <kbd>Ctrl+Shift+S</kbd> to publish changes.
          Use <kbd>Tab</kbd> to indent and <kbd>Shift+Tab</kbd> to unindent.
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

export default InvestmentSummaryEditor;