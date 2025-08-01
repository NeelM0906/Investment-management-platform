import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentSummaryEditor from './InvestmentSummaryEditor';
import InvestmentBlurbEditor from './InvestmentBlurbEditor';
import KeyInfoManager from './KeyInfoManager';
import ExternalLinksManager from './ExternalLinksManager';
import ShowcasePhotoManager from './ShowcasePhotoManager';
import DealRoomPreview from './DealRoomPreview';

// Mock the auto-save functionality
jest.mock('../hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    saveStatus: {
      status: 'saved',
      hasUnsavedChanges: false,
      version: 1
    },
    saveDraft: jest.fn(),
    publishDraft: jest.fn(),
    recoverUnsavedChanges: jest.fn().mockResolvedValue(null),
    clearDraft: jest.fn(),
    setSaving: jest.fn(),
    hasUnsavedChanges: false
  })
}));

// Mock fetch
global.fetch = jest.fn();

// Mock URL validation
jest.mock('../utils/urlValidation', () => ({
  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}));

// Mock ImageUploadManager
jest.mock('./ImageUploadManager', () => {
  return function MockImageUploadManager({ onImageUpload, onImageDelete, currentImage }: any) {
    return (
      <div data-testid="image-upload-manager">
        <button onClick={() => onImageUpload(new File(['test'], 'test.jpg', { type: 'image/jpeg' }))}>
          Upload Image
        </button>
        {currentImage && (
          <button onClick={() => onImageDelete()}>
            Delete Image
          </button>
        )}
      </div>
    );
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ projectId: 'test-project' }),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

describe('Deal Room Components', () => {
  const mockProps = {
    projectId: 'test-project-id',
    saving: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    });
  });

  describe('InvestmentSummaryEditor', () => {
    it('renders without crashing', () => {
      render(
        <InvestmentSummaryEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('Investment Summary')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Write your comprehensive investment summary/)).toBeInTheDocument();
    });

    it('displays formatting toolbar', () => {
      render(
        <InvestmentSummaryEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('B')).toBeInTheDocument(); // Bold button
      expect(screen.getByText('I')).toBeInTheDocument(); // Italic button
      expect(screen.getByText('📄 Templates')).toBeInTheDocument(); // Templates button
    });

    it('handles text input and formatting', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      
      render(
        <InvestmentSummaryEditor
          {...mockProps}
          initialValue=""
          onUpdate={onUpdate}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/Write your comprehensive investment summary/);
      await user.type(textarea, 'Test investment summary');
      
      expect(textarea).toHaveValue('Test investment summary');
    });

    it('applies bold formatting when button clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentSummaryEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/Write your comprehensive investment summary/);
      const boldButton = screen.getByText('B');
      
      await user.click(textarea);
      await user.click(boldButton);
      
      expect(textarea).toHaveValue('**bold text**');
    });

    it('shows character count and validation', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentSummaryEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/Write your comprehensive investment summary/);
      await user.type(textarea, 'Test content');
      
      expect(screen.getByText(/12\/10000/)).toBeInTheDocument();
    });

    it('handles template insertion', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentSummaryEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      const templatesButton = screen.getByText('📄 Templates');
      await user.click(templatesButton);
      
      // Should show template options
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });
  });

  describe('InvestmentBlurbEditor', () => {
    it('renders without crashing', () => {
      render(
        <InvestmentBlurbEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('Investment Blurb')).toBeInTheDocument();
    });

    it('enforces character limit', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentBlurbEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/Enter a compelling investment blurb/);
      const longText = 'a'.repeat(501);
      
      await user.type(textarea, longText);
      
      // Should not exceed 500 characters
      expect((textarea as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(500);
    });

    it('shows character count status', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentBlurbEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/Enter a compelling investment blurb/);
      await user.type(textarea, 'Test blurb');
      
      expect(screen.getByText(/9\/500/)).toBeInTheDocument();
    });

    it('provides writing tips', () => {
      render(
        <InvestmentBlurbEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('Writing Tips')).toBeInTheDocument();
      expect(screen.getByText(/Be specific/)).toBeInTheDocument();
    });

    it('handles keyboard shortcuts', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentBlurbEditor
          {...mockProps}
          initialValue=""
          onUpdate={jest.fn()}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/Enter a compelling investment blurb/);
      await user.click(textarea);
      
      // Test Ctrl+B for bold
      await user.keyboard('{Control>}b{/Control}');
      expect(textarea).toHaveValue('**bold text**');
    });
  });

  describe('KeyInfoManager', () => {
    it('renders without crashing', () => {
      render(
        <KeyInfoManager
          {...mockProps}
          keyInfo={[]}
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('Key Info')).toBeInTheDocument();
      expect(screen.getByText('+ Add Key Info')).toBeInTheDocument();
    });

    it('shows empty state when no key info items', () => {
      render(
        <KeyInfoManager
          {...mockProps}
          keyInfo={[]}
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('No key info items yet')).toBeInTheDocument();
      expect(screen.getByText('Add Your First Key Info Item')).toBeInTheDocument();
    });

    it('displays key info items when provided', () => {
      const keyInfo = [
        {
          id: '1',
          name: 'Financial Report',
          link: 'https://example.com/report.pdf',
          order: 0
        }
      ];

      render(
        <KeyInfoManager
          {...mockProps}
          keyInfo={keyInfo}
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('Financial Report')).toBeInTheDocument();
      expect(screen.getByText('https://example.com/report.pdf')).toBeInTheDocument();
    });

    it('allows adding new key info items', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      
      render(
        <KeyInfoManager
          {...mockProps}
          keyInfo={[]}
          onUpdate={onUpdate}
        />
      );
      
      const addButton = screen.getByText('+ Add Key Info');
      await user.click(addButton);
      
      // Should show form fields
      expect(screen.getByPlaceholderText('Enter info name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter info link')).toBeInTheDocument();
    });

    it('validates URL format', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      
      render(
        <KeyInfoManager
          {...mockProps}
          keyInfo={[]}
          onUpdate={onUpdate}
        />
      );
      
      const addButton = screen.getByText('+ Add Key Info');
      await user.click(addButton);
      
      const nameInput = screen.getByPlaceholderText('Enter info name');
      const linkInput = screen.getByPlaceholderText('Enter info link');
      const saveButton = screen.getByText('Save');
      
      await user.type(nameInput, 'Test Info');
      await user.type(linkInput, 'invalid-url');
      await user.click(saveButton);
      
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('allows editing existing items', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      const keyInfo = [
        {
          id: '1',
          name: 'Financial Report',
          link: 'https://example.com/report.pdf',
          order: 0
        }
      ];

      render(
        <KeyInfoManager
          {...mockProps}
          keyInfo={keyInfo}
          onUpdate={onUpdate}
        />
      );
      
      const editButton = screen.getByText('Edit');
      await user.click(editButton);
      
      expect(screen.getByDisplayValue('Financial Report')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/report.pdf')).toBeInTheDocument();
    });

    it('allows deleting items with confirmation', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      const keyInfo = [
        {
          id: '1',
          name: 'Financial Report',
          link: 'https://example.com/report.pdf',
          order: 0
        }
      ];

      render(
        <KeyInfoManager
          {...mockProps}
          keyInfo={keyInfo}
          onUpdate={onUpdate}
        />
      );
      
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);
      
      expect(screen.getByText('Are you sure you want to delete this key info item?')).toBeInTheDocument();
      
      const confirmButton = screen.getByText('Delete');
      await user.click(confirmButton);
      
      expect(onUpdate).toHaveBeenCalledWith([]);
    });
  });

  describe('ExternalLinksManager', () => {
    it('renders without crashing', () => {
      render(
        <ExternalLinksManager
          {...mockProps}
          externalLinks={[]}
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('External Links')).toBeInTheDocument();
      expect(screen.getByText('+ Add External Link')).toBeInTheDocument();
    });

    it('shows empty state when no external links', () => {
      render(
        <ExternalLinksManager
          {...mockProps}
          externalLinks={[]}
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('No external links yet')).toBeInTheDocument();
      expect(screen.getByText('Add Your First External Link')).toBeInTheDocument();
    });

    it('displays external links when provided', () => {
      const externalLinks = [
        {
          id: '1',
          name: 'Company Website',
          url: 'https://example.com',
          order: 0
        }
      ];

      render(
        <ExternalLinksManager
          {...mockProps}
          externalLinks={externalLinks}
          onUpdate={jest.fn()}
        />
      );
      
      expect(screen.getByText('Company Website')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });

    it('validates URL format for external links', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      
      render(
        <ExternalLinksManager
          {...mockProps}
          externalLinks={[]}
          onUpdate={onUpdate}
        />
      );
      
      const addButton = screen.getByText('+ Add External Link');
      await user.click(addButton);
      
      const nameInput = screen.getByPlaceholderText('Enter link name');
      const urlInput = screen.getByPlaceholderText('Enter URL');
      const saveButton = screen.getByText('Save');
      
      await user.type(nameInput, 'Test Link');
      await user.type(urlInput, 'not-a-url');
      await user.click(saveButton);
      
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('supports drag and drop reordering', async () => {
      const onUpdate = jest.fn();
      const externalLinks = [
        { id: '1', name: 'Link 1', url: 'https://example1.com', order: 0 },
        { id: '2', name: 'Link 2', url: 'https://example2.com', order: 1 }
      ];

      render(
        <ExternalLinksManager
          {...mockProps}
          externalLinks={externalLinks}
          onUpdate={onUpdate}
        />
      );
      
      // Should show drag handles
      expect(screen.getAllByText('⋮⋮')).toHaveLength(2);
    });
  });

  describe('ShowcasePhotoManager', () => {
    it('renders without crashing', () => {
      render(
        <ShowcasePhotoManager
          projectId="test-project"
          onPhotoUpdated={jest.fn()}
        />
      );
      
      expect(screen.getByText('Showcase Photo')).toBeInTheDocument();
    });

    it('handles image upload', async () => {
      const user = userEvent.setup();
      const onPhotoUpdated = jest.fn();
      
      render(
        <ShowcasePhotoManager
          projectId="test-project"
          onPhotoUpdated={onPhotoUpdated}
        />
      );
      
      const uploadButton = screen.getByText('Upload Image');
      await user.click(uploadButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/projects/test-project/deal-room/showcase-photo',
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    it('handles image deletion', async () => {
      const user = userEvent.setup();
      const onPhotoUpdated = jest.fn();
      const showcasePhoto = {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        uploadedAt: new Date().toISOString()
      };
      
      render(
        <ShowcasePhotoManager
          projectId="test-project"
          showcasePhoto={showcasePhoto}
          onPhotoUpdated={onPhotoUpdated}
        />
      );
      
      const deleteButton = screen.getByText('Delete Image');
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/projects/test-project/deal-room/showcase-photo',
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });

    it('shows current image when provided', () => {
      const showcasePhoto = {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        uploadedAt: new Date().toISOString()
      };
      
      render(
        <ShowcasePhotoManager
          projectId="test-project"
          showcasePhoto={showcasePhoto}
          onPhotoUpdated={jest.fn()}
        />
      );
      
      expect(screen.getByText('Delete Image')).toBeInTheDocument();
    });
  });

  describe('DealRoomPreview', () => {
    it('renders without crashing', () => {
      render(
        <DealRoomPreview
          projectId="test-project"
          onClose={jest.fn()}
        />
      );
      
      expect(screen.getByText('Deal Room Preview')).toBeInTheDocument();
    });

    it('fetches and displays deal room data', async () => {
      const mockDealRoomData = {
        id: 'dr-1',
        projectId: 'test-project',
        investmentBlurb: 'Test blurb',
        investmentSummary: 'Test summary',
        keyInfo: [],
        externalLinks: []
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockDealRoomData })
      });

      render(
        <DealRoomPreview
          projectId="test-project"
          onClose={jest.fn()}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test blurb')).toBeInTheDocument();
        expect(screen.getByText('Test summary')).toBeInTheDocument();
      });
    });

    it('handles close action', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(
        <DealRoomPreview
          projectId="test-project"
          onClose={onClose}
        />
      );
      
      const closeButton = screen.getByText('×');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('shows loading state', () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(
        <DealRoomPreview
          projectId="test-project"
          onClose={jest.fn()}
        />
      );
      
      expect(screen.getByText('Loading preview...')).toBeInTheDocument();
    });

    it('handles error state', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

      render(
        <DealRoomPreview
          projectId="test-project"
          onClose={jest.fn()}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading preview/)).toBeInTheDocument();
      });
    });

    it('supports auto-refresh when enabled', async () => {
      jest.useFakeTimers();
      
      render(
        <DealRoomPreview
          projectId="test-project"
          onClose={jest.fn()}
          autoRefresh={true}
        />
      );
      
      // Fast-forward time to trigger auto-refresh
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + auto-refresh
      
      jest.useRealTimers();
    });
  });
});