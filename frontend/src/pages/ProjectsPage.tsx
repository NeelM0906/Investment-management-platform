import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, FolderOpen } from 'lucide-react';
import ConfirmationDialog from '../components/ConfirmationDialog';

interface Project {
  id: string;
  projectName: string;
  legalProjectName: string;
  unitCalculationPrecision: number;
  targetAmount: number;
  currency: string;
  timeframe: {
    startDate: string;
    endDate: string;
  };
  commitments?: {
    totalAmount: number;
    investorCount: number;
  };
  reservations?: {
    totalAmount: number;
    investorCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    project: Project | null;
    loading: boolean;
  }>({
    isOpen: false,
    project: null,
    loading: false
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/projects');
        const data = await response.json();
        
        if (data.success) {
          setProjects(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch projects');
        }
      } catch (err) {
        setError('Failed to fetch projects. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.legalProjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (project: Project) => {
    setDeleteDialog({
      isOpen: true,
      project,
      loading: false
    });
  };

  const getDeleteMessage = (project: Project | null): string => {
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
    if (!deleteDialog.project) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${deleteDialog.project.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove the deleted project from the list
        setProjects(prev => prev.filter(p => p.id !== deleteDialog.project!.id));
        
        // Close the dialog
        setDeleteDialog({
          isOpen: false,
          project: null,
          loading: false
        });

        // Show success message
        alert(`Project "${deleteDialog.project.projectName}" has been deleted successfully.`);
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
        project: null,
        loading: false
      });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your investment projects</p>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading projects...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Manage your investment projects</p>
          </div>
          <Link to="/projects/new" className="btn btn-primary">
            <Plus size={16} />
            Create Project
          </Link>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626' }}>
              <Trash2 size={20} />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-content">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#64748b' 
                }} 
              />
              <input
                type="text"
                placeholder="Search projects..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <FolderOpen className="empty-state-icon" />
            <h3 className="empty-state-title">No Projects Yet</h3>
            <p className="empty-state-description">
              {searchTerm 
                ? `No projects found matching "${searchTerm}"`
                : "Get started by creating your first investment project"
              }
            </p>
            {!searchTerm && (
              <Link to="/projects/new" className="btn btn-primary">
                <Plus size={16} />
                Create Your First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Legal Name</th>
                  <th>Target Amount</th>
                  <th>Timeframe</th>
                  <th>Precision</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>
                          {project.projectName}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#64748b' }}>
                        {project.legalProjectName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '500' }}>
                        {formatCurrency(project.targetAmount, project.currency)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div>{formatDate(project.timeframe.startDate)}</div>
                        <div style={{ color: '#64748b' }}>to {formatDate(project.timeframe.endDate)}</div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge status-active">
                        {project.unitCalculationPrecision} decimals
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link 
                          to={`/projects/${project.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link 
                          to={`/projects/${project.id}/edit`}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                          title="Edit Project"
                        >
                          <Edit size={14} />
                        </Link>
                        <button 
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
                          title="Delete Project"
                          onClick={() => handleDeleteClick(project)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Project"
        message={getDeleteMessage(deleteDialog.project)}
        confirmText="Delete Project"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteDialog.loading}
        type="danger"
      />
    </div>
  );
};

export default ProjectsPage;