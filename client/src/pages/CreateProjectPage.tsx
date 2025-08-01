import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface ProjectFormData {
  projectName: string;
  legalProjectName: string;
  unitCalculationPrecision: number;
  targetAmount: number;
  minimumInvestment?: number;
  currency: string;
  startDate: string;
  endDate: string;
}

interface FormErrors {
  [key: string]: string;
}

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: '',
    legalProjectName: '',
    unitCalculationPrecision: 2,
    targetAmount: 0,
    minimumInvestment: undefined,
    currency: 'USD',
    startDate: '',
    endDate: ''
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    } else if (formData.projectName.length > 255) {
      newErrors.projectName = 'Project name must be less than 255 characters';
    }

    if (!formData.legalProjectName.trim()) {
      newErrors.legalProjectName = 'Legal project name is required';
    } else if (formData.legalProjectName.length > 255) {
      newErrors.legalProjectName = 'Legal project name must be less than 255 characters';
    }

    if (formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    // Minimum investment validation (optional field)
    if (formData.minimumInvestment !== undefined && formData.minimumInvestment !== null && formData.minimumInvestment !== 0) {
      if (formData.minimumInvestment < 0) {
        newErrors.minimumInvestment = 'Minimum investment must be a positive number';
      }
      if (formData.targetAmount && formData.minimumInvestment > formData.targetAmount) {
        newErrors.minimumInvestment = 'Minimum investment cannot be greater than target amount';
      }
    }

    if (formData.unitCalculationPrecision < 0 || formData.unitCalculationPrecision > 10) {
      newErrors.unitCalculationPrecision = 'Unit calculation precision must be between 0 and 10';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Project "${data.data.projectName}" created successfully!`);
        navigate('/projects');
      } else {
        setErrors({ general: data.error?.message || 'Failed to create project' });
      }
    } catch (error) {
      setErrors({ general: 'Failed to create project. Make sure the server is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetAmount' || name === 'unitCalculationPrecision' || name === 'minimumInvestment'
        ? value === '' ? (name === 'minimumInvestment' ? undefined : 0) : parseFloat(value) || 0
        : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Link to="/projects" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">Create New Project</h1>
            <p className="page-subtitle">Add a new investment project to your portfolio</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="card" style={{ marginBottom: '2rem', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
              <div className="card-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626' }}>
                  <AlertCircle size={20} />
                  <span>{errors.general}</span>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Information</h2>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label htmlFor="projectName" className="form-label">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    className="form-input"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                  />
                  {errors.projectName && (
                    <div className="form-error">
                      <AlertCircle size={12} style={{ marginRight: '0.25rem' }} />
                      {errors.projectName}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="legalProjectName" className="form-label">
                    Legal Project Name *
                  </label>
                  <input
                    type="text"
                    id="legalProjectName"
                    name="legalProjectName"
                    className="form-input"
                    value={formData.legalProjectName}
                    onChange={handleInputChange}
                    placeholder="Enter legal project name"
                  />
                  {errors.legalProjectName && (
                    <div className="form-error">
                      <AlertCircle size={12} style={{ marginRight: '0.25rem' }} />
                      {errors.legalProjectName}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="targetAmount" className="form-label">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    id="targetAmount"
                    name="targetAmount"
                    className="form-input"
                    value={formData.targetAmount || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.targetAmount && (
                    <div className="form-error">
                      <AlertCircle size={12} style={{ marginRight: '0.25rem' }} />
                      {errors.targetAmount}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="minimumInvestment" className="form-label">
                    Minimum Investment (optional)
                  </label>
                  <input
                    type="number"
                    id="minimumInvestment"
                    name="minimumInvestment"
                    className="form-input"
                    value={formData.minimumInvestment || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Minimum amount required per investor (leave empty if no minimum)
                  </small>
                  {errors.minimumInvestment && (
                    <div className="form-error">
                      <AlertCircle size={12} style={{ marginRight: '0.25rem' }} />
                      {errors.minimumInvestment}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="currency" className="form-label">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    className="form-input"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="unitCalculationPrecision" className="form-label">
                    Unit Calculation Precision
                  </label>
                  <input
                    type="number"
                    id="unitCalculationPrecision"
                    name="unitCalculationPrecision"
                    className="form-input"
                    value={formData.unitCalculationPrecision}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Number of decimal places for unit calculations (0-10)
                  </small>
                  {errors.unitCalculationPrecision && (
                    <div className="form-error">
                      <AlertCircle size={12} style={{ marginRight: '0.25rem' }} />
                      {errors.unitCalculationPrecision}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="form-input"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                  {errors.startDate && (
                    <div className="form-error">
                      <AlertCircle size={12} style={{ marginRight: '0.25rem' }} />
                      {errors.startDate}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="form-input"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                  {errors.endDate && (
                    <div className="form-error">
                      <AlertCircle size={12} style={{ marginRight: '0.25rem' }} />
                      {errors.endDate}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '0.5rem' }}></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Project
                </>
              )}
            </button>
            <Link to="/projects" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;