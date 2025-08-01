import React from 'react';
import { X, TrendingUp, Users, DollarSign, Target, BarChart3, Calendar } from 'lucide-react';
import './InvestorPortalPreview.css';

interface InvestorPortal {
  id: string;
  loginPageAssets: {
    logoUrl?: string;
    backgroundImageUrl?: string;
    logoAltText?: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    logoUrl?: string;
  };
  welcomeMessage: {
    title: string;
    content: string;
    showOnDashboard: boolean;
  };
  metrics: {
    selectedMetrics: string[];
    customMetrics: CustomMetric[];
    displayOrder: string[];
  };
  isPublished: boolean;
  portalUrl?: string;
}

interface CustomMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  description?: string;
  displayFormat: 'number' | 'currency' | 'percentage' | 'text';
}

interface InvestorPortalPreviewProps {
  portal: InvestorPortal;
  onClose: () => void;
}

const InvestorPortalPreview: React.FC<InvestorPortalPreviewProps> = ({ portal, onClose }) => {
  const availableMetrics = [
    { id: 'totalProjects', name: 'Total Projects', value: '24', icon: Target },
    { id: 'totalFunding', name: 'Total Funding', value: '$12.5M', icon: DollarSign },
    { id: 'activeInvestors', name: 'Active Investors', value: '156', icon: Users },
    { id: 'completedProjects', name: 'Completed Projects', value: '18', icon: BarChart3 },
    { id: 'averageROI', name: 'Average ROI', value: '24.5%', icon: TrendingUp },
    { id: 'fundingGoalProgress', name: 'Funding Goal Progress', value: '87%', icon: Target }
  ];

  const formatMetricValue = (metric: CustomMetric) => {
    switch (metric.displayFormat) {
      case 'currency':
        return `$${Number(metric.value).toLocaleString()}`;
      case 'percentage':
        return `${metric.value}%`;
      case 'number':
        return Number(metric.value).toLocaleString();
      default:
        return metric.value;
    }
  };

  const getMetricIcon = (metricId: string) => {
    const metric = availableMetrics.find(m => m.id === metricId);
    return metric?.icon || BarChart3;
  };

  const getMetricValue = (metricId: string) => {
    const metric = availableMetrics.find(m => m.id === metricId);
    return metric?.value || '0';
  };

  const getMetricName = (metricId: string) => {
    const metric = availableMetrics.find(m => m.id === metricId);
    return metric?.name || metricId;
  };

  return (
    <div className="portal-preview-overlay">
      <div className="portal-preview-container">
        <div className="portal-preview-header">
          <h2>Investor Portal Preview</h2>
          <button onClick={onClose} className="preview-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="portal-preview-content">
          {/* Login Page Preview */}
          <div className="preview-section">
            <h3>Login Page</h3>
            <div 
              className="login-preview"
              style={{
                backgroundImage: portal.loginPageAssets.backgroundImageUrl 
                  ? `url(${portal.loginPageAssets.backgroundImageUrl})` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontFamily: portal.branding.fontFamily
              }}
            >
              <div className="login-overlay">
                <div className="login-card">
                  {portal.loginPageAssets.logoUrl && (
                    <img 
                      src={portal.loginPageAssets.logoUrl} 
                      alt={portal.loginPageAssets.logoAltText || 'Company Logo'}
                      className="login-logo"
                    />
                  )}
                  <h2 style={{ color: portal.branding.primaryColor }}>
                    Investor Portal Access
                  </h2>
                  <div className="login-form">
                    <input type="email" placeholder="Email Address" className="login-input" />
                    <input type="password" placeholder="Password" className="login-input" />
                    <button 
                      className="login-button"
                      style={{ backgroundColor: portal.branding.accentColor }}
                    >
                      Sign In
                    </button>
                  </div>
                  <p className="login-footer">
                    Secure access to your investment dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="preview-section">
            <h3>Dashboard</h3>
            <div 
              className="dashboard-preview"
              style={{ fontFamily: portal.branding.fontFamily }}
            >
              {/* Header */}
              <div 
                className="dashboard-header"
                style={{ backgroundColor: portal.branding.primaryColor }}
              >
                <div className="dashboard-nav">
                  {portal.branding.logoUrl && (
                    <img 
                      src={portal.branding.logoUrl} 
                      alt="Company Logo"
                      className="dashboard-logo"
                    />
                  )}
                  <nav className="dashboard-menu">
                    <button className="nav-item active">Dashboard</button>
                    <button className="nav-item">Portfolio</button>
                    <button className="nav-item">Reports</button>
                    <button className="nav-item">Documents</button>
                  </nav>
                  <div className="user-menu">
                    <span>John Investor</span>
                  </div>
                </div>
              </div>

              {/* Welcome Message */}
              {portal.welcomeMessage.showOnDashboard && (
                <div className="welcome-section">
                  <div 
                    className="welcome-card"
                    style={{ borderLeftColor: portal.branding.accentColor }}
                  >
                    <h2 style={{ color: portal.branding.primaryColor }}>
                      {portal.welcomeMessage.title}
                    </h2>
                    <p>{portal.welcomeMessage.content}</p>
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="metrics-section">
                <h3 style={{ color: portal.branding.primaryColor }}>
                  Investment Overview
                </h3>
                <div className="metrics-grid">
                  {portal.metrics.selectedMetrics.map((metricId) => {
                    const Icon = getMetricIcon(metricId);
                    return (
                      <div key={metricId} className="metric-card">
                        <div className="metric-header">
                          <Icon 
                            size={24} 
                            style={{ color: portal.branding.accentColor }}
                          />
                          <span className="metric-name">
                            {getMetricName(metricId)}
                          </span>
                        </div>
                        <div 
                          className="metric-value"
                          style={{ color: portal.branding.primaryColor }}
                        >
                          {getMetricValue(metricId)}
                        </div>
                      </div>
                    );
                  })}

                  {portal.metrics.customMetrics.map((metric) => (
                    <div key={metric.id} className="metric-card">
                      <div className="metric-header">
                        <BarChart3 
                          size={24} 
                          style={{ color: portal.branding.accentColor }}
                        />
                        <span className="metric-name">{metric.name}</span>
                      </div>
                      <div 
                        className="metric-value"
                        style={{ color: portal.branding.primaryColor }}
                      >
                        {formatMetricValue(metric)}
                        {metric.unit && <span className="metric-unit"> {metric.unit}</span>}
                      </div>
                      {metric.description && (
                        <div className="metric-description">{metric.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Portfolio Section */}
              <div className="portfolio-section">
                <h3 style={{ color: portal.branding.primaryColor }}>
                  Your Portfolio
                </h3>
                <div className="portfolio-grid">
                  <div className="portfolio-item">
                    <div className="portfolio-header">
                      <h4>Tech Innovation Fund</h4>
                      <span 
                        className="portfolio-status active"
                        style={{ backgroundColor: portal.branding.accentColor }}
                      >
                        Active
                      </span>
                    </div>
                    <div className="portfolio-details">
                      <div className="detail-item">
                        <span>Investment Amount:</span>
                        <span>$50,000</span>
                      </div>
                      <div className="detail-item">
                        <span>Current Value:</span>
                        <span style={{ color: '#10b981' }}>$62,500</span>
                      </div>
                      <div className="detail-item">
                        <span>ROI:</span>
                        <span style={{ color: '#10b981' }}>+25%</span>
                      </div>
                    </div>
                  </div>

                  <div className="portfolio-item">
                    <div className="portfolio-header">
                      <h4>Green Energy Project</h4>
                      <span 
                        className="portfolio-status completed"
                        style={{ backgroundColor: portal.branding.secondaryColor }}
                      >
                        Completed
                      </span>
                    </div>
                    <div className="portfolio-details">
                      <div className="detail-item">
                        <span>Investment Amount:</span>
                        <span>$25,000</span>
                      </div>
                      <div className="detail-item">
                        <span>Final Value:</span>
                        <span style={{ color: '#10b981' }}>$31,250</span>
                      </div>
                      <div className="detail-item">
                        <span>ROI:</span>
                        <span style={{ color: '#10b981' }}>+25%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-section">
                <h3 style={{ color: portal.branding.primaryColor }}>
                  Recent Activity
                </h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <Calendar size={16} style={{ color: portal.branding.accentColor }} />
                    <div className="activity-content">
                      <span>Quarterly report available for Tech Innovation Fund</span>
                      <span className="activity-date">2 days ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <TrendingUp size={16} style={{ color: portal.branding.accentColor }} />
                    <div className="activity-content">
                      <span>Portfolio value increased by 3.2%</span>
                      <span className="activity-date">1 week ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <DollarSign size={16} style={{ color: portal.branding.accentColor }} />
                    <div className="activity-content">
                      <span>Dividend payment of $1,250 processed</span>
                      <span className="activity-date">2 weeks ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-footer">
          <p>This is how your investor portal will appear to external investors.</p>
          {portal.isPublished && portal.portalUrl && (
            <p>
              <strong>Portal URL:</strong> 
              <code>{window.location.origin}{portal.portalUrl}</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorPortalPreview;