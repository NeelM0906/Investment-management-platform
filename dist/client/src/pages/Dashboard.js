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
const Dashboard = () => {
    const [serverStatus, setServerStatus] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const checkServerStatus = async () => {
            try {
                const response = await fetch('http://localhost:3001/health');
                const data = await response.json();
                setServerStatus(data);
            }
            catch (error) {
                setServerStatus({ status: 'ERROR', message: 'Server is not running' });
            }
            finally {
                setLoading(false);
            }
        };
        checkServerStatus();
    }, []);
    const stats = [
        {
            title: 'Total Projects',
            value: '0',
            icon: lucide_react_1.FolderOpen,
            color: 'bg-blue-500',
            description: 'Active investment projects'
        },
        {
            title: 'Total Contacts',
            value: '0',
            icon: lucide_react_1.Users,
            color: 'bg-green-500',
            description: 'Investor contacts (Coming Soon)'
        },
        {
            title: 'Fundraising Goals',
            value: '$0',
            icon: lucide_react_1.TrendingUp,
            color: 'bg-purple-500',
            description: 'Target amounts (Coming Soon)'
        }
    ];
    return (<div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to your Investment Management Portal</p>
      </div>

      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {loading ? (<>
                <div className="spinner"></div>
                <span>Checking server status...</span>
              </>) : (<>
                <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: serverStatus?.status === 'OK' ? '#10b981' : '#ef4444'
            }}></div>
                <span>
                  <strong>Server Status:</strong> {serverStatus?.message || 'Unknown'}
                </span>
              </>)}
          </div>
        </div>
      </div>

      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <react_router_dom_1.Link to="/projects/new" className="btn btn-primary">
              <lucide_react_1.Plus size={16}/>
              Create New Project
            </react_router_dom_1.Link>
            <react_router_dom_1.Link to="/projects" className="btn btn-secondary">
              <lucide_react_1.FolderOpen size={16}/>
              View All Projects
            </react_router_dom_1.Link>
          </div>
        </div>
      </div>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (<div key={index} className="card">
              <div className="card-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {stat.title}
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                      {stat.value}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {stat.description}
                    </p>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={24} color="white"/>
                  </div>
                </div>
              </div>
            </div>);
        })}
      </div>

      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Feature Development Status</h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                <span style={{ fontWeight: '500' }}>Projects Management</span>
              </div>
              <span style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '500' }}>✓ In Development</span>
            </div>
            
            {['Contacts', 'Accounts', 'Fundraising', 'Tasks', 'Documents', 'Reports'].map((feature) => (<div key={feature} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                  <span style={{ fontWeight: '500' }}>{feature}</span>
                </div>
                <span style={{ color: '#d97706', fontSize: '0.875rem', fontWeight: '500' }}>⏳ Coming Soon</span>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
};
exports.default = Dashboard;
//# sourceMappingURL=Dashboard.js.map