import React from 'react';
import './ConfirmationDialog.css';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
  loading = false
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (loading) return;
    
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '❓';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  return (
    <div 
      className="confirmation-dialog-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`confirmation-dialog ${type}`}>
        <div className="dialog-header">
          <div className="dialog-icon">
            {getIcon()}
          </div>
          <h3 className="dialog-title">{title}</h3>
        </div>
        
        <div className="dialog-content">
          <p className="dialog-message">{message}</p>
        </div>
        
        <div className="dialog-actions">
          <button
            onClick={onCancel}
            className="dialog-button cancel-button"
            disabled={loading}
            autoFocus={!loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`dialog-button confirm-button ${type}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '0.5rem' }}></div>
                Loading...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;