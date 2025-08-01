"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const ProjectsPage = () => {
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/projects');
                const data = await response.json();
                if (data.message) {
                    setProjects([]);
                }
                else {
                    setProjects(data);
                }
            }
            catch (err) {
                setError('Failed to fetch projects. Make sure the server is running.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);
    const filteredProjects = projects.filter(project => project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.legalProjectName.toLowerCase().includes(searchTerm.toLowerCase()));
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    if (loading) {
        return (<div>
        <div className="page-header">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your investment projects</p>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading projects...
        </div>
      </div>);
    }
    return (<div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Manage your investment projects</p>
          </div>
          <react_router_dom_1.Link to="/projects/new" className="btn btn-primary">
            <lucide_react_1.Plus size={16}/>
            Create Project
          </react_router_dom_1.Link>
        </div>
      </div>

      {error && (<div className="card" style={{ marginBottom: '2rem', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626' }}>
              <lucide_react_1.Trash2 size={20}/>
              <span>{error}</span>
            </div>
          </div>
        </div>)}

      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-content">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <lucide_react_1.Search size={16} style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
        }}/>
              <input type="text" placeholder="Search projects..." className="form-input" style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
          </div>
        </div>
      </div>

      
      <div className="card">
        {filteredProjects.length === 0 ? (<div className="empty-state">
            <lucide_react_1.FolderOpen className="empty-state-icon"/>
            <h3 className="empty-state-title">No Projects Yet</h3>
            <p className="empty-state-description">
              {searchTerm
                ? `No projects found matching "${searchTerm}"`
                : "Get started by creating your first investment project"}
            </p>
            {!searchTerm && (<react_router_dom_1.Link to="/projects/new" className="btn btn-primary">
                <lucide_react_1.Plus size={16}/>
                Create Your First Project
              </react_router_dom_1.Link>)}
          </div>) : (<div className="table-container">
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
                {filteredProjects.map((project) => (<tr key={project.id}>
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
                        <react_router_dom_1.Link to={`/projects/${project.id}`} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="View Details">
                          <lucide_react_1.Eye size={14}/>
                        </react_router_dom_1.Link>
                        <react_router_dom_1.Link to={`/projects/${project.id}/edit`} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Edit Project">
                          <lucide_react_1.Edit size={14}/>
                        </react_router_dom_1.Link>
                        <button className="btn btn-danger" style={{ padding: '0.5rem' }} title="Delete Project" onClick={() => {
                    if (window.confirm('Are you sure you want to delete this project?')) {
                        alert('Delete functionality will be implemented in the next task');
                    }
                }}>
                          <lucide_react_1.Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>)}
      </div>
    </div>);
};
exports.default = ProjectsPage;
//# sourceMappingURL=ProjectsPage.js.map