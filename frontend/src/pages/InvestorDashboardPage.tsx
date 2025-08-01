import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, FileText, Link as LinkIcon } from 'lucide-react';
import './InvestorDashboardPage.css';

interface DealRoom {
  id: string;
  projectId: string;
  showcasePhoto?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  };
  investmentBlurb: string;
  investmentSummary: string;
  keyInfo: Array<{
    id: string;
    name: string;
    link: string;
    order: number;
  }>;
  externalLinks: Array<{
    id: string;
    name: string;
    url: string;
    order: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  projectName: string;
  legalProjectName: string;
  targetAmount: number;
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
}

interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
}

interface InvestorPortal {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  project: Project;
  dealRoom: DealRoom;
  companyProfile: CompanyProfile;
  investorPortal: InvestorPortal;
  debtEquityClasses: DebtEquityClass[];
  kpis: {
    totalCommitments: number;
    totalCommittedAmount: number;
    fundingPercentage: number;
    daysRemaining: number;
  };
}

const InvestorDashboardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/investor-dashboard`);

      if (!response.ok) {
        throw new Error('Failed to load investor dashboard data');
      }

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to load dashboard data');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadDashboardData();
    }
  }, [projectId, loadDashboardData]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getShowcasePhotoUrl = () => {
    if (!dashboardData?.dealRoom?.showcasePhoto) return null;
    return `http://localhost:3001/api/projects/${projectId}/deal-room/showcase-photo`;
  };

  if (loading) {
    return (
      <div className="investor-dashboard-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading investor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="investor-dashboard-page">
        <div className="error-state">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="investor-dashboard-page">
        <div className="error-state">
          <h2>Dashboard Not Found</h2>
          <p>Unable to load dashboard data for this project.</p>
        </div>
      </div>
    );
  }

  const { project, dealRoom, companyProfile, investorPortal, debtEquityClasses, kpis } = dashboardData as DashboardData;

  const branding = investorPortal?.branding || {
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    accentColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif'
  };

  return (
    <div 
      className="investor-dashboard-page"
      style={{ fontFamily: branding.fontFamily }}
    >
      {/* Dashboard Header */}
      <div 
        className="dashboard-header"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <div className="dashboard-nav">
          {branding.logoUrl && (
            <img 
              src={branding.logoUrl} 
              alt="Company Logo"
              className="dashboard-logo"
            />
          )}
          <div className="company-name" style={{ color: 'white' }}>
            {companyProfile?.name || 'Investment Portal'}
          </div>
          <nav className="dashboard-menu">
            <button className="nav-item">Dashboard</button>
            <button className="nav-item active">Offerings</button>
            <button className="nav-item">Portfolio</button>
            <button className="nav-item">Documents</button>
          </nav>
        </div>
      </div>

      {/* Welcome Message */}
      {investorPortal?.welcomeMessage?.showOnDashboard && (
        <div className="welcome-section">
          <div 
            className="welcome-card"
            style={{ borderLeftColor: branding.accentColor }}
          >
            <h2 style={{ color: branding.primaryColor }}>
              {investorPortal.welcomeMessage.title}
            </h2>
            <p>{investorPortal.welcomeMessage.content}</p>
          </div>
        </div>
      )}

      {/* Project Overview */}
      <div className="project-overview">
        <div className="project-header">
          <div className="project-title-section">
            <h1 style={{ color: branding.primaryColor }}>
              {project?.projectName}
            </h1>
            <p className="project-legal-name">{project?.legalProjectName}</p>
          </div>
          
          {dealRoom?.showcasePhoto && (
            <div className="project-showcase">
              <img 
                src={getShowcasePhotoUrl()!} 
                alt="Project Showcase"
                className="showcase-image"
              />
            </div>
          )}
        </div>

        {/* Investment Blurb */}
        {dealRoom?.investmentBlurb && (
          <div className="investment-blurb">
            <p>{dealRoom.investmentBlurb}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="key-metrics">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Target Amount</div>
              <div 
                className="metric-value"
                style={{ color: branding.primaryColor }}
              >
                {project ? formatCurrency(project.targetAmount, project.currency) : '$0'}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Committed</div>
              <div 
                className="metric-value"
                style={{ color: branding.accentColor }}
              >
                {project ? formatCurrency(project.commitments.totalAmount, project.currency) : '$0'}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Funding Progress</div>
              <div 
                className="metric-value"
                style={{ color: branding.accentColor }}
              >
                {kpis?.fundingPercentage || 0}%
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Days Remaining</div>
              <div 
                className="metric-value"
                style={{ color: branding.primaryColor }}
              >
                {kpis?.daysRemaining || 0}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="funding-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(kpis?.fundingPercentage || 0, 100)}%`,
                  backgroundColor: branding.accentColor 
                }}
              ></div>
            </div>
            <div className="progress-text">
              {kpis?.fundingPercentage || 0}% of {project ? formatCurrency(project.targetAmount, project.currency) : '$0'} goal
            </div>
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      {dealRoom?.investmentSummary && (
        <div className="investment-summary-section">
          <h2 style={{ color: branding.primaryColor }}>
            <FileText size={20} />
            Investment Summary
          </h2>
          <div 
            className="investment-summary-content"
            dangerouslySetInnerHTML={{ __html: dealRoom.investmentSummary }}
          />
        </div>
      )}

      {/* Investment Classes */}
      {debtEquityClasses && debtEquityClasses.length > 0 && (
        <div className="investment-classes-section">
          <h2 style={{ color: branding.primaryColor }}>
            💼 Investment Classes
          </h2>
          <div className="investment-classes-grid">
            {debtEquityClasses
              .filter((cls: DebtEquityClass) => cls.isOpenToInvestments)
              .map((cls: DebtEquityClass) => (
                <div
                  key={cls.id}
                  className="investment-class-card"
                  style={{ borderColor: branding.secondaryColor }}
                >
                  <div className="class-header">
                    <h3 style={{ color: branding.primaryColor }}>
                      {cls.unitClass}
                    </h3>
                    <div 
                      className="class-price"
                      style={{ color: branding.accentColor }}
                    >
                      {formatCurrency(cls.unitPrice, project?.currency)}
                    </div>
                  </div>
                  
                  <div className="class-details">
                    <div className="detail-row">
                      <span className="detail-label">Minimum Investment:</span>
                      <span className="detail-value">
                        {formatCurrency(cls.minInvestmentAmount, project?.currency)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Maximum Investment:</span>
                      <span className="detail-value">
                        {formatCurrency(cls.maxInvestmentAmount, project?.currency)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Investment Increment:</span>
                      <span className="detail-value">
                        {formatCurrency(cls.investmentIncrementAmount, project?.currency)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="class-status">
                    <span 
                      className="status-badge open"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      Open for Investment
                    </span>
                  </div>
                </div>
              ))}
          </div>
          
          {debtEquityClasses.filter((cls: DebtEquityClass) => cls.isOpenToInvestments).length === 0 && (
            <div className="no-classes-message">
              <p>No investment classes are currently open for investment.</p>
            </div>
          )}
        </div>
      )}

      {/* Key Information */}
      {dealRoom?.keyInfo && dealRoom.keyInfo.length > 0 && (
        <div className="key-info-section">
          <h2 style={{ color: branding.primaryColor }}>
            <LinkIcon size={20} />
            Key Information
          </h2>
          <div className="key-info-list">
            {dealRoom.keyInfo
              .sort((a: any, b: any) => a.order - b.order)
              .map((item: any) => (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="key-info-item"
                  style={{ borderLeftColor: branding.accentColor }}
                >
                  <span className="key-info-name">{item.name}</span>
                  <ExternalLink size={16} />
                </a>
              ))}
          </div>
        </div>
      )}

      {/* External Links */}
      {dealRoom?.externalLinks && dealRoom.externalLinks.length > 0 && (
        <div className="external-links-section">
          <h2 style={{ color: branding.primaryColor }}>
            <ExternalLink size={20} />
            Additional Resources
          </h2>
          <div className="external-links-list">
            {dealRoom.externalLinks
              .sort((a: any, b: any) => a.order - b.order)
              .map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link-item"
                  style={{ borderColor: branding.secondaryColor }}
                >
                  <span className="external-link-name">{link.name}</span>
                  <ExternalLink size={16} />
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {companyProfile && (
        <div className="contact-section">
          <h2 style={{ color: branding.primaryColor }}>Contact Information</h2>
          <div className="contact-info">
            <div className="contact-item">
              <strong>Company:</strong> {companyProfile.name}
            </div>
            <div className="contact-item">
              <strong>Email:</strong> {companyProfile.email}
            </div>
            <div className="contact-item">
              <strong>Phone:</strong> {companyProfile.phoneNumber}
            </div>
            <div className="contact-item">
              <strong>Address:</strong> {companyProfile.address}, {companyProfile.city}, {companyProfile.state} {companyProfile.zipCode}, {companyProfile.country}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDashboardPage;