"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const Layout = ({ children }) => {
    const location = (0, react_router_dom_1.useLocation)();
    const navItems = [
        { path: '/', label: 'Dashboard', icon: lucide_react_1.Home },
        { path: '/projects', label: 'Projects', icon: lucide_react_1.FolderOpen },
        { path: '/contacts', label: 'Contacts', icon: lucide_react_1.Users, disabled: true },
        { path: '/accounts', label: 'Accounts', icon: lucide_react_1.CreditCard, disabled: true },
        { path: '/fundraising', label: 'Fundraising', icon: lucide_react_1.TrendingUp, disabled: true },
        { path: '/tasks', label: 'Tasks', icon: lucide_react_1.CheckSquare, disabled: true },
        { path: '/documents', label: 'Documents', icon: lucide_react_1.FileText, disabled: true },
        { path: '/reports', label: 'Reports', icon: lucide_react_1.BarChart3, disabled: true },
    ];
    return (<div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">InvestorNext</h1>
          <p className="sidebar-subtitle">Investment Management Portal</p>
        </div>
        <nav>
          <ul className="nav-menu">
            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            if (item.disabled) {
                return (<li key={item.path} className="nav-item">
                    <div className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      <Icon className="nav-icon"/>
                      {item.label}
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>Soon</span>
                    </div>
                  </li>);
            }
            return (<li key={item.path} className="nav-item">
                  <react_router_dom_1.Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                    <Icon className="nav-icon"/>
                    {item.label}
                  </react_router_dom_1.Link>
                </li>);
        })}
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>);
};
exports.default = Layout;
//# sourceMappingURL=Layout.js.map