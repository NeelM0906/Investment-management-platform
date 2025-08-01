import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, DollarSign, Users, TrendingUp, Plus, FileText, CheckCircle, Circle } from 'lucide-react';
import ProjectKPIPanel from '../components/ProjectKPIPanel';
import ConfirmationDialog from '../components/ConfirmationDialog';
import DebtEquityClassesList from '../components/DebtEquityClassesList';
import DebtEquityClassForm from '../components/DebtEquityClassForm';

interface Project {
  id: string;
  projectName: string;
  legalProjectName: string;
  unitCalculationPrecision: number;
  targetAmount: number;
  minimumInvestment?: number;
  currency: string;
  timeframe: {
    startDate: string;
    endDate: string;
  };
  commitments: {
    totalAmount: number;
    investorCount: number;
  };
  reservations: {
    totalAmount: number;
    investorCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectKPIs {
  totalCommitments: number;
  totalCommittedAmount: number;
  fundingPercentage: number;
  daysRemaining: number;
  currency: string;
}

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

interface DealRoomCompletionStatus {
  completionPercentage: number;
  completedSections: string[];
  totalSections: number;
  sectionStatus: {
    showcasePhoto: boolean;
    investmentBlurb: boolean;
    investmentSummary: boolean;
    keyInfo: boolean;
    externalLinks: boolean;
  };
}

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [kpis, setKpis] = useState<ProjectKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    loading: boolean;
  }>({
    isOpen: false,
    loading: false
  });

  // Debt & Equity Classes state
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<DebtEquityClass | null>(null);
  const [classRefreshTrigger, setClassRefreshTrigger] = useState(0);
  const [classDeleteDialog, setClassDeleteDialog] = useState<{
    isOpen: boolean;
    loading: boolean;
    classId: string | null;
    className: string | null;
  }>({
    isOpen: false,
    loading: false,
    classId: null,
    className: null
  });

  // Deal Room state
  const [dealRoomStatus, setDealRoomStatus] = useState<DealRoomCompletionStatus | null>(null);
  const [dealRoomLoading, setDealRoomLoading] = useState(false);
  const [dealRoomData, setDealRoomData] = useState<any>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      
      try {
        // Fetch project details
        const projectResponse = await fetch(`http://localhost:3001/api/projects/${id}`);
        const projectData = await projectResponse.json();
        
        if (projectData.success) {
          setProject(projectData.data);
          
          // Fetch KPIs
          const kpisResponse = await fetch(`http://localhost:3001/api/projects/${id}/kpis`);
          const kpisData = await kpisResponse.json();
          
          if (kpisData.success) {
            setKpis(kpisData.data);
          }
        } else {
          setError(projectData.error?.message || 'Failed to fetch project');
        }
      } catch (err) {
        setError('Failed to fetch project data. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  // Fetch Deal Room completion status and data
  useEffect(() => {
    const fetchDealRoomData = async () => {
      if (!id) return;
      
      try {
        setDealRoomLoading(true);
        
        // Fetch completion status
        const statusResponse = await fetch(`http://localhost:3001/api/projects/${id}/deal-room/completion-status`);
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          setDealRoomStatus(statusData.data);
        }

        // Fetch deal room data for preview
        const dealRoomResponse = await fetch(`http://localhost:3001/api/projects/${id}/deal-room`);
        const dealRoomData = await dealRoomResponse.json();
        
        if (dealRoomData.success) {
          setDealRoomData(dealRoomData.data);
        }
      } catch (err) {
        console.error('Failed to fetch deal room data:', err);
      } finally {
        setDealRoomLoading(false);
      }
    };

    fetchDealRoomData();
  }, [id]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInlineEdit = (field: string, value: any) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: value });
  };

  const validateEditValues = (field: string): boolean => {
    const errors: any = {};
    
    if (field === 'commitments') {
      const amount = parseFloat(editValues.commitmentAmount);
      const count = parseInt(editValues.commitmentCount);
      
      if (isNaN(amount) || amount < 0) {
        errors.commitmentAmount = 'Amount must be a positive number';
      }
      if (isNaN(count) || count < 0 || !Number.isInteger(count)) {
        errors.commitmentCount = 'Investor count must be a positive integer';
      }
    } else if (field === 'reservations') {
      const amount = parseFloat(editValues.reservationAmount);
      const count = parseInt(editValues.reservationCount);
      
      if (isNaN(amount) || amount < 0) {
        errors.reservationAmount = 'Amount must be a positive number';
      }
      if (isNaN(count) || count < 0 || !Number.isInteger(count)) {
        errors.reservationCount = 'Investor count must be a positive integer';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async (field: string) => {
    if (!project || !id) return;

    // Validate input
    if (!validateEditValues(field)) {
      return;
    }

    setSaving(true);
    setValidationErrors({});

    try {
      let endpoint = '';
      let payload = {};

      if (field === 'commitments') {
        endpoint = `http://localhost:3001/api/projects/${id}/commitments`;
        payload = {
          totalAmount: parseFloat(editValues.commitmentAmount) || 0,
          investorCount: parseInt(editValues.commitmentCount) || 0
        };
      } else if (field === 'reservations') {
        endpoint = `http://localhost:3001/api/projects/${id}/reservations`;
        payload = {
          totalAmount: parseFloat(editValues.reservationAmount) || 0,
          investorCount: parseInt(editValues.reservationCount) || 0
        };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setProject(data.data);
        
        // Refresh KPIs
        const kpisResponse = await fetch(`http://localhost:3001/api/projects/${id}/kpis`);
        const kpisData = await kpisResponse.json();
        if (kpisData.success) {
          setKpis(kpisData.data);
        }
        
        // Show success feedback
        const fieldName = field === 'commitments' ? 'Commitments' : 'Reservations';
        alert(`${fieldName} updated successfully!`);
        
        setEditingField(null);
        setEditValues({});
      } else {
        setValidationErrors({ general: data.error?.message || 'Failed to update' });
      }
    } catch (err) {
      setValidationErrors({ general: 'Failed to update. Make sure the server is running.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleDeleteClick = () => {
    setDeleteDialog({
      isOpen: true,
      loading: false
    });
  };

  const getDeleteMessage = (): string => {
    if (!project) return 'Do you want to delete this project? This action cannot be undone.';
    
    const hasCommitments = (project.commitments?.totalAmount ?? 0) > 0 || (project.commitments?.investorCount ?? 0) > 0;
    const hasReservations = (project.reservations?.totalAmount ?? 0) > 0 || (project.reservations?.investorCount ?? 0) > 0;
    
    let message = `Do you want to delete this project? This action cannot be undone.\n\nProject: "${project.projectName}"`;
    
    if (hasCommitments || hasReservations) {
      message += '\n\n⚠️ WARNING: This project has associated data:';
      
      if (hasCommitments && project.commitments) {
        const commitmentAmount = formatCurrency(project.commitments.totalAmount, project.currency);
        message += `\n• ${project.commitments.investorCount} commitments totaling ${commitmentAmount}`;
      }
      
      if (hasReservations && project.reservations) {
        const reservationAmount = formatCurrency(project.reservations.totalAmount, project.currency);
        message += `\n• ${project.reservations.investorCount} reservations totaling ${reservationAmount}`;
      }
      
      message += '\n\nDeleting this project will permanently remove all associated commitment and reservation data.';
    }
    
    return message;
  };

  const handleDeleteConfirm = async () => {
    if (!project || !id) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        alert(`Project "${project.projectName}" has been deleted successfully.`);
        
        // Navigate back to projects list
        navigate('/projects');
      } else {
        throw new Error(data.error?.message || 'Failed to delete project');
      }
    } catch (error) {
      alert(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteDialog.loading) {
      setDeleteDialog({
        isOpen: false,
        loading: false
      });
    }
  };

  // Debt & Equity Classes handlers
  const handleAddNewClass = () => {
    setEditingClass(null);
    setShowClassForm(true);
  };

  const handleEditClass = (classData: DebtEquityClass) => {
    setEditingClass(classData);
    setShowClassForm(true);
  };

  const handleDeleteClass = (classId: string) => {
    // Find the class to get its name for the confirmation dialog
    // We'll need to fetch this from the DebtEquityClassesList component
    setClassDeleteDialog({
      isOpen: true,
      loading: false,
      classId: classId,
      className: null // Will be set by the list component
    });
  };

  const handleClassDeleteConfirm = async () => {
    if (!classDeleteDialog.classId) return;

    setClassDeleteDialog(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`http://localhost:3001/api/debt-equity-classes/${classDeleteDialog.classId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Debt & Equity Class deleted successfully.');
        setClassDeleteDialog({
          isOpen: false,
          loading: false,
          classId: null,
          className: null
        });
        // Trigger refresh of the classes list
        setClassRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(data.error?.message || 'Failed to delete class');
      }
    } catch (error) {
      alert(`Failed to delete class: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setClassDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleClassDeleteCancel = () => {
    if (!classDeleteDialog.loading) {
      setClassDeleteDialog({
        isOpen: false,
        loading: false,
        classId: null,
        className: null
      });
    }
  };

  const handleClassSave = async (classData: DebtEquityClassFormData) => {
    if (!id) return;

    try {
      let endpoint = '';
      let method = '';

      if (editingClass) {
        // Update existing class
        endpoint = `http://localhost:3001/api/debt-equity-classes/${editingClass.id}`;
        method = 'PUT';
      } else {
        // Create new class
        endpoint = `http://localhost:3001/api/projects/${id}/debt-equity-classes`;
        method = 'POST';
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });

      const data = await response.json();

      if (data.success) {
        const action = editingClass ? 'updated' : 'created';
        alert(`Debt & Equity Class ${action} successfully!`);
        setShowClassForm(false);
        setEditingClass(null);
        // Trigger refresh of the classes list
        setClassRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(data.error?.message || `Failed to ${editingClass ? 'update' : 'create'} class`);
      }
    } catch (error) {
      alert(`Failed to save class: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClassCancel = () => {
    setShowClassForm(false);
    setEditingClass(null);
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Loading...</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading project details...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <div className="page-header">
          <Link to="/projects" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={16} />
          </Link>
        </div>
        <div className="card" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626' }}>
              <Trash2 size={20} />
              <span>{error || 'Project not found'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Link to="/projects" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">{project.projectName}</h1>
            <p className="page-subtitle">Project Details & KPI Dashboard</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/projects/${id}/deal-room`} className="btn btn-primary">
              <FileText size={16} />
              Deal Room
            </Link>
            <Link to={`/projects/${id}/edit`} className="btn btn-secondary">
              <Edit size={16} />
              Edit
            </Link>
            <button 
              className="btn btn-danger"
              onClick={handleDeleteClick}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* General Error Display */}
      {validationErrors.general && (
        <div className="card" style={{ marginBottom: '2rem', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626' }}>
              <Trash2 size={20} />
              <span>{validationErrors.general}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Sidebar + KPI Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Sidebar - Project Information */}
        <div>
          {/* Target Amount */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <DollarSign size={20} color="#059669" />
                <span style={{ fontWeight: '600', color: '#1e293b' }}>Target</span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                {formatCurrency(project.targetAmount, project.currency)}
              </p>
            </div>
          </div>

          {/* Commitments */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <TrendingUp size={20} color="#3b82f6" />
                <span style={{ fontWeight: '600', color: '#1e293b' }}>Commitments</span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                  Amount ($)
                </label>
                {editingField === 'commitments' ? (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ 
                          fontSize: '0.875rem', 
                          padding: '0.5rem',
                          borderColor: validationErrors.commitmentAmount ? '#ef4444' : undefined
                        }}
                        value={editValues.commitmentAmount !== undefined ? editValues.commitmentAmount : project.commitments.totalAmount}
                        onChange={(e) => setEditValues({...editValues, commitmentAmount: e.target.value})}
                        placeholder="0"
                        disabled={saving}
                      />
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem' }} 
                        onClick={() => handleSaveEdit('commitments')}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="spinner" style={{ width: '12px', height: '12px', marginRight: '0.25rem' }}></div>
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem' }} 
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                    {validationErrors.commitmentAmount && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                        {validationErrors.commitmentAmount}
                      </div>
                    )}
                  </div>
                ) : (
                  <p 
                    style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: '#3b82f6', 
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => {
                      setEditValues({
                        commitmentAmount: project.commitments.totalAmount,
                        commitmentCount: project.commitments.investorCount
                      });
                      setEditingField('commitments');
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {formatCurrency(project.commitments.totalAmount, project.currency)}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                  Number of People
                </label>
                {editingField === 'commitments' ? (
                  <input
                    type="number"
                    className="form-input"
                    style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                    value={editValues.commitmentCount || project.commitments.investorCount}
                    onChange={(e) => setEditValues({...editValues, commitmentCount: e.target.value})}
                    placeholder="0"
                  />
                ) : (
                  <p 
                    style={{ fontSize: '1.25rem', fontWeight: '600', color: '#3b82f6', cursor: 'pointer' }}
                    onClick={() => handleInlineEdit('commitments', project.commitments.investorCount)}
                  >
                    {project.commitments.investorCount} investors
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reservations */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Users size={20} color="#f59e0b" />
                <span style={{ fontWeight: '600', color: '#1e293b' }}>Reservations</span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                  Amount ($)
                </label>
                {editingField === 'reservations' ? (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ 
                          fontSize: '0.875rem', 
                          padding: '0.5rem',
                          borderColor: validationErrors.reservationAmount ? '#ef4444' : undefined
                        }}
                        value={editValues.reservationAmount !== undefined ? editValues.reservationAmount : project.reservations.totalAmount}
                        onChange={(e) => setEditValues({...editValues, reservationAmount: e.target.value})}
                        placeholder="0"
                        disabled={saving}
                      />
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem' }} 
                        onClick={() => handleSaveEdit('reservations')}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="spinner" style={{ width: '12px', height: '12px', marginRight: '0.25rem' }}></div>
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem' }} 
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                    {validationErrors.reservationAmount && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                        {validationErrors.reservationAmount}
                      </div>
                    )}
                  </div>
                ) : (
                  <p 
                    style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: '#f59e0b', 
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => {
                      setEditValues({
                        reservationAmount: project.reservations.totalAmount,
                        reservationCount: project.reservations.investorCount
                      });
                      setEditingField('reservations');
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {formatCurrency(project.reservations.totalAmount, project.currency)}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                  Number of People
                </label>
                {editingField === 'reservations' ? (
                  <div>
                    <input
                      type="number"
                      className="form-input"
                      style={{ 
                        fontSize: '0.875rem', 
                        padding: '0.5rem',
                        borderColor: validationErrors.reservationCount ? '#ef4444' : undefined
                      }}
                      value={editValues.reservationCount !== undefined ? editValues.reservationCount : project.reservations.investorCount}
                      onChange={(e) => setEditValues({...editValues, reservationCount: e.target.value})}
                      placeholder="0"
                      disabled={saving}
                    />
                    {validationErrors.reservationCount && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {validationErrors.reservationCount}
                      </div>
                    )}
                  </div>
                ) : (
                  <p 
                    style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: '#f59e0b', 
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => {
                      setEditValues({
                        reservationAmount: project.reservations.totalAmount,
                        reservationCount: project.reservations.investorCount
                      });
                      setEditingField('reservations');
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {project.reservations.investorCount} potential investors
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Project Information</h3>
            </div>
            <div className="card-content">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                  Legal Name
                </label>
                <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  {project.legalProjectName}
                </p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                  Timeline
                </label>
                <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  {formatDate(project.timeframe.startDate)} - {formatDate(project.timeframe.endDate)}
                </p>
              </div>

              {project.minimumInvestment && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                    Minimum Investment
                  </label>
                  <p style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>
                    {formatCurrency(project.minimumInvestment, project.currency)}
                  </p>
                </div>
              )}
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                  Precision
                </label>
                <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  {project.unitCalculationPrecision} decimal places
                </p>
              </div>
            </div>
          </div>

          {/* Deal Room Status */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} color="#8b5cf6" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Deal Room</h3>
              </div>
            </div>
            <div className="card-content">
              {dealRoomLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  <span style={{ fontSize: '0.875rem' }}>Loading status...</span>
                </div>
              ) : dealRoomStatus ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                        Completion Status
                      </span>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: dealRoomStatus.completionPercentage === 100 ? '#059669' : '#f59e0b' 
                      }}>
                        {dealRoomStatus.completionPercentage}%
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e2e8f0', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${dealRoomStatus.completionPercentage}%`, 
                        height: '100%', 
                        backgroundColor: dealRoomStatus.completionPercentage === 100 ? '#059669' : '#f59e0b',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                      Sections ({dealRoomStatus.completedSections.length}/{dealRoomStatus.totalSections})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {Object.entries(dealRoomStatus.sectionStatus).map(([section, isCompleted]) => (
                        <div key={section} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isCompleted ? (
                            <CheckCircle size={14} color="#059669" />
                          ) : (
                            <Circle size={14} color="#94a3b8" />
                          )}
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: isCompleted ? '#059669' : '#64748b',
                            textTransform: 'capitalize'
                          }}>
                            {section.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link 
                      to={`/projects/${id}/deal-room`} 
                      className="btn btn-primary"
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FileText size={16} />
                      {dealRoomStatus.completionPercentage === 100 ? 'View Deal Room' : 'Complete Deal Room'}
                    </Link>
                    
                    {/* Quick Access to Sections */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '0.25rem',
                      marginTop: '0.5rem'
                    }}>
                      <Link 
                        to={`/projects/${id}/deal-room?section=showcase-photo`}
                        style={{ 
                          fontSize: '0.75rem', 
                          color: dealRoomStatus.sectionStatus.showcasePhoto ? '#059669' : '#64748b',
                          textDecoration: 'none',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Photo
                      </Link>
                      <Link 
                        to={`/projects/${id}/deal-room?section=investment-blurb`}
                        style={{ 
                          fontSize: '0.75rem', 
                          color: dealRoomStatus.sectionStatus.investmentBlurb ? '#059669' : '#64748b',
                          textDecoration: 'none',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Blurb
                      </Link>
                      <Link 
                        to={`/projects/${id}/deal-room?section=investment-summary`}
                        style={{ 
                          fontSize: '0.75rem', 
                          color: dealRoomStatus.sectionStatus.investmentSummary ? '#059669' : '#64748b',
                          textDecoration: 'none',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Summary
                      </Link>
                      <Link 
                        to={`/projects/${id}/deal-room?section=key-info`}
                        style={{ 
                          fontSize: '0.75rem', 
                          color: dealRoomStatus.sectionStatus.keyInfo ? '#059669' : '#64748b',
                          textDecoration: 'none',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Key Info
                      </Link>
                      <Link 
                        to={`/projects/${id}/deal-room?section=external-links`}
                        style={{ 
                          fontSize: '0.75rem', 
                          color: dealRoomStatus.sectionStatus.externalLinks ? '#059669' : '#64748b',
                          textDecoration: 'none',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s',
                          gridColumn: 'span 2'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        External Links
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                    Create a professional deal room to showcase your investment opportunity to potential investors.
                  </p>
                  <Link 
                    to={`/projects/${id}/deal-room`} 
                    className="btn btn-primary"
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <FileText size={16} />
                    Create Deal Room
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Deal Room Content Preview */}
          {dealRoomData && dealRoomStatus && dealRoomStatus.completionPercentage > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Deal Room Preview</h3>
              </div>
              <div className="card-content">
                {dealRoomData.investmentBlurb && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                      Investment Blurb
                    </label>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#1e293b', 
                      lineHeight: '1.4',
                      backgroundColor: '#f8fafc',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {dealRoomData.investmentBlurb.length > 100 
                        ? `${dealRoomData.investmentBlurb.substring(0, 100)}...` 
                        : dealRoomData.investmentBlurb}
                    </p>
                  </div>
                )}

                {dealRoomData.keyInfo && dealRoomData.keyInfo.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                      Key Information ({dealRoomData.keyInfo.length} items)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {dealRoomData.keyInfo.slice(0, 3).map((item: any, index: number) => (
                        <span 
                          key={index}
                          style={{ 
                            fontSize: '0.75rem', 
                            backgroundColor: '#dbeafe', 
                            color: '#1e40af',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            border: '1px solid #bfdbfe'
                          }}
                        >
                          {item.name}
                        </span>
                      ))}
                      {dealRoomData.keyInfo.length > 3 && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#64748b',
                          padding: '0.25rem 0.5rem'
                        }}>
                          +{dealRoomData.keyInfo.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {dealRoomData.externalLinks && dealRoomData.externalLinks.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                      External Links ({dealRoomData.externalLinks.length} links)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {dealRoomData.externalLinks.slice(0, 2).map((link: any, index: number) => (
                        <span 
                          key={index}
                          style={{ 
                            fontSize: '0.75rem', 
                            backgroundColor: '#fef3c7', 
                            color: '#92400e',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            border: '1px solid #fde68a'
                          }}
                        >
                          {link.name}
                        </span>
                      ))}
                      {dealRoomData.externalLinks.length > 2 && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#64748b',
                          padding: '0.25rem 0.5rem'
                        }}>
                          +{dealRoomData.externalLinks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {dealRoomData.showcasePhoto && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>
                      Showcase Photo
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#059669'
                    }}>
                      <CheckCircle size={14} />
                      <span>Photo uploaded</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - KPI Dashboard */}
        <div>
          {kpis && <ProjectKPIPanel kpis={kpis} loading={loading} />}
        </div>
      </div>

      {/* Debt & Equity Classes Section */}
      <div style={{ marginTop: '3rem' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>Debt & Equity Classes</h3>
            <button 
              className="btn btn-primary"
              onClick={handleAddNewClass}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} />
              Add New Class
            </button>
          </div>
          <div className="card-content" style={{ padding: 0 }}>
            {showClassForm ? (
              <div style={{ padding: '1.5rem' }}>
                <DebtEquityClassForm
                  projectId={id!}
                  editingClass={editingClass}
                  onSave={handleClassSave}
                  onCancel={handleClassCancel}
                />
              </div>
            ) : (
              <DebtEquityClassesList
                projectId={id!}
                onAddNew={handleAddNewClass}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
                refreshTrigger={classRefreshTrigger}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Project"
        message={getDeleteMessage()}
        confirmText="Delete Project"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteDialog.loading}
        type="danger"
      />

      {/* Class Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={classDeleteDialog.isOpen}
        title="Delete Debt & Equity Class"
        message={`Are you sure you want to delete this debt & equity class? This action cannot be undone.${classDeleteDialog.className ? `\n\nClass: "${classDeleteDialog.className}"` : ''}`}
        confirmText="Delete Class"
        cancelText="Cancel"
        onConfirm={handleClassDeleteConfirm}
        onCancel={handleClassDeleteCancel}
        loading={classDeleteDialog.loading}
        type="danger"
      />
    </div>
  );
};

export default ProjectDetailsPage;