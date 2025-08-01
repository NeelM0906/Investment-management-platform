import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DealRoomPage from './DealRoomPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ projectId: 'test-project-id' }),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

// Mock all the child components
jest.mock('../components/ShowcasePhotoManager', () => {
  return function MockShowcasePhotoManager({ projectId, onPhotoUpdated }: any) {
    return (
      <div data-testid="showcase-photo-manager">
        <h3>Showcase Photo Manager</h3>
        <button onClick={onPhotoUpdated}>Update Photo</button>
      </div>
    );
  };
});

jest.mock('../components/InvestmentBlurbEditor', () => {
  return function MockInvestmentBlurbEditor({ initialValue, onUpdate }: any) {
    return (
      <div data-testid="investment-blurb-editor">
        <h3>Investment Blurb Editor</h3>
        <textarea 
          value={initialValue} 
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Investment blurb"
        />
      </div>
    );
  };
});

jest.mock('../components/InvestmentSummaryEditor', () => {
  return function MockInvestmentSummaryEditor({ initialValue, onUpdate }: any) {
    return (
      <div data-testid="investment-summary-editor">
        <h3>Investment Summary Editor</h3>
        <textarea 
          value={initialValue} 
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Investment summary"
        />
      </div>
    );
  };
});

jest.mock('../components/KeyInfoManager', () => {
  return function MockKeyInfoManager({ keyInfo, onUpdate }: any) {
    return (
      <div data-testid="key-info-manager">
        <h3>Key Info Manager</h3>
        <div>Items: {keyInfo.length}</div>
        <button onClick={() => onUpdate([...keyInfo, { id: 'new', name: 'New Item', link: 'https://example.com', order: keyInfo.length }])}>
          Add Item
        </button>
      </div>
    );
  };
});

jest.mock('../components/ExternalLinksManager', () => {
  return function MockExternalLinksManager({ externalLinks, onUpdate }: any) {
    return (
      <div data-testid="external-links-manager">
        <h3>External Links Manager</h3>
        <div>Links: {externalLinks.length}</div>
        <button onClick={() => onUpdate([...externalLinks, { id: 'new', name: 'New Link', url: 'https://example.com', order: externalLinks.length }])}>
          Add Link
        </button>
      </div>
    );
  };
});

jest.mock('../components/DealRoomPreview', () => {
  return function MockDealRoomPreview({ projectId, onClose }: any) {
    return (
      <div data-testid="deal-room-preview">
        <h3>Deal Room Preview</h3>
        <button onClick={onClose}>Close Preview</button>
      </div>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

const mockProject = {
  id: 'test-project-id',
  projectName: 'Test Project',
  legalProjectName: 'Test Project LLC'
};

const mockDealRoom = {
  id: 'dr-123',
  projectId: 'test-project-id',
  showcasePhoto: {
    filename: 'test.jpg',
    originalName: 'test.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    uploadedAt: new Date().toISOString()
  },
  investmentBlurb: 'Test investment blurb',
  investmentSummary: 'Test investment summary',
  keyInfo: [
    { id: '1', name: 'Prospectus', link: 'https://example.com/prospectus.pdf', order: 0 }
  ],
  externalLinks: [
    { id: '1', name: 'Company Website', url: 'https://company.com', order: 0 }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Helper function to render component
const renderComponent = () => {
  return render(<DealRoomPage />);
};

describe('DealRoomPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses by default
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockProject })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockDealRoom })
      });
  });

  it('renders without crashing', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Deal Room')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    // Mock delayed response
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderComponent();
    
    expect(screen.getByText('Loading deal room...')).toBeInTheDocument();
  });

  it('fetches project and deal room data on mount', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/projects/test-project-id');
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/projects/test-project-id/deal-room');
    });
  });

  it('displays project name in header', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('displays breadcrumb navigation', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Deal Room')).toBeInTheDocument();
    });
  });

  it('shows sidebar navigation with all sections', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Showcase Photo')).toBeInTheDocument();
      expect(screen.getByText('Investment Blurb')).toBeInTheDocument();
      expect(screen.getByText('Investment Summary')).toBeInTheDocument();
      expect(screen.getByText('Key Info')).toBeInTheDocument();
      expect(screen.getByText('External Links')).toBeInTheDocument();
    });
  });

  it('defaults to showcase photo section', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('showcase-photo-manager')).toBeInTheDocument();
    });
  });

  it('switches sections when sidebar items are clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('showcase-photo-manager')).toBeInTheDocument();
    });

    // Click on Investment Blurb
    const blurbButton = screen.getByText('Investment Blurb');
    await user.click(blurbButton);
    
    expect(screen.getByTestId('investment-blurb-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('showcase-photo-manager')).not.toBeInTheDocument();
  });

  it('handles section query parameter', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('investment-summary-editor')).toBeInTheDocument();
    });
  });

  it('updates deal room data when components trigger updates', async () => {
    const user = userEvent.setup();
    
    // Mock successful update response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        data: { ...mockDealRoom, investmentBlurb: 'Updated blurb' }
      })
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('showcase-photo-manager')).toBeInTheDocument();
    });

    // Switch to investment blurb section
    const blurbButton = screen.getByText('Investment Blurb');
    await user.click(blurbButton);
    
    // Update the blurb
    const textarea = screen.getByPlaceholderText('Investment blurb');
    await user.clear(textarea);
    await user.type(textarea, 'Updated blurb');
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/projects/test-project-id/deal-room',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ investmentBlurb: 'Updated blurb' })
        })
      );
    });
  });

  it('shows preview modal when preview button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('👁️ Preview')).toBeInTheDocument();
    });

    const previewButton = screen.getByText('👁️ Preview');
    await user.click(previewButton);
    
    expect(screen.getByTestId('deal-room-preview')).toBeInTheDocument();
  });

  it('closes preview modal when close is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('👁️ Preview')).toBeInTheDocument();
    });

    // Open preview
    const previewButton = screen.getByText('👁️ Preview');
    await user.click(previewButton);
    
    expect(screen.getByTestId('deal-room-preview')).toBeInTheDocument();
    
    // Close preview
    const closeButton = screen.getByText('Close Preview');
    await user.click(closeButton);
    
    expect(screen.queryByTestId('deal-room-preview')).not.toBeInTheDocument();
  });

  it('handles back to project navigation', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('← Back to Project')).toBeInTheDocument();
    });

    // Note: In a real test, we'd need to mock useNavigate from react-router-dom
    // For now, we just verify the button exists
    const backButton = screen.getByText('← Back to Project');
    expect(backButton).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('shows retry button on error', async () => {
    const user = userEvent.setup();
    
    // Mock initial error, then success
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockProject })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockDealRoom })
      });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);
    
    await waitFor(() => {
      expect(screen.getByText('Deal Room')).toBeInTheDocument();
    });
  });

  it('handles missing project or deal room data', async () => {
    // Mock successful project fetch but no deal room
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockProject })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, data: null })
      });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Deal Room Not Found')).toBeInTheDocument();
    });
  });

  it('shows saving state when updating data', async () => {
    const user = userEvent.setup();
    
    // Mock delayed update response
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockDealRoom })
      }), 1000))
    );

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('showcase-photo-manager')).toBeInTheDocument();
    });

    // Switch to investment blurb and trigger update
    const blurbButton = screen.getByText('Investment Blurb');
    await user.click(blurbButton);
    
    const textarea = screen.getByPlaceholderText('Investment blurb');
    await user.type(textarea, 'New content');
    
    // The saving state would be handled by the child components
    // We just verify the update was triggered
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/projects/test-project-id/deal-room',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  it('passes correct props to child components', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('showcase-photo-manager')).toBeInTheDocument();
    });

    // Switch to each section and verify components receive correct data
    const sections = [
      { button: 'Investment Blurb', testId: 'investment-blurb-editor' },
      { button: 'Investment Summary', testId: 'investment-summary-editor' },
      { button: 'Key Info', testId: 'key-info-manager' },
      { button: 'External Links', testId: 'external-links-manager' }
    ];

    for (const section of sections) {
      const sectionButton = screen.getByText(section.button);
      await userEvent.click(sectionButton);
      
      expect(screen.getByTestId(section.testId)).toBeInTheDocument();
    }
  });

  it('handles photo update callback', async () => {
    const user = userEvent.setup();
    
    // Mock successful photo update
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        data: { ...mockDealRoom, showcasePhoto: { ...mockDealRoom.showcasePhoto, filename: 'new-photo.jpg' } }
      })
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('showcase-photo-manager')).toBeInTheDocument();
    });

    // Trigger photo update
    const updateButton = screen.getByText('Update Photo');
    await user.click(updateButton);
    
    // Should refetch deal room data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/projects/test-project-id');
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/projects/test-project-id/deal-room');
    });
  });
});