"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const ProjectDetailsPage = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    const project = {
        id: id || '1',
        projectName: 'Sample Project',
        legalProjectName: 'Sample Project LLC',
        unitCalculationPrecision: 2,
        targetAmount: 1000000,
        currency: 'USD',
        timeframe: {
            startDate: '2024-01-01',
            endDate: '2024-12-31'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    };
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    return (<div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <react_router_dom_1.Link to="/projects" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <lucide_react_1.ArrowLeft size={16}/>
          </react_router_dom_1.Link>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">{project.projectName}</h1>
            <p className="page-subtitle">Project Details</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <react_router_dom_1.Link to={`/projects/${id}/edit`} className="btn btn-secondary">
              <lucide_react_1.Edit size={16}/>
              Edit
            </react_router_dom_1.Link>
            <button className="btn btn-danger" onClick={() => {
            if (window.confirm('Are you sure you want to delete this project?')) {
                alert('Delete functionality will be implemented in the next task');
            }
        }}>
              <lucide_react_1.Trash2 size={16}/>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Basic Information</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  Project Name
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '500', color: '#1e293b' }}>
                  {project.projectName}
                </p>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  Legal Project Name
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '500', color: '#1e293b' }}>
                  {project.legalProjectName}
                </p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">
              <lucide_react_1.DollarSign size={20} style={{ marginRight: '0.5rem' }}/>
              Financial Information
            </h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  Target Amount
                </label>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                  {formatCurrency(project.targetAmount, project.currency)}
                </p>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  Currency
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '500', color: '#1e293b' }}>
                  {project.currency}
                </p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">
              <lucide_react_1.Calendar size={20} style={{ marginRight: '0.5rem' }}/>
              Timeline
            </h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  Start Date
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '500', color: '#1e293b' }}>
                  {formatDate(project.timeframe.startDate)}
                </p>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  End Date
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '500', color: '#1e293b' }}>
                  {formatDate(project.timeframe.endDate)}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                <strong>Duration:</strong> {Math.ceil((new Date(project.timeframe.endDate).getTime() - new Date(project.timeframe.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </div>

        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">
              <lucide_react_1.Settings size={20} style={{ marginRight: '0.5rem' }}/>
              Technical Settings
            </h2>
          </div>
          <div className="card-content">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                Unit Calculation Precision
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-badge status-active">
                  {project.unitCalculationPrecision} decimal places
                </span>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  (e.g., 1.{Array(project.unitCalculationPrecision).fill('0').join('')})
                </span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Metadata</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  Created At
                </label>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {formatDate(project.createdAt)}
                </p>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  Last Updated
                </label>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {formatDate(project.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = ProjectDetailsPage;
//# sourceMappingURL=ProjectDetailsPage.js.map