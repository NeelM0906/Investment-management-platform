import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DealRoomPreview from './DealRoomPreview';

// Mock fetch
global.fetch = jest.fn();

const mockDealRoom = {
  id: '1',
  projectId: 'proj-1',
  showcasePhoto: {
    filename: 'test.jpg',
    originalName: 'Test Image',
    mimeType: 'image/jpeg',
    size: 1024,
    uploadedAt: '2024-01-01T00:00:00Z'
  },
  investmentBlurb: 'Great investment opportunity',
  investmentSummary: '<h3>Investment Details</h3><p>This is a great opportunity</p>',
  keyInfo: [
    { id: '1', name: 'Financial Model', link: 'https://example.com/model', order: 1 }
  ],
  externalLinks: [
    { id: '1', name: 'Market Research', url: 'https://example.com/research', order: 1 }
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockProject = {
  id: 'proj-1',
  projectName: 'Test Project',
  legalProjectName: 'Test Project LLC',
  targetAmount: 1000000,
  currency: 'USD',
  timeframe: {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  commitments: {
    totalAmount: 500000,
    investorCount: 10
  },
  reservations: {
    totalAmount: 100000,
    investorCount: 5
  }
};

const mockCompanyProfile = {
  id: '1',
  name: 'Test Company',
  email: 'info@testcompany.com',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  country: 'USA',
  zipCode: '12345',
  phoneNumber: '+1-555-123-4567'
};

const mockInvestorPortal = {
  id: '1',
  branding: {
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    accentColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif',
    logoUrl: '/test-logo.png'
  },
  welcomeMessage: {
    title: 'Welcome to Our Investment Portal',
    content: 'Discover exciting investment opportunities',
    showOnDashboard: true
  }
};

const mockDebtEquityClasses = [
  {
    id: '1',
    projectId: 'proj-1',
    unitClass: 'Class A Units',
    unitPrice: 100,
    isOpenToInvestments: true,
    investmentIncrementAmount: 1000,
    minInvestmentAmount: 10000,
    maxInvestmentAmount: 100000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockKpis = {
  totalCommitments: 10,
  totalCommittedAmount: 500000,
  fundingPercentage: 50,
  daysRemaining: 90,
  currency: 'USD'
};

describe('DealRoomPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(
      <DealRoomPreview 
        projectId="proj-1" 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Loading preview...')).toBeInTheDocument();
  });

  it('renders error state when data loading fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(
      <DealRoomPreview 
        projectId="proj-1" 
        onClose={jest.fn()} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Preview')).toBeInTheDocument();
    });
  });

  it('renders complete deal room preview with all data', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/investor-dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: {
              project: mockProject,
              dealRoom: mockDealRoom,
              companyProfile: mockCompanyProfile,
              investorPortal: mockInvestorPortal,
              debtEquityClasses: mockDebtEquityClasses,
              kpis: mockKpis
            }
          })
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <DealRoomPreview 
        projectId="proj-1" 
        onClose={jest.fn()} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test Project LLC')).toBeInTheDocument();
      expect(screen.getByText('Great investment opportunity')).toBeInTheDocument();
    });
  });

  it('switches between desktop and mobile view modes', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/investor-dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: {
              project: mockProject,
              dealRoom: mockDealRoom,
              companyProfile: mockCompanyProfile,
              investorPortal: mockInvestorPortal,
              debtEquityClasses: mockDebtEquityClasses,
              kpis: mockKpis
            }
          })
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <DealRoomPreview 
        projectId="proj-1" 
        onClose={jest.fn()} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    const mobileButton = screen.getByTitle('Mobile View');
    fireEvent.click(mobileButton);

    const previewContent = screen.getByTestId('preview-content');
    expect(previewContent).toHaveClass('mobile');
  });

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = jest.fn();
    
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/investor-dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: {
              project: mockProject,
              dealRoom: mockDealRoom,
              companyProfile: mockCompanyProfile,
              investorPortal: mockInvestorPortal,
              debtEquityClasses: mockDebtEquityClasses,
              kpis: mockKpis
            }
          })
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <DealRoomPreview 
        projectId="proj-1" 
        onClose={mockOnClose} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays debt/equity classes when available', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/investor-dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: {
              project: mockProject,
              dealRoom: mockDealRoom,
              companyProfile: mockCompanyProfile,
              investorPortal: mockInvestorPortal,
              debtEquityClasses: mockDebtEquityClasses,
              kpis: mockKpis
            }
          })
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <DealRoomPreview 
        projectId="proj-1" 
        onClose={jest.fn()} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('💼 Investment Classes')).toBeInTheDocument();
      expect(screen.getByText('Class A Units')).toBeInTheDocument();
    });
  });

  it('handles missing data gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/investor-dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: {
              project: mockProject,
              dealRoom: { ...mockDealRoom, showcasePhoto: undefined },
              companyProfile: null,
              investorPortal: null,
              debtEquityClasses: [],
              kpis: mockKpis
            }
          })
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <DealRoomPreview 
        projectId="proj-1" 
        onClose={jest.fn()} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('supports auto-refresh functionality', async () => {
    jest.useFakeTimers();
    
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/investor-dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: {
              project: mockProject,
              dealRoom: mockDealRoom,
              companyProfile: mockCompanyProfile,
              investorPortal: mockInvestorPortal,
              debtEquityClasses: mockDebtEquityClasses,
              kpis: mockKpis
            }
          })
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <DealRoomPreview 
        projectId="proj-1" 
        onClose={jest.fn()} 
        autoRefresh={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Clear the initial fetch call
    (global.fetch as jest.Mock).mockClear();

    // Fast-forward time by 5 seconds to trigger auto-refresh
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/investor-dashboard')
      );
    });

    jest.useRealTimers();
  });
});
