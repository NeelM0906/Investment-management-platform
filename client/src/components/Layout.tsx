import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Building2, Users, CreditCard, TrendingUp, CheckSquare, FileText, BarChart3, Globe, Image } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/company-profile', label: 'Company Profile', icon: Building2 },
    { path: '/investor-portal', label: 'Investor Portal', icon: Globe },
    { path: '/image-gallery-demo', label: 'Image Gallery Demo', icon: Image },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/accounts', label: 'Accounts', icon: CreditCard, disabled: true },
    { path: '/fundraising', label: 'Fundraising', icon: TrendingUp, disabled: true },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare, disabled: true },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/reports', label: 'Reports', icon: BarChart3, disabled: true },
  ];

  return (
    <div className="layout">
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
                return (
                  <li key={item.path} className="nav-item">
                    <div className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      <Icon className="nav-icon" />
                      {item.label}
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>Soon</span>
                    </div>
                  </li>
                );
              }
              
              return (
                <li key={item.path} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;