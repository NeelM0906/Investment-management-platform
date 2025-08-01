import React, { useState, useEffect } from 'react';
import './CustomClassManager.css';

interface CustomUnitClass {
  id: string;
  name: string;
  createdAt: Date;
}

interface CustomClassManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (className: string) => void;
}

const CustomClassManager: React.FC<CustomClassManagerProps> = ({
  isOpen,
  onClose,
  onClassCreated
}) => {
  const [customClasses, setCustomClasses] = useState<CustomUnitClass[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomClasses();
    }
  }, [isOpen]);

  const fetchCustomClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/custom-unit-classes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch custom classes');
      }
      
      const data = await response.json();
      if (data.success) {
        setCustomClasses(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch custom classes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateClassName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Class name is required';
    }
    
    if (name.trim().length < 2) {
      return 'Class name must be at least 2 characters long';
    }
    
    if (name.trim().length > 50) {
      return 'Class name must be less than 50 characters';
    }
    
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
      return 'Class name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    
    if (customClasses.some(cls => cls.name.toLowerCase() === name.trim().toLowerCase())) {
      return 'A class with this name already exists';
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewClassName(value);
    
    // Real-time validation
    const error = validateClassName(value);
    setValidationError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newClassName.trim();
    const error = validateClassName(trimmedName);
    
    if (error) {
      setValidationError(error);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/custom-unit-classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create custom class');
      }
      
      const data = await response.json();
      if (data.success) {
        const newClass = data.data;
        setCustomClasses(prev => [...prev, newClass]);
        setNewClassName('');
        setValidationError(null);
        
        // Show success message
        setSuccessMessage(`Custom class "${newClass.name}" created successfully!`);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        // Notify parent component
        onClassCreated(newClass.name);
      } else {
        throw new Error(data.error?.message || 'Failed to create custom class');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom class');
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = (className: string) => {
    onClassCreated(className);
  };

  const handleDelete = async (classId: string, className: string) => {
    if (window.confirm(`Are you sure you want to delete the custom class "${className}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/custom-unit-classes/${classId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete custom class');
        }
        
        setCustomClasses(prev => prev.filter(cls => cls.id !== classId));
        setSuccessMessage(`Custom class "${className}" deleted successfully.`);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete custom class');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="custom-class-manager-overlay">
      <div className="custom-class-manager">
        <div className="manager-header">
          <h3>Manage Custom Unit Classes</h3>
          <button onClick={onClose} className="close-button" aria-label="Close">
            ×
          </button>
        </div>

        <div className="manager-content">
          {/* Create New Class Section */}
          <div className="create-section">
            <h4>Create New Custom Class</h4>
            <form onSubmit={handleSubmit} className="create-form">
              <div className="form-group">
                <label htmlFor="className">Class Name</label>
                <input
                  id="className"
                  type="text"
                  value={newClassName}
                  onChange={handleInputChange}
                  placeholder="Enter custom class name (e.g., Class B, Premium Class)"
                  className={validationError ? 'error' : ''}
                  disabled={loading}
                />
                {validationError && (
                  <span className="validation-error">{validationError}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !!validationError || !newClassName.trim()}
                className="create-button"
              >
                {loading ? 'Creating...' : 'Create Class'}
              </button>
            </form>
          </div>

          {/* Existing Classes Section */}
          <div className="existing-section">
            <h4>Existing Custom Classes</h4>
            {loading && customClasses.length === 0 ? (
              <div className="loading-state">Loading custom classes...</div>
            ) : customClasses.length === 0 ? (
              <div className="empty-state">
                <p>No custom classes created yet. Create your first custom class above.</p>
              </div>
            ) : (
              <div className="classes-list">
                {customClasses.map((customClass) => (
                  <div key={customClass.id} className="class-item">
                    <div className="class-info">
                      <span className="class-name">{customClass.name}</span>
                      <span className="class-date">
                        Created {new Date(customClass.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="class-actions">
                      <button
                        onClick={() => handleUseExisting(customClass.name)}
                        className="use-button"
                      >
                        Use This Class
                      </button>
                      <button
                        onClick={() => handleDelete(customClass.id, customClass.name)}
                        className="delete-button"
                        title="Delete custom class"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {successMessage && (
            <div className="success-message">
              <p>{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)} className="dismiss-success">
                Dismiss
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)} className="dismiss-error">
                Dismiss
              </button>
            </div>
          )}
        </div>

        <div className="manager-footer">
          <button onClick={onClose} className="cancel-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomClassManager;