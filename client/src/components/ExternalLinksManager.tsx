import React, { useState, useEffect, useRef, useCallback } from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { validateAndNormalizeUrl, extractDomain, suggestUrlType } from '../utils/urlValidation';
import './ExternalLinksManager.css';

interface ExternalLink {
  id: string;
  name: string;
  url: string;
  order: number;
}

interface ExternalLinksManagerProps {
  projectId: string;
  externalLinks: ExternalLink[];
  onUpdate: (externalLinks: ExternalLink[]) => void;
  saving: boolean;
}

interface ExternalLinkFormData {
  name: string;
  url: string;
}

const ExternalLinksManager: React.FC<ExternalLinksManagerProps> = ({
  projectId,
  externalLinks,
  onUpdate,
  saving
}) => {
  const [links, setLinks] = useState<ExternalLink[]>(externalLinks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExternalLinkFormData>({ name: '', url: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [validatingUrls] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    linkId: string;
    linkName: string;
  }>({ isOpen: false, linkId: '', linkName: '' });
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = useCallback(async () => {
    if (!hasChanges || saving) return;

    try {
      setError(null);
      await onUpdate(links);
      setHasChanges(false);
      setSuccess('External links saved successfully!');
      
      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save external links');
    }
  }, [hasChanges, saving, onUpdate, links]);

  useEffect(() => {
    setLinks(externalLinks);
    setHasChanges(false);
  }, [externalLinks]);

  useEffect(() => {
    // Auto-save after 2 seconds of inactivity
    if (hasChanges && !saving) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [links, hasChanges, saving, handleSave]);

  const [urlWarning, setUrlWarning] = useState<string | null>(null);

  const handleAddLink = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      setError('Both name and URL are required');
      return;
    }

    const validation = validateAndNormalizeUrl(formData.url.trim());
    
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid URL');
      return;
    }

    // Show warning if there is one, but continue
    if (validation.warning) {
      setUrlWarning(validation.warning);
    } else {
      setUrlWarning(null);
    }

    const urlType = suggestUrlType(validation.normalizedUrl);
    
    const newLink: ExternalLink = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      url: validation.normalizedUrl,
      order: links.length
    };

    const newLinks = [...links, newLink];
    setLinks(newLinks);
    setHasChanges(true);
    setFormData({ name: '', url: '' });
    setShowAddForm(false);
    setError(null);
    
    // Show success message with URL type if detected
    if (urlType) {
      setSuccess(`${urlType} link added successfully!`);
    }
  };

  const handleEditLink = (link: ExternalLink) => {
    setEditingId(link.id);
    setFormData({ name: link.name, url: link.url });
  };

  const handleUpdateLink = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      setError('Both name and URL are required');
      return;
    }

    const validation = validateAndNormalizeUrl(formData.url.trim());
    
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid URL');
      return;
    }

    // Show warning if there is one, but continue
    if (validation.warning) {
      setUrlWarning(validation.warning);
    } else {
      setUrlWarning(null);
    }

    const urlType = suggestUrlType(validation.normalizedUrl);

    const newLinks = links.map(link =>
      link.id === editingId
        ? { ...link, name: formData.name.trim(), url: validation.normalizedUrl }
        : link
    );

    setLinks(newLinks);
    setHasChanges(true);
    setEditingId(null);
    setFormData({ name: '', url: '' });
    setError(null);
    
    // Show success message with URL type if detected
    if (urlType) {
      setSuccess(`${urlType} link updated successfully!`);
    }
  };

  const handleDeleteLink = (id: string) => {
    const link = links.find(link => link.id === id);
    if (!link) return;

    setDeleteConfirmation({
      isOpen: true,
      linkId: id,
      linkName: link.name
    });
  };

  const confirmDelete = () => {
    const newLinks = links
      .filter(link => link.id !== deleteConfirmation.linkId)
      .map((link, index) => ({ ...link, order: index }));

    setLinks(newLinks);
    setHasChanges(true);
    setDeleteConfirmation({ isOpen: false, linkId: '', linkName: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, linkId: '', linkName: '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', url: '' });
    setError(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, linkId: string) => {
    setDraggedItem(linkId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, linkId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(linkId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedIndex = links.findIndex(link => link.id === draggedItem);
    const targetIndex = links.findIndex(link => link.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newLinks = [...links];
    const [draggedLinkData] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, draggedLinkData);

    // Update order values
    const reorderedLinks = newLinks.map((link, index) => ({
      ...link,
      order: index
    }));

    setLinks(reorderedLinks);
    setHasChanges(true);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const getLinkPreview = (url: string): string => {
    return extractDomain(url);
  };

  return (
    <div className="external-links-manager">
      <div className="section-header">
        <h2>External Links</h2>
        <p className="section-description">
          Add external websites and resources that potential investors should visit. 
          These could include company websites, industry reports, or relevant third-party resources.
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

      {/* URL Warning Message */}
      {urlWarning && (
        <div className="warning-message">
          <span className="warning-icon">⚠</span>
          <span>{urlWarning}</span>
          <button onClick={() => setUrlWarning(null)} className="dismiss-button">×</button>
        </div>
      )}

      {/* Status Indicator */}
      <div className="status-bar">
        <div className="status-info">
          <span className="item-count">{links.length} external links</span>
          {hasChanges && !saving && (
            <span className="unsaved-indicator">
              <span className="unsaved-dot"></span>
              Unsaved changes
            </span>
          )}
          {saving && (
            <span className="saving-indicator">
              <div className="saving-spinner"></div>
              Saving...
            </span>
          )}
          {!hasChanges && !saving && links.length > 0 && (
            <span className="saved-indicator">
              <span className="saved-icon">✓</span>
              Saved
            </span>
          )}
        </div>
        
        <div className="status-actions">
          <button
            onClick={() => setShowAddForm(true)}
            className="add-button"
            disabled={showAddForm || editingId !== null}
          >
            + Add External Link
          </button>
        </div>
      </div>

      {/* External Links List */}
      <div className="external-links-list">
        {links.length === 0 && !showAddForm && (
          <div className="empty-state">
            <div className="empty-icon">🌐</div>
            <h3>No external links yet</h3>
            <p>Add external websites and resources for potential investors to explore.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="empty-add-button"
            >
              Add Your First External Link
            </button>
          </div>
        )}

        {links.map((link) => (
          <div
            key={link.id}
            className={`external-link-item ${draggedItem === link.id ? 'dragging' : ''} ${dragOverItem === link.id ? 'drag-over' : ''}`}
            draggable={editingId === null && !showAddForm}
            onDragStart={(e) => handleDragStart(e, link.id)}
            onDragOver={(e) => handleDragOver(e, link.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, link.id)}
            onDragEnd={handleDragEnd}
          >
            {editingId === link.id ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Link Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Company Website, Industry Report"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    onClick={handleUpdateLink} 
                    className="save-button"
                    disabled={validatingUrls.has(link.id)}
                  >
                    {validatingUrls.has(link.id) ? 'Validating...' : 'Save Changes'}
                  </button>
                  <button onClick={handleCancelEdit} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="item-content">
                <div className="drag-handle" title="Drag to reorder">
                  ⋮⋮
                </div>
                <div className="item-info">
                  <h4 className="item-name">{link.name}</h4>
                  <div className="item-url-info">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="item-url"
                    >
                      {link.url}
                    </a>
                    <span className="url-preview">
                      {getLinkPreview(link.url)}
                    </span>
                  </div>
                </div>
                <div className="item-actions">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="visit-button"
                    title="Visit link"
                  >
                    🔗
                  </a>
                  <button
                    onClick={() => handleEditLink(link)}
                    className="edit-button"
                    disabled={editingId !== null || showAddForm}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="delete-button"
                    disabled={editingId !== null || showAddForm}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Form */}
        {showAddForm && (
          <div className="external-link-item add-form">
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Link Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Company Website, Industry Report"
                    className="form-input"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  onClick={handleAddLink} 
                  className="save-button"
                  disabled={validatingUrls.has('new')}
                >
                  {validatingUrls.has('new') ? 'Validating...' : 'Add External Link'}
                </button>
                <button onClick={handleCancelEdit} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Save Button */}
      {hasChanges && (
        <div className="manual-save">
          <button
            onClick={handleSave}
            disabled={saving}
            className="manual-save-button"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}

      {/* Usage Tips */}
      <div className="usage-tips">
        <h3>Tips for External Links</h3>
        <ul>
          <li><strong>Use descriptive names:</strong> Make it clear what each link leads to</li>
          <li><strong>Verify accessibility:</strong> Ensure all links are publicly accessible</li>
          <li><strong>Organize by importance:</strong> Drag and drop to reorder links by relevance</li>
          <li><strong>Include variety:</strong> Company sites, industry reports, news articles, etc.</li>
          <li><strong>Keep it current:</strong> Regularly check that links are still active</li>
          <li><strong>Consider the audience:</strong> Only include links that add value for investors</li>
        </ul>
      </div>

      {/* Auto-save Notice */}
      <div className="auto-save-notice">
        <p>
          <span className="info-icon">ℹ</span>
          Changes are automatically saved after 2 seconds of inactivity. 
          You can also save manually using the button above.
        </p>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete External Link"
        message={`Are you sure you want to delete "${deleteConfirmation.linkName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </div>
  );
};

export default ExternalLinksManager;