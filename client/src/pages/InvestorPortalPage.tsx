import React, { useState, useEffect } from 'react';
import { Monitor, Palette, MessageSquare, BarChart3, Upload, Eye, Save, RotateCcw, ExternalLink } from 'lucide-react';
import InvestorPortalPreview from '../components/InvestorPortalPreview';
import './InvestorPortalPage.css';

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

interface AvailableMetric {
  id: string;
  name: string;
  description: string;
}

type TabType = 'login' | 'branding' | 'welcome' | 'metrics';

const InvestorPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [portal, setPortal] = useState<InvestorPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMetrics, setAvailableMetrics] = useState<AvailableMetric[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Form states for each tab
  const [loginAssets, setLoginAssets] = useState({
    logoFile: null as File | null,
    backgroundFile: null as File | null,
    logoAltText: '',
    logoPreview: '',
    backgroundPreview: ''
  });

  const [branding, setBranding] = useState({
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    accentColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif',
    logoFile: null as File | null,
    logoPreview: ''
  });

  const [welcomeMessage, setWelcomeMessage] = useState({
    title: '',
    content: '',
    showOnDashboard: true
  });

  const [metrics, setMetrics] = useState({
    selectedMetrics: [] as string[],
    customMetrics: [] as CustomMetric[],
    displayOrder: [] as string[]
  });

  const [newCustomMetric, setNewCustomMetric] = useState({
    name: '',
    value: '',
    unit: '',
    description: '',
    displayFormat: 'number' as CustomMetric['displayFormat']
  });

  useEffect(() => {
    loadPortalConfiguration();
    loadAvailableMetrics();
  }, []);

  const loadPortalConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/investor-portal');
      if (!response.ok) {
        throw new Error('Failed to load portal configuration');
      }
      const result = await response.json();
      const portalData = result.data;
      setPortal(portalData);
      
      // Initialize form states
      setLoginAssets({
        logoFile: null,
        backgroundFile: null,
        logoAltText: portalData.loginPageAssets?.logoAltText || '',
        logoPreview: portalData.loginPageAssets?.logoUrl || '',
        backgroundPreview: portalData.loginPageAssets?.backgroundImageUrl || ''
      });

      setBranding({
        primaryColor: portalData.branding?.primaryColor || '#007bff',
        secondaryColor: portalData.branding?.secondaryColor || '#6c757d',
        accentColor: portalData.branding?.accentColor || '#28a745',
        fontFamily: portalData.branding?.fontFamily || 'Arial, sans-serif',
        logoFile: null,
        logoPreview: portalData.branding?.logoUrl || ''
      });

      setWelcomeMessage(portalData.welcomeMessage);
      setMetrics(portalData.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portal configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMetrics = async () => {
    try {
      const response = await fetch('/api/investor-portal/available-metrics');
      if (!response.ok) {
        throw new Error('Failed to load available metrics');
      }
      const metricsData = await response.json();
      setAvailableMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load available metrics:', err);
    }
  };

  const handleImageUpload = (file: File, type: 'logo' | 'background', target: 'login' | 'branding') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      
      if (target === 'login') {
        setLoginAssets(prev => ({
          ...prev,
          [type === 'logo' ? 'logoFile' : 'backgroundFile']: file,
          [type === 'logo' ? 'logoPreview' : 'backgroundPreview']: preview
        }));
      } else {
        setBranding(prev => ({
          ...prev,
          logoFile: file,
          logoPreview: preview
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const saveLoginPageAssets = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      
      if (loginAssets.logoFile) {
        formData.append('logo', loginAssets.logoFile);
      }
      if (loginAssets.backgroundFile) {
        formData.append('background', loginAssets.backgroundFile);
      }
      formData.append('logoAltText', loginAssets.logoAltText);

      const response = await fetch('/api/investor-portal/login-assets', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save login page assets');
      }

      const updatedPortal = await response.json();
      setPortal(updatedPortal);
      alert('Login page assets saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save login page assets');
    } finally {
      setSaving(false);
    }
  };

  const saveBranding = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      
      formData.append('primaryColor', branding.primaryColor);
      formData.append('secondaryColor', branding.secondaryColor);
      formData.append('accentColor', branding.accentColor);
      formData.append('fontFamily', branding.fontFamily);
      
      if (branding.logoFile) {
        formData.append('logo', branding.logoFile);
      }

      const response = await fetch('/api/investor-portal/branding', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save branding');
      }

      const updatedPortal = await response.json();
      setPortal(updatedPortal);
      alert('Branding saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const saveWelcomeMessage = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/investor-portal/welcome-message', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(welcomeMessage)
      });

      if (!response.ok) {
        throw new Error('Failed to save welcome message');
      }

      const updatedPortal = await response.json();
      setPortal(updatedPortal);
      alert('Welcome message saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save welcome message');
    } finally {
      setSaving(false);
    }
  };

  const saveMetrics = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/investor-portal/metrics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error('Failed to save metrics');
      }

      const updatedPortal = await response.json();
      setPortal(updatedPortal);
      alert('Metrics saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metrics');
    } finally {
      setSaving(false);
    }
  };

  const addCustomMetric = () => {
    if (!newCustomMetric.name.trim()) {
      alert('Please enter a metric name');
      return;
    }

    const customMetric: CustomMetric = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: newCustomMetric.name.trim(),
      value: newCustomMetric.value,
      unit: newCustomMetric.unit.trim() || undefined,
      description: newCustomMetric.description.trim() || undefined,
      displayFormat: newCustomMetric.displayFormat
    };

    setMetrics(prev => ({
      ...prev,
      customMetrics: [...prev.customMetrics, customMetric],
      displayOrder: [...prev.displayOrder, customMetric.id]
    }));

    setNewCustomMetric({
      name: '',
      value: '',
      unit: '',
      description: '',
      displayFormat: 'number'
    });
  };

  const removeCustomMetric = (metricId: string) => {
    setMetrics(prev => ({
      ...prev,
      customMetrics: prev.customMetrics.filter(m => m.id !== metricId),
      displayOrder: prev.displayOrder.filter(id => id !== metricId)
    }));
  };

  const toggleSelectedMetric = (metricId: string) => {
    setMetrics(prev => {
      const isSelected = prev.selectedMetrics.includes(metricId);
      const newSelected = isSelected 
        ? prev.selectedMetrics.filter(id => id !== metricId)
        : [...prev.selectedMetrics, metricId];
      
      const newDisplayOrder = isSelected
        ? prev.displayOrder.filter(id => id !== metricId)
        : [...prev.displayOrder, metricId];

      return {
        ...prev,
        selectedMetrics: newSelected,
        displayOrder: newDisplayOrder
      };
    });
  };

  const publishPortal = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/investor-portal/publish', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to publish portal');
      }

      const updatedPortal = await response.json();
      setPortal(updatedPortal);
      alert('Portal published successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish portal');
    } finally {
      setSaving(false);
    }
  };

  const unpublishPortal = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/investor-portal/unpublish', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish portal');
      }

      const updatedPortal = await response.json();
      setPortal(updatedPortal);
      alert('Portal unpublished successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish portal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading portal configuration...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={loadPortalConfiguration} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'login' as TabType, label: 'Login Page', icon: Monitor },
    { id: 'branding' as TabType, label: 'Branding', icon: Palette },
    { id: 'welcome' as TabType, label: 'Welcome Message', icon: MessageSquare },
    { id: 'metrics' as TabType, label: 'Metrics', icon: BarChart3 }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Investor Portal Configuration</h1>
          <p className="page-subtitle">Customize your investor-facing portal</p>
        </div>
        <div className="page-actions">
          <button 
            onClick={() => setShowPreview(true)} 
            disabled={!portal}
            className="btn btn-outline"
          >
            <ExternalLink className="btn-icon" />
            Preview Portal
          </button>
          {portal?.isPublished ? (
            <button 
              onClick={unpublishPortal} 
              disabled={saving}
              className="btn btn-secondary"
            >
              <RotateCcw className="btn-icon" />
              Unpublish Portal
            </button>
          ) : (
            <button 
              onClick={publishPortal} 
              disabled={saving}
              className="btn btn-success"
            >
              <Eye className="btn-icon" />
              Publish Portal
            </button>
          )}
        </div>
      </div>

      <div className="portal-config-container">
        <div className="tab-navigation">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="tab-icon" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="tab-content">
          {activeTab === 'login' && (
            <LoginPageTab
              assets={loginAssets}
              onAssetsChange={setLoginAssets}
              onImageUpload={handleImageUpload}
              onSave={saveLoginPageAssets}
              saving={saving}
            />
          )}

          {activeTab === 'branding' && (
            <BrandingTab
              branding={branding}
              onBrandingChange={setBranding}
              onImageUpload={handleImageUpload}
              onSave={saveBranding}
              saving={saving}
            />
          )}

          {activeTab === 'welcome' && (
            <WelcomeMessageTab
              welcomeMessage={welcomeMessage}
              onWelcomeMessageChange={setWelcomeMessage}
              onSave={saveWelcomeMessage}
              saving={saving}
            />
          )}

          {activeTab === 'metrics' && (
            <MetricsTab
              metrics={metrics}
              availableMetrics={availableMetrics}
              newCustomMetric={newCustomMetric}
              onMetricsChange={setMetrics}
              onNewCustomMetricChange={setNewCustomMetric}
              onAddCustomMetric={addCustomMetric}
              onRemoveCustomMetric={removeCustomMetric}
              onToggleSelectedMetric={toggleSelectedMetric}
              onSave={saveMetrics}
              saving={saving}
            />
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && portal && (
        <InvestorPortalPreview
          portal={portal}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

// Login Page Tab Component
interface LoginPageTabProps {
  assets: any;
  onAssetsChange: (assets: any) => void;
  onImageUpload: (file: File, type: 'logo' | 'background', target: 'login') => void;
  onSave: () => void;
  saving: boolean;
}

const LoginPageTab: React.FC<LoginPageTabProps> = ({
  assets,
  onAssetsChange,
  onImageUpload,
  onSave,
  saving
}) => {
  return (
    <div className="tab-panel">
      <div className="tab-panel-header">
        <h2>Login Page Assets</h2>
        <p>Configure the logo and background image for your investor portal login page</p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Logo</label>
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageUpload(file, 'logo', 'login');
              }}
              className="file-input"
              id="login-logo-upload"
            />
            <label htmlFor="login-logo-upload" className="file-upload-button">
              <Upload className="upload-icon" />
              Choose Logo
            </label>
            {assets.logoPreview && (
              <div className="image-preview">
                <img src={assets.logoPreview} alt="Logo preview" className="preview-image logo-preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="logo-alt-text" className="form-label">Logo Alt Text</label>
          <input
            type="text"
            id="logo-alt-text"
            value={assets.logoAltText}
            onChange={(e) => onAssetsChange({ ...assets, logoAltText: e.target.value })}
            className="form-input"
            placeholder="Company Logo"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Background Image</label>
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageUpload(file, 'background', 'login');
              }}
              className="file-input"
              id="login-background-upload"
            />
            <label htmlFor="login-background-upload" className="file-upload-button">
              <Upload className="upload-icon" />
              Choose Background
            </label>
            {assets.backgroundPreview && (
              <div className="image-preview">
                <img src={assets.backgroundPreview} alt="Background preview" className="preview-image background-preview" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="tab-panel-actions">
        <button onClick={onSave} disabled={saving} className="btn btn-primary">
          <Save className="btn-icon" />
          {saving ? 'Saving...' : 'Save Login Page Assets'}
        </button>
      </div>
    </div>
  );
};

export default InvestorPortalPage;

// Branding Tab Component
interface BrandingTabProps {
  branding: any;
  onBrandingChange: (branding: any) => void;
  onImageUpload: (file: File, type: 'logo', target: 'branding') => void;
  onSave: () => void;
  saving: boolean;
}

const BrandingTab: React.FC<BrandingTabProps> = ({
  branding,
  onBrandingChange,
  onImageUpload,
  onSave,
  saving
}) => {
  const fontOptions = [
    'Inter, sans-serif',
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif'
  ];

  return (
    <div className="tab-panel">
      <div className="tab-panel-header">
        <h2>Branding</h2>
        <p>Configure colors, fonts, and branding elements for your investor portal</p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Brand Logo</label>
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageUpload(file, 'logo', 'branding');
              }}
              className="file-input"
              id="branding-logo-upload"
            />
            <label htmlFor="branding-logo-upload" className="file-upload-button">
              <Upload className="upload-icon" />
              Choose Brand Logo
            </label>
            {branding.logoPreview && (
              <div className="image-preview">
                <img src={branding.logoPreview} alt="Brand logo preview" className="preview-image logo-preview" />
              </div>
            )}
          </div>
        </div>

        <div className="color-section">
          <h3>Color Scheme</h3>
          <div className="color-inputs">
            <div className="form-group">
              <label htmlFor="primary-color" className="form-label">Primary Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="primary-color"
                  value={branding.primaryColor}
                  onChange={(e) => onBrandingChange({ ...branding, primaryColor: e.target.value })}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => onBrandingChange({ ...branding, primaryColor: e.target.value })}
                  className="color-text-input"
                  placeholder="#1f2937"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="secondary-color" className="form-label">Secondary Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="secondary-color"
                  value={branding.secondaryColor}
                  onChange={(e) => onBrandingChange({ ...branding, secondaryColor: e.target.value })}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => onBrandingChange({ ...branding, secondaryColor: e.target.value })}
                  className="color-text-input"
                  placeholder="#374151"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="accent-color" className="form-label">Accent Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="accent-color"
                  value={branding.accentColor}
                  onChange={(e) => onBrandingChange({ ...branding, accentColor: e.target.value })}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={branding.accentColor}
                  onChange={(e) => onBrandingChange({ ...branding, accentColor: e.target.value })}
                  className="color-text-input"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="font-family" className="form-label">Font Family</label>
          <select
            id="font-family"
            value={branding.fontFamily}
            onChange={(e) => onBrandingChange({ ...branding, fontFamily: e.target.value })}
            className="form-select"
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="branding-preview">
          <h3>Preview</h3>
          <div 
            className="preview-card"
            style={{
              backgroundColor: branding.primaryColor,
              color: 'white',
              fontFamily: branding.fontFamily
            }}
          >
            <div className="preview-header" style={{ backgroundColor: branding.secondaryColor }}>
              Sample Header
            </div>
            <div className="preview-content">
              <p>This is how your branding will look</p>
              <button 
                className="preview-button"
                style={{ backgroundColor: branding.accentColor }}
              >
                Sample Button
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-panel-actions">
        <button onClick={onSave} disabled={saving} className="btn btn-primary">
          <Save className="btn-icon" />
          {saving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>
    </div>
  );
};

// Welcome Message Tab Component
interface WelcomeMessageTabProps {
  welcomeMessage: any;
  onWelcomeMessageChange: (message: any) => void;
  onSave: () => void;
  saving: boolean;
}

const WelcomeMessageTab: React.FC<WelcomeMessageTabProps> = ({
  welcomeMessage,
  onWelcomeMessageChange,
  onSave,
  saving
}) => {
  return (
    <div className="tab-panel">
      <div className="tab-panel-header">
        <h2>Welcome Message</h2>
        <p>Configure the welcome message that investors will see on your portal</p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="welcome-title" className="form-label">Welcome Title</label>
          <input
            type="text"
            id="welcome-title"
            value={welcomeMessage.title}
            onChange={(e) => onWelcomeMessageChange({ ...welcomeMessage, title: e.target.value })}
            className="form-input"
            placeholder="Welcome to Our Investor Portal"
            maxLength={100}
          />
          <small className="form-help">Maximum 100 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="welcome-content" className="form-label">Welcome Content</label>
          <textarea
            id="welcome-content"
            value={welcomeMessage.content}
            onChange={(e) => onWelcomeMessageChange({ ...welcomeMessage, content: e.target.value })}
            className="form-textarea rich-editor"
            placeholder="Enter your welcome message content here..."
            rows={8}
            maxLength={1000}
          />
          <small className="form-help">Maximum 1000 characters. You can use basic formatting.</small>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={welcomeMessage.showOnDashboard}
              onChange={(e) => onWelcomeMessageChange({ ...welcomeMessage, showOnDashboard: e.target.checked })}
              className="form-checkbox"
            />
            Show welcome message on dashboard
          </label>
        </div>

        <div className="welcome-preview">
          <h3>Preview</h3>
          <div className="preview-welcome-card">
            <h4 className="preview-welcome-title">{welcomeMessage.title || 'Welcome Title'}</h4>
            <div className="preview-welcome-content">
              {welcomeMessage.content ? (
                <p>{welcomeMessage.content}</p>
              ) : (
                <p className="preview-placeholder">Welcome message content will appear here...</p>
              )}
            </div>
            {!welcomeMessage.showOnDashboard && (
              <small className="preview-note">Note: This message will not be shown on the dashboard</small>
            )}
          </div>
        </div>
      </div>

      <div className="tab-panel-actions">
        <button onClick={onSave} disabled={saving} className="btn btn-primary">
          <Save className="btn-icon" />
          {saving ? 'Saving...' : 'Save Welcome Message'}
        </button>
      </div>
    </div>
  );
};

// Metrics Tab Component
interface MetricsTabProps {
  metrics: any;
  availableMetrics: AvailableMetric[];
  newCustomMetric: any;
  onMetricsChange: (metrics: any) => void;
  onNewCustomMetricChange: (metric: any) => void;
  onAddCustomMetric: () => void;
  onRemoveCustomMetric: (id: string) => void;
  onToggleSelectedMetric: (id: string) => void;
  onSave: () => void;
  saving: boolean;
}

const MetricsTab: React.FC<MetricsTabProps> = ({
  metrics,
  availableMetrics,
  newCustomMetric,
  onMetricsChange,
  onNewCustomMetricChange,
  onAddCustomMetric,
  onRemoveCustomMetric,
  onToggleSelectedMetric,
  onSave,
  saving
}) => {
  return (
    <div className="tab-panel">
      <div className="tab-panel-header">
        <h2>Metrics Configuration</h2>
        <p>Select predefined metrics and create custom metrics for your investor portal</p>
      </div>

      <div className="form-section">
        <div className="metrics-section">
          <h3>Predefined Metrics</h3>
          <p className="section-description">Select which metrics to display on your investor portal</p>
          
          <div className="metrics-grid">
            {availableMetrics.map(metric => (
              <div key={metric.id} className="metric-card">
                <label className="metric-checkbox-label">
                  <input
                    type="checkbox"
                    checked={metrics.selectedMetrics.includes(metric.id)}
                    onChange={() => onToggleSelectedMetric(metric.id)}
                    className="metric-checkbox"
                  />
                  <div className="metric-info">
                    <h4 className="metric-name">{metric.name}</h4>
                    <p className="metric-description">{metric.description}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="custom-metrics-section">
          <h3>Custom Metrics</h3>
          <p className="section-description">Create custom metrics specific to your business</p>
          
          <div className="add-custom-metric">
            <div className="custom-metric-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="custom-metric-name" className="form-label">Metric Name</label>
                  <input
                    type="text"
                    id="custom-metric-name"
                    value={newCustomMetric.name}
                    onChange={(e) => onNewCustomMetricChange({ ...newCustomMetric, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Portfolio Value"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="custom-metric-value" className="form-label">Value</label>
                  <input
                    type="text"
                    id="custom-metric-value"
                    value={newCustomMetric.value}
                    onChange={(e) => onNewCustomMetricChange({ ...newCustomMetric, value: e.target.value })}
                    className="form-input"
                    placeholder="e.g., 1000000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="custom-metric-format" className="form-label">Display Format</label>
                  <select
                    id="custom-metric-format"
                    value={newCustomMetric.displayFormat}
                    onChange={(e) => onNewCustomMetricChange({ ...newCustomMetric, displayFormat: e.target.value })}
                    className="form-select"
                  >
                    <option value="number">Number</option>
                    <option value="currency">Currency</option>
                    <option value="percentage">Percentage</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="custom-metric-unit" className="form-label">Unit (Optional)</label>
                  <input
                    type="text"
                    id="custom-metric-unit"
                    value={newCustomMetric.unit}
                    onChange={(e) => onNewCustomMetricChange({ ...newCustomMetric, unit: e.target.value })}
                    className="form-input"
                    placeholder="e.g., USD, %, units"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="custom-metric-description" className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  id="custom-metric-description"
                  value={newCustomMetric.description}
                  onChange={(e) => onNewCustomMetricChange({ ...newCustomMetric, description: e.target.value })}
                  className="form-input"
                  placeholder="Brief description of this metric"
                />
              </div>

              <button 
                type="button" 
                onClick={onAddCustomMetric}
                className="btn btn-secondary"
                disabled={!newCustomMetric.name.trim()}
              >
                Add Custom Metric
              </button>
            </div>
          </div>

          {metrics.customMetrics.length > 0 && (
            <div className="custom-metrics-list">
              <h4>Your Custom Metrics</h4>
              <div className="custom-metrics-grid">
                {metrics.customMetrics.map((metric: CustomMetric) => (
                  <div key={metric.id} className="custom-metric-item">
                    <div className="custom-metric-header">
                      <h5 className="custom-metric-name">{metric.name}</h5>
                      <button
                        onClick={() => onRemoveCustomMetric(metric.id)}
                        className="remove-metric-btn"
                        title="Remove metric"
                      >
                        ×
                      </button>
                    </div>
                    <div className="custom-metric-details">
                      <p className="custom-metric-value">
                        Value: {metric.value} {metric.unit && `(${metric.unit})`}
                      </p>
                      <p className="custom-metric-format">Format: {metric.displayFormat}</p>
                      {metric.description && (
                        <p className="custom-metric-description">{metric.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="metrics-preview">
          <h3>Selected Metrics Preview</h3>
          <div className="preview-metrics-grid">
            {metrics.selectedMetrics.map((metricId: string) => {
              const metric = availableMetrics.find(m => m.id === metricId);
              return metric ? (
                <div key={metricId} className="preview-metric-card">
                  <h4>{metric.name}</h4>
                  <p className="preview-metric-value">Sample Value</p>
                </div>
              ) : null;
            })}
            {metrics.customMetrics.map((metric: CustomMetric) => (
              <div key={metric.id} className="preview-metric-card">
                <h4>{metric.name}</h4>
                <p className="preview-metric-value">
                  {metric.value} {metric.unit}
                </p>
              </div>
            ))}
          </div>
          {metrics.selectedMetrics.length === 0 && metrics.customMetrics.length === 0 && (
            <p className="preview-empty">No metrics selected. Choose some metrics to see the preview.</p>
          )}
        </div>
      </div>

      <div className="tab-panel-actions">
        <button onClick={onSave} disabled={saving} className="btn btn-primary">
          <Save className="btn-icon" />
          {saving ? 'Saving...' : 'Save Metrics Configuration'}
        </button>
      </div>
    </div>
  );
};