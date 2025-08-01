import React, { useState, useEffect } from 'react';
import CustomClassManager from './CustomClassManager';
import './DebtEquityClassForm.css';

interface DebtEquityClass {
  id: string;
  projectId: string;
  unitClass: string;
  unitPrice: number;
  isOpenToInvestments: boolean;
  investmentIncrementAmount: number;
  minInvestmentAmount: number;
  maxInvestmentAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DebtEquityClassFormData {
  unitClass: string;
  unitPrice: number;
  isOpenToInvestments: boolean;
  investmentIncrementAmount: number;
  minInvestmentAmount: number;
  maxInvestmentAmount: number;
}

interface CustomUnitClass {
  id: string;
  name: string;
  createdAt: Date;
}

interface DebtEquityClassFormProps {
  projectId: string;
  editingClass?: DebtEquityClass | null;
  onSave: (classData: DebtEquityClassFormData) => void;
  onCancel: () => void;
}

const DebtEquityClassForm: React.FC<DebtEquityClassFormProps> = ({
  projectId,
  editingClass,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<DebtEquityClassFormData>({
    unitClass: '',
    unitPrice: 0,
    isOpenToInvestments: true,
    investmentIncrementAmount: 0,
    minInvestmentAmount: 0,
    maxInvestmentAmount: 0,
  });

  const [customClasses, setCustomClasses] = useState<CustomUnitClass[]>([]);
  const [showCustomManager, setShowCustomManager] = useState(false);
  const [showInlineCustomForm, setShowInlineCustomForm] = useState(false);
  const [inlineCustomName, setInlineCustomName] = useState('');
  const [inlineCustomError, setInlineCustomError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomClasses();
    
    // If editing, populate form with existing data
    if (editingClass) {
      setFormData({
        unitClass: editingClass.unitClass,
        unitPrice: editingClass.unitPrice,
        isOpenToInvestments: editingClass.isOpenToInvestments,
        investmentIncrementAmount: editingClass.investmentIncrementAmount,
        minInvestmentAmount: editingClass.minInvestmentAmount,
        maxInvestmentAmount: editingClass.maxInvestmentAmount,
      });
    }
  }, [editingClass]);

  const fetchCustomClasses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/custom-unit-classes');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomClasses(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch custom classes:', err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Unit Class validation
    if (!formData.unitClass.trim()) {
      newErrors.unitClass = 'Unit class is required';
    }

    // Unit Price validation
    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }

    // Investment Increment validation
    if (formData.investmentIncrementAmount <= 0) {
      newErrors.investmentIncrementAmount = 'Investment increment must be greater than 0';
    }

    // Minimum Investment validation
    if (formData.minInvestmentAmount <= 0) {
      newErrors.minInvestmentAmount = 'Minimum investment must be greater than 0';
    }

    // Maximum Investment validation
    if (formData.maxInvestmentAmount <= 0) {
      newErrors.maxInvestmentAmount = 'Maximum investment must be greater than 0';
    }

    // Business rule validations
    if (formData.minInvestmentAmount > 0 && formData.maxInvestmentAmount > 0) {
      if (formData.minInvestmentAmount > formData.maxInvestmentAmount) {
        newErrors.maxInvestmentAmount = 'Maximum investment must be greater than or equal to minimum investment';
      }
    }

    if (formData.investmentIncrementAmount > 0 && formData.minInvestmentAmount > 0) {
      if (formData.investmentIncrementAmount > formData.minInvestmentAmount) {
        newErrors.investmentIncrementAmount = 'Investment increment must be less than or equal to minimum investment';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DebtEquityClassFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleUnitClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'CREATE_CUSTOM') {
      setShowInlineCustomForm(true);
      setInlineCustomName('');
      setInlineCustomError(null);
    } else if (value === 'MANAGE_CUSTOM') {
      setShowCustomManager(true);
    } else {
      handleInputChange('unitClass', value);
      setShowInlineCustomForm(false);
    }
  };

  const validateInlineCustomName = (name: string): string | null => {
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

  const handleInlineCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInlineCustomName(value);
    
    // Real-time validation
    const error = validateInlineCustomName(value);
    setInlineCustomError(error);
  };

  const handleInlineCustomSubmit = async () => {
    const trimmedName = inlineCustomName.trim();
    const error = validateInlineCustomName(trimmedName);
    
    if (error) {
      setInlineCustomError(error);
      return;
    }
    
    try {
      setLoading(true);
      
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
        
        // Set the newly created class as selected
        setFormData(prev => ({
          ...prev,
          unitClass: newClass.name
        }));
        
        // Show success message
        setSuccessMessage(`Custom class "${newClass.name}" created successfully!`);
        
        // Hide inline form
        setShowInlineCustomForm(false);
        setInlineCustomName('');
        setInlineCustomError(null);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error(data.error?.message || 'Failed to create custom class');
      }
      
    } catch (err) {
      setInlineCustomError(err instanceof Error ? err.message : 'Failed to create custom class');
    } finally {
      setLoading(false);
    }
  };

  const handleInlineCustomCancel = () => {
    setShowInlineCustomForm(false);
    setInlineCustomName('');
    setInlineCustomError(null);
    setFormData(prev => ({
      ...prev,
      unitClass: ''
    }));
  };

  const handleCustomClassCreated = (className: string) => {
    setFormData(prev => ({
      ...prev,
      unitClass: className
    }));
    setShowCustomManager(false);
    fetchCustomClasses(); // Refresh the list
    
    // Show success message
    setSuccessMessage(`Custom class "${className}" created and selected successfully!`);
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Failed to save class:', err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="debt-equity-class-form">
      <div className="form-header">
        <h3>{editingClass ? 'Edit Debt & Equity Class' : 'Create New Debt & Equity Class'}</h3>
      </div>

      <form onSubmit={handleSubmit} className="class-form">
        {/* Unit Class Selection */}
        <div className="form-group">
          <label htmlFor="unitClass">Unit Class *</label>
          <select
            id="unitClass"
            value={showInlineCustomForm ? 'CREATE_CUSTOM' : formData.unitClass}
            onChange={handleUnitClassChange}
            className={errors.unitClass ? 'error' : ''}
            disabled={loading}
          >
            <option value="">Select a unit class</option>
            <option value="Class A">Class A</option>
            {customClasses.map((customClass) => (
              <option key={customClass.id} value={customClass.name}>
                {customClass.name}
              </option>
            ))}
            <option value="CREATE_CUSTOM">+ Create your own</option>
            <option value="MANAGE_CUSTOM">⚙️ Manage custom classes</option>
          </select>
          {errors.unitClass && <span className="error-message">{errors.unitClass}</span>}
        </div>

        {/* Inline Custom Class Creation */}
        {showInlineCustomForm && (
          <div className="inline-custom-form">
            <div className="inline-form-header">
              <h4>Create Custom Unit Class</h4>
              <p className="inline-form-description">
                Enter a name for your custom unit class. This will be saved for future use.
              </p>
            </div>
            <div className="inline-form-content">
              <div className="form-group">
                <label htmlFor="inlineCustomName">Custom Class Name *</label>
                <input
                  id="inlineCustomName"
                  type="text"
                  value={inlineCustomName}
                  onChange={handleInlineCustomNameChange}
                  placeholder="Enter custom class name (e.g., Class B, Premium Class)"
                  className={inlineCustomError ? 'error' : ''}
                  disabled={loading}
                  autoFocus
                />
                {inlineCustomError && (
                  <span className="error-message">{inlineCustomError}</span>
                )}
              </div>
              <div className="inline-form-actions">
                <button
                  type="button"
                  onClick={handleInlineCustomCancel}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInlineCustomSubmit}
                  className="create-button"
                  disabled={loading || !!inlineCustomError || !inlineCustomName.trim()}
                >
                  {loading ? 'Creating...' : 'Create & Use'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="success-notification">
            <div className="success-content">
              <span className="success-icon">✓</span>
              <span className="success-text">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="dismiss-success"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {/* Unit Price */}
        <div className="form-group">
          <label htmlFor="unitPrice">Unit Price *</label>
          <div className="currency-input">
            <span className="currency-symbol">$</span>
            <input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice || ''}
              onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
              className={errors.unitPrice ? 'error' : ''}
              placeholder="0.00"
              disabled={loading}
            />
          </div>
          {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
        </div>

        {/* Investment Status Toggle */}
        <div className="form-group">
          <label className="toggle-label">
            <span>Open to Investments</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={formData.isOpenToInvestments}
                onChange={(e) => handleInputChange('isOpenToInvestments', e.target.checked)}
                disabled={loading}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
          <p className="field-description">
            {formData.isOpenToInvestments 
              ? 'This class is currently accepting new investments' 
              : 'This class is closed to new investments'
            }
          </p>
        </div>

        {/* Investment Amounts Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minInvestmentAmount">Minimum Investment *</label>
            <div className="currency-input">
              <span className="currency-symbol">$</span>
              <input
                id="minInvestmentAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.minInvestmentAmount || ''}
                onChange={(e) => handleInputChange('minInvestmentAmount', parseFloat(e.target.value) || 0)}
                className={errors.minInvestmentAmount ? 'error' : ''}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            {errors.minInvestmentAmount && <span className="error-message">{errors.minInvestmentAmount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="maxInvestmentAmount">Maximum Investment *</label>
            <div className="currency-input">
              <span className="currency-symbol">$</span>
              <input
                id="maxInvestmentAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.maxInvestmentAmount || ''}
                onChange={(e) => handleInputChange('maxInvestmentAmount', parseFloat(e.target.value) || 0)}
                className={errors.maxInvestmentAmount ? 'error' : ''}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            {errors.maxInvestmentAmount && <span className="error-message">{errors.maxInvestmentAmount}</span>}
          </div>
        </div>

        {/* Investment Increment */}
        <div className="form-group">
          <label htmlFor="investmentIncrementAmount">Investment Increment Amount *</label>
          <div className="currency-input">
            <span className="currency-symbol">$</span>
            <input
              id="investmentIncrementAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.investmentIncrementAmount || ''}
              onChange={(e) => handleInputChange('investmentIncrementAmount', parseFloat(e.target.value) || 0)}
              className={errors.investmentIncrementAmount ? 'error' : ''}
              placeholder="0.00"
              disabled={loading}
            />
          </div>
          {errors.investmentIncrementAmount && <span className="error-message">{errors.investmentIncrementAmount}</span>}
          <p className="field-description">
            The minimum amount by which investments can be increased above the minimum investment
          </p>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : editingClass ? 'Update Class' : 'Create Class'}
          </button>
        </div>
      </form>

      {/* Custom Class Manager Modal */}
      <CustomClassManager
        isOpen={showCustomManager}
        onClose={() => setShowCustomManager(false)}
        onClassCreated={handleCustomClassCreated}
      />
    </div>
  );
};

export default DebtEquityClassForm;