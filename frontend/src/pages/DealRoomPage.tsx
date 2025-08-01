import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ShowcasePhotoManager from '../components/ShowcasePhotoManager';
import InvestmentBlurbEditor from '../components/InvestmentBlurbEditor';
import InvestmentSummaryEditor from '../components/InvestmentSummaryEditor';
import KeyInfoManager from '../components/KeyInfoManager';
import ExternalLinksManager from '../components/ExternalLinksManager';
import DealRoomPreview from '../components/DealRoomPreview';
import './DealRoomPage.css';

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
}

type DealRoomSection = 'showcase-photo' | 'investment-blurb' | 'investment-summary' | 'key-info' | 'external-links';

const DealRoomPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [dealRoom, setDealRoom] = useState<DealRoom | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<DealRoomSection>('showcase-photo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Handle section query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section') as DealRoomSection;
    if (sectionParam && ['showcase-photo', 'investment-blurb', 'investment-summary', 'key-info', 'external-links'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, []);

  const fetchProjectAndDealRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project details
      const projectResponse = await fetch(`http://localhost:3001/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        throw new Error('Failed to fetch project details');
      }
      const projectData = await projectResponse.json();
      if (projectData.success) {
        setProject(projectData.data);
      }

      // Fetch or create deal room
      const dealRoomResponse = await fetch(`http://localhost:3001/api/projects/${projectId}/deal-room`);
      if (!dealRoomResponse.ok) {
        throw new Error('Failed to fetch deal room data');
      }
      const dealRoomData = await dealRoomResponse.json();
      if (dealRoomData.success) {
        setDealRoom(dealRoomData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectAndDealRoom();
    }
  }, [projectId, fetchProjectAndDealRoom]);

  const updateDealRoom = async (updates: Partial<DealRoom>) => {
    if (!projectId) return;

    try {
      setSaving(true);
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/deal-room`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update deal room');
      }

      const data = await response.json();
      if (data.success) {
        setDealRoom(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deal room');
    } finally {
      setSaving(false);
    }
  };

  const handleSectionChange = (section: DealRoomSection) => {
    setActiveSection(section);
  };

  const handleBackToProject = () => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="deal-room-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading deal room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deal-room-page">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchProjectAndDealRoom} className="retry-button">
            Retry
          </button>
          <button onClick={handleBackToProject} className="back-button">
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  if (!dealRoom || !project) {
    return (
      <div className="deal-room-page">
        <div className="error-state">
          <h2>Deal Room Not Found</h2>
          <p>Unable to load deal room data for this project.</p>
          <button onClick={handleBackToProject} className="back-button">
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    {
      id: 'showcase-photo' as DealRoomSection,
      label: 'Showcase Photo',
      icon: '📷',
      description: 'Upload and manage project showcase image'
    },
    {
      id: 'investment-blurb' as DealRoomSection,
      label: 'Investment Blurb',
      icon: '📝',
      description: 'Short investment summary'
    },
    {
      id: 'investment-summary' as DealRoomSection,
      label: 'Investment Summary',
      icon: '📄',
      description: 'Comprehensive investment details'
    },
    {
      id: 'key-info' as DealRoomSection,
      label: 'Key Info',
      icon: '🔗',
      description: 'Important links and resources'
    },
    {
      id: 'external-links' as DealRoomSection,
      label: 'External Links',
      icon: '🌐',
      description: 'External websites and resources'
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'showcase-photo':
        return (
          <ShowcasePhotoManager
            projectId={projectId!}
            showcasePhoto={dealRoom.showcasePhoto}
            onPhotoUpdated={fetchProjectAndDealRoom}
          />
        );
      case 'investment-blurb':
        return (
          <InvestmentBlurbEditor
            projectId={projectId!}
            initialValue={dealRoom.investmentBlurb}
            onUpdate={(investmentBlurb) => updateDealRoom({ investmentBlurb })}
            saving={saving}
          />
        );
      case 'investment-summary':
        return (
          <InvestmentSummaryEditor
            projectId={projectId!}
            initialValue={dealRoom.investmentSummary}
            onUpdate={(investmentSummary) => updateDealRoom({ investmentSummary })}
            saving={saving}
          />
        );
      case 'key-info':
        return (
          <KeyInfoManager
            projectId={projectId!}
            keyInfo={dealRoom.keyInfo}
            onUpdate={(keyInfo) => updateDealRoom({ keyInfo })}
            saving={saving}
          />
        );
      case 'external-links':
        return (
          <ExternalLinksManager
            projectId={projectId!}
            externalLinks={dealRoom.externalLinks}
            onUpdate={(externalLinks) => updateDealRoom({ externalLinks })}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="deal-room-page">
      {/* Header with Breadcrumb */}
      <div className="deal-room-header">
        <div className="header-content">
          {/* Breadcrumb Navigation */}
          <div className="breadcrumb-nav" style={{ marginBottom: '1rem' }}>
            <Link to="/projects" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>
              Projects
            </Link>
            <span style={{ margin: '0 0.5rem', color: '#94a3b8' }}>›</span>
            <Link 
              to={`/projects/${projectId}`} 
              style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              {project.projectName}
            </Link>
            <span style={{ margin: '0 0.5rem', color: '#94a3b8' }}>›</span>
            <span style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: '500' }}>
              Deal Room
            </span>
          </div>
          
          <div className="header-actions">
            <button onClick={handleBackToProject} className="back-button">
              ← Back to Project
            </button>
            <button 
              onClick={() => setShowPreview(true)} 
              className="preview-button"
              title="Preview how this will appear to investors"
            >
              👁️ Preview
            </button>
          </div>
          <div className="header-info">
            <h1>Deal Room</h1>
            <p className="project-name">{project.projectName}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="deal-room-content">
        {/* Sidebar Navigation */}
        <div className="deal-room-sidebar">
          <nav className="sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <div className="sidebar-content">
                  <span className="sidebar-label">{item.label}</span>
                  <span className="sidebar-description">{item.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="deal-room-main">
          <div className="content-container">
            {renderActiveSection()}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && projectId && (
        <DealRoomPreview
          projectId={projectId}
          onClose={() => setShowPreview(false)}
          autoRefresh={true}
        />
      )}
    </div>
  );
};

export default DealRoomPage;