import React, { useState, useEffect, useCallback } from 'react';
import { X, Monitor, Smartphone, Eye, ExternalLink, FileText, Link as LinkIcon } from 'lucide-react';
import './DealRoomPreview.css';

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

interface DealRoomPreviewProps {
  projectId: string;
  onClose: () => void;
  theme?: 'light' | 'dark';
  autoRefresh?: boolean;
}

type ViewMode = 'desktop' | 'mobile';

const DealRoomPreview: React.FC<DealRoomPreviewProps> = ({ 
  projectId, 
  onClose, 
  theme = 'light',
  autoRefresh = false
}) => {
  const [dealRoom, setDealRoom] = useState<DealRoom | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [investorPortal, setInvestorPortal] = useState<InvestorPortal | null>(null);
  const [debtEquityClasses, setDebtEquityClasses] = useState<DebtEquityClass[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currentTheme, setTheme] = useState<'light' | 'dark'>(theme);

  const loadPreviewData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new investor dashboard endpoint for comprehensive data
      const dashboardRes = await fetch(`http://localhost:3001/api/projects/${projectId}/investor-dashboard`);

      if (!dashboardRes.ok) {
        throw new Error('Failed to load investor dashboard data');
      }

      const dashboardData = await dashboardRes.json();

      if (dashboardData.success) {
        const data = dashboardData.data;
        setDealRoom(data.dealRoom);
        setProject(data.project);
        setCompanyProfile(data.companyProfile);
        setInvestorPortal(data.investorPortal);
        setDebtEquityClasses(data.debtEquityClasses || []);
        setKpis(data.kpis);
        setLastUpdated(new Date());
      } else {
        throw new Error(dashboardData.error?.message || 'Failed to load dashboard data');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadPreviewData();
  }, [loadPreviewData]);

  // Auto-refresh functionality for real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadPreviewData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loadPreviewData]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // };

  const calculateFundingPercentage = () => {
    if (kpis) return kpis.fundingPercentage;
    if (!project || project.targetAmount === 0) return 0;
    return Math.round((project.commitments.totalAmount / project.targetAmount) * 100);
  };

  const getDaysRemaining = () => {
    if (kpis) return kpis.daysRemaining;
    if (!project) return 0;
    const endDate = new Date(project.timeframe.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getShowcasePhotoUrl = () => {
    if (!dealRoom?.showcasePhoto) return null;
    return `http://localhost:3001/api/projects/${projectId}/deal-room/showcase-photo`;
  };

  if (loading) {
    return (
      <div className="deal-room-preview-overlay">
        <div className="deal-room-preview-container">
          <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Loading preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deal-room-preview-overlay">
        <div className="deal-room-preview-container">
          <div className="preview-error">
            <h3>Error Loading Preview</h3>
            <p>{error}</p>
            <button onClick={onClose} className="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const branding = investorPortal?.branding || {
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    accentColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif'
  };

  return (
    <div className="deal-room-preview-overlay">
      <div className="deal-room-preview-container">
        {/* Preview Header */}
        <div className="preview-header">
          <div className="preview-title">
            <h2>Deal Room Preview</h2>
            <p>Investor Dashboard - {project?.projectName}</p>
            {autoRefresh && (
              <small className="last-updated">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </small>
            )}
          </div>
          
          <div className="preview-controls">
            <div className="theme-toggle">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="theme-btn"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
            
            <div className="view-mode-toggle">
              <button
                onClick={() => setViewMode('desktop')}
                className={`view-mode-btn ${viewMode === 'desktop' ? 'active' : ''}`}
                title="Desktop View"
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`view-mode-btn ${viewMode === 'mobile' ? 'active' : ''}`}
                title="Mobile View"
              >
                <Smartphone size={16} />
              </button>
            </div>
            
            <button onClick={loadPreviewData} className="refresh-btn" title="Refresh Preview">
              🔄
            </button>
            
            <button onClick={onClose} className="preview-close-btn" title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className={`preview-content ${viewMode}`} data-testid="preview-content">
          <div 
            className={`investor-dashboard ${currentTheme}`}
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
                      {calculateFundingPercentage()}%
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-label">Days Remaining</div>
                    <div 
                      className="metric-value"
                      style={{ color: branding.primaryColor }}
                    >
                      {getDaysRemaining()}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="funding-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${Math.min(calculateFundingPercentage(), 100)}%`,
                        backgroundColor: branding.accentColor 
                      }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {calculateFundingPercentage()}% of {project ? formatCurrency(project.targetAmount, project.currency) : '$0'} goal
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

            {/* Key Information */}
            {dealRoom?.keyInfo && dealRoom.keyInfo.length > 0 && (
              <div className="key-info-section">
                <h2 style={{ color: branding.primaryColor }}>
                  <LinkIcon size={20} />
                  Key Information
                </h2>
                <div className="key-info-list">
                  {dealRoom.keyInfo
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
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
                    .sort((a, b) => a.order - b.order)
                    .map((link) => (
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

            {/* Investment Classes */}
            {debtEquityClasses && debtEquityClasses.length > 0 && (
              <div className="investment-classes-section">
                <h2 style={{ color: branding.primaryColor }}>
                  💼 Investment Classes
                </h2>
                <div className="investment-classes-grid">
                  {debtEquityClasses
                    .filter(cls => cls.isOpenToInvestments)
                    .map((cls) => (
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
                
                {debtEquityClasses.filter(cls => cls.isOpenToInvestments).length === 0 && (
                  <div className="no-classes-message">
                    <p>No investment classes are currently open for investment.</p>
                  </div>
                )}
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
        </div>

        {/* Preview Footer */}
        <div className="preview-footer">
          <div className="preview-info">
            <Eye size={16} />
            <span>This is how your deal room will appear to investors</span>
          </div>
          <div className="preview-actions">
            <button 
              onClick={() => window.open(`/investor-dashboard/${projectId}`, '_blank')}
              className="btn btn-outline"
            >
              <ExternalLink size={16} />
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealRoomPreview;
