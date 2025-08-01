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
const CreateProjectPage = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [formData, setFormData] = (0, react_1.useState)({
        projectName: '',
        legalProjectName: '',
        unitCalculationPrecision: 2,
        targetAmount: 0,
        currency: 'USD',
        startDate: '',
        endDate: ''
    });
    const validateForm = () => {
        const newErrors = {};
        if (!formData.projectName.trim()) {
            newErrors.projectName = 'Project name is required';
        }
        else if (formData.projectName.length > 255) {
            newErrors.projectName = 'Project name must be less than 255 characters';
        }
        if (!formData.legalProjectName.trim()) {
            newErrors.legalProjectName = 'Legal project name is required';
        }
        else if (formData.legalProjectName.length > 255) {
            newErrors.legalProjectName = 'Legal project name must be less than 255 characters';
        }
        if (formData.targetAmount <= 0) {
            newErrors.targetAmount = 'Target amount must be greater than 0';
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
    const handleSubmit = async (e) => {
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
            if (response.ok) {
                alert('Project creation will be implemented in the next task. Form validation is working!');
                navigate('/projects');
            }
            else {
                throw new Error('Failed to create project');
            }
        }
        catch (error) {
            alert('Project creation will be implemented in the next task. The form is ready and validated!');
        }
        finally {
            setLoading(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'targetAmount' || name === 'unitCalculationPrecision'
                ? parseFloat(value) || 0
                : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    return (<div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <react_router_dom_1.Link to="/projects" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <lucide_react_1.ArrowLeft size={16}/>
          </react_router_dom_1.Link>
          <div>
            <h1 className="page-title">Create New Project</h1>
            <p className="page-subtitle">Add a new investment project to your portfolio</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
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
                  <input type="text" id="projectName" name="projectName" className="form-input" value={formData.projectName} onChange={handleInputChange} placeholder="Enter project name"/>
                  {errors.projectName && (<div className="form-error">
                      <lucide_react_1.AlertCircle size={12} style={{ marginRight: '0.25rem' }}/>
                      {errors.projectName}
                    </div>)}
                </div>

                <div className="form-group">
                  <label htmlFor="legalProjectName" className="form-label">
                    Legal Project Name *
                  </label>
                  <input type="text" id="legalProjectName" name="legalProjectName" className="form-input" value={formData.legalProjectName} onChange={handleInputChange} placeholder="Enter legal project name"/>
                  {errors.legalProjectName && (<div className="form-error">
                      <lucide_react_1.AlertCircle size={12} style={{ marginRight: '0.25rem' }}/>
                      {errors.legalProjectName}
                    </div>)}
                </div>

                <div className="form-group">
                  <label htmlFor="targetAmount" className="form-label">
                    Target Amount *
                  </label>
                  <input type="number" id="targetAmount" name="targetAmount" className="form-input" value={formData.targetAmount || ''} onChange={handleInputChange} placeholder="0.00" min="0" step="0.01"/>
                  {errors.targetAmount && (<div className="form-error">
                      <lucide_react_1.AlertCircle size={12} style={{ marginRight: '0.25rem' }}/>
                      {errors.targetAmount}
                    </div>)}
                </div>

                <div className="form-group">
                  <label htmlFor="currency" className="form-label">
                    Currency
                  </label>
                  <select id="currency" name="currency" className="form-input" value={formData.currency} onChange={handleInputChange}>
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
                  <input type="number" id="unitCalculationPrecision" name="unitCalculationPrecision" className="form-input" value={formData.unitCalculationPrecision} onChange={handleInputChange} min="0" max="10"/>
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Number of decimal places for unit calculations (0-10)
                  </small>
                  {errors.unitCalculationPrecision && (<div className="form-error">
                      <lucide_react_1.AlertCircle size={12} style={{ marginRight: '0.25rem' }}/>
                      {errors.unitCalculationPrecision}
                    </div>)}
                </div>

                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">
                    Start Date *
                  </label>
                  <input type="date" id="startDate" name="startDate" className="form-input" value={formData.startDate} onChange={handleInputChange}/>
                  {errors.startDate && (<div className="form-error">
                      <lucide_react_1.AlertCircle size={12} style={{ marginRight: '0.25rem' }}/>
                      {errors.startDate}
                    </div>)}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">
                    End Date *
                  </label>
                  <input type="date" id="endDate" name="endDate" className="form-input" value={formData.endDate} onChange={handleInputChange}/>
                  {errors.endDate && (<div className="form-error">
                      <lucide_react_1.AlertCircle size={12} style={{ marginRight: '0.25rem' }}/>
                      {errors.endDate}
                    </div>)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (<>
                  <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '0.5rem' }}></div>
                  Creating...
                </>) : (<>
                  <lucide_react_1.Save size={16}/>
                  Create Project
                </>)}
            </button>
            <react_router_dom_1.Link to="/projects" className="btn btn-secondary">
              Cancel
            </react_router_dom_1.Link>
          </div>
        </form>
      </div>
    </div>);
};
exports.default = CreateProjectPage;
//# sourceMappingURL=CreateProjectPage.js.map