import React, { useState, useEffect, useRef, useCallback } from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { validateAndNormalizeUrl, suggestUrlType } from '../utils/urlValidation';
import './KeyInfoManager.css';

interface KeyInfoItem {
  id: string;
  name: string;
  link: string;
  order: number;
}

interface KeyInfoManagerProps {
  projectId: string;
  keyInfo: KeyInfoItem[];
  onUpdate: (keyInfo: KeyInfoItem[]) => void;
  saving: boolean;
}

interface KeyInfoFormData {
  name: string;
  link: string;
}

const KeyInfoManager: React.FC<KeyInfoManagerProps> = ({
  projectId,
  keyInfo,
  onUpdate,
  saving
}) => {
  const [items, setItems] = useState<KeyInfoItem[]>(keyInfo);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<KeyInfoFormData>({ name: '', link: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
  }>({ isOpen: false, itemId: '', itemName: '' });
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = useCallback(async () => {
    if (!hasChanges || saving) return;

    try {
      setError(null);
      await onUpdate(items);
      setHasChanges(false);
      setSuccess('Key info saved successfully!');
      
      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save key info');
    }
  }, [hasChanges, saving, onUpdate, items]);

  useEffect(() => {
    setItems(keyInfo);
    setHasChanges(false);
  }, [keyInfo]);

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
  }, [items, hasChanges, saving, handleSave]);

  const [urlWarning, setUrlWarning] = useState<string | null>(null);

  const handleAddItem = () => {
    if (!formData.name.trim() || !formData.link.trim()) {
      setError('Both name and link are required');
      return;
    }

    const validation = validateAndNormalizeUrl(formData.link.trim());
    
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

    const newItem: KeyInfoItem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      link: validation.normalizedUrl,
      order: items.length
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    setHasChanges(true);
    setFormData({ name: '', link: '' });
    setShowAddForm(false);
    setError(null);
    
    // Show success message with URL type if detected
    if (urlType) {
      setSuccess(`${urlType} key info added successfully!`);
    }
  };

  const handleEditItem = (item: KeyInfoItem) => {
    setEditingId(item.id);
    setFormData({ name: item.name, link: item.link });
  };

  const handleUpdateItem = () => {
    if (!formData.name.trim() || !formData.link.trim()) {
      setError('Both name and link are required');
      return;
    }

    const validation = validateAndNormalizeUrl(formData.link.trim());
    
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

    const newItems = items.map(item =>
      item.id === editingId
        ? { ...item, name: formData.name.trim(), link: validation.normalizedUrl }
        : item
    );

    setItems(newItems);
    setHasChanges(true);
    setEditingId(null);
    setFormData({ name: '', link: '' });
    setError(null);
    
    // Show success message with URL type if detected
    if (urlType) {
      setSuccess(`${urlType} key info updated successfully!`);
    }
  };

  const handleDeleteItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    setDeleteConfirmation({
      isOpen: true,
      itemId: id,
      itemName: item.name
    });
  };

  const confirmDelete = () => {
    const newItems = items
      .filter(item => item.id !== deleteConfirmation.itemId)
      .map((item, index) => ({ ...item, order: index }));

    setItems(newItems);
    setHasChanges(true);
    setDeleteConfirmation({ isOpen: false, itemId: '', itemName: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, itemId: '', itemName: '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', link: '' });
    setError(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(itemId);
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

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newItems = [...items];
    const [draggedItemData] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemData);

    // Update order values
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }));

    setItems(reorderedItems);
    setHasChanges(true);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="key-info-manager">
      <div className="section-header">
        <h2>Key Info</h2>
        <p className="section-description">
          Add important links and resources that potential investors should know about. 
          These could include documents, websites, or other relevant information.
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
          <span className="item-count">{items.length} key info items</span>
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
          {!hasChanges && !saving && items.length > 0 && (
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
            + Add Key Info
          </button>
        </div>
      </div>

      {/* Key Info List */}
      <div className="key-info-list">
        {items.length === 0 && !showAddForm && (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>No key info items yet</h3>
            <p>Add important links and resources for potential investors to access.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="empty-add-button"
            >
              Add Your First Key Info Item
            </button>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`key-info-item ${draggedItem === item.id ? 'dragging' : ''} ${dragOverItem === item.id ? 'drag-over' : ''}`}
            draggable={editingId === null && !showAddForm}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
          >
            {editingId === item.id ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Info Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Financial Projections, Market Analysis"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Info Link</label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://example.com/document.pdf"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={handleUpdateItem} className="save-button">
                    Save Changes
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
                  <h4 className="item-name">{item.name}</h4>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="item-link"
                  >
                    {item.link}
                  </a>
                </div>
                <div className="item-actions">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="edit-button"
                    disabled={editingId !== null || showAddForm}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
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
          <div className="key-info-item add-form">
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Info Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Financial Projections, Market Analysis"
                    className="form-input"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Info Link</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://example.com/document.pdf"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button onClick={handleAddItem} className="save-button">
                  Add Key Info
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
        <h3>Tips for Key Info</h3>
        <ul>
          <li><strong>Be descriptive:</strong> Use clear, specific names for each info item</li>
          <li><strong>Verify links:</strong> Make sure all URLs are accessible to investors</li>
          <li><strong>Organize logically:</strong> Drag and drop to reorder items by importance</li>
          <li><strong>Include essentials:</strong> Financial documents, legal papers, market research</li>
          <li><strong>Keep it relevant:</strong> Only include information that adds value for investors</li>
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
        title="Delete Key Info Item"
        message={`Are you sure you want to delete "${deleteConfirmation.itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </div>
  );
};

export default KeyInfoManager;