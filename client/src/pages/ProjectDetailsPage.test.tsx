import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProjectDetailsPage from './ProjectDetailsPage';

// Mock fetch
global.fetch = jest.fn();

// Mock alert
global.alert = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockProject = {
  id: '1',
  projectName: 'Test Project',
  legalProjectName: 'Test Project LLC',
  unitCalculationPrecision: 2,
  targetAmount: 1000000,
  currency: 'USD',
  timeframe: {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  commitments: {
    totalAmount: 500000,
    investorCount: 3
  },
  reservations: {
    totalAmount: 200000,
    investorCount: 2
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockProjectWithoutData = {
  ...mockProject,
  commitments: {
    totalAmount: 0,
    investorCount: 0
  },
  reservations: {
    totalAmount: 0,
    investorCount: 0
  }
};

const mockKPIs = {
  totalCommitments: 3,
  totalCommittedAmount: 500000,
  fundingPercentage: 50,
  daysRemaining: 180,
  currency: 'USD'
};

const renderWithRouter = (component: React.ReactElement, route = '/projects/1') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {component}
    </MemoryRouter>
  );
};

describe('ProjectDetailsPage Delete Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProject
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockKPIs
        })
      });
  });

  test('renders delete button', async () => {
    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  test('opens delete confirmation dialog when delete button is clicked', async () => {
    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    expect(screen.getByText('Delete Project')).toBeInTheDocument();
    expect(screen.getByText(/Do you want to delete this project/)).toBeInTheDocument();
  });

  test('shows warning message for projects with commitments and reservations', async () => {
    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    expect(screen.getByText(/⚠️ WARNING: This project has associated data/)).toBeInTheDocument();
    expect(screen.getByText(/3 commitments totaling \$500,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/2 reservations totaling \$200,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/permanently remove all associated commitment and reservation data/)).toBeInTheDocument();
  });

  test('does not show warning for projects without commitments and reservations', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProjectWithoutData
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockKPIs
        })
      });

    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    expect(screen.queryByText(/⚠️ WARNING/)).not.toBeInTheDocument();
    expect(screen.queryByText(/commitments totaling/)).not.toBeInTheDocument();
    expect(screen.queryByText(/reservations totaling/)).not.toBeInTheDocument();
  });

  test('closes dialog when cancel is clicked', async () => {
    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Delete Project')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
    });
  });

  test('successfully deletes project and navigates to projects list', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProject
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockKPIs
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          message: 'Project deleted successfully'
        })
      });

    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Delete Project'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/projects/1',
        { method: 'DELETE' }
      );
    });

    expect(global.alert).toHaveBeenCalledWith(
      'Project "Test Project" has been deleted successfully.'
    );
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  test('shows error message when deletion fails', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProject
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockKPIs
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: false,
          error: {
            message: 'Failed to delete project'
          }
        })
      });

    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Delete Project'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Failed to delete project: Failed to delete project'
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows loading state during deletion', async () => {
    let resolveDelete: (value: any) => void;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProject
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockKPIs
        })
      })
      .mockReturnValueOnce({
        json: () => deletePromise
      });

    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Delete Project'));

    // Should show loading state
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.getByText('Delete Project')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();

    // Resolve the promise
    resolveDelete!({
      success: true,
      message: 'Project deleted successfully'
    });

    await waitFor(() => {
      expect(screen.queryByText('Deleting...')).not.toBeInTheDocument();
    });
  });

  test('handles network errors gracefully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProject
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockKPIs
        })
      })
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Delete Project'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Failed to delete project: Network error'
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('prevents deletion actions when loading', async () => {
    let resolveDelete: (value: any) => void;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProject
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockKPIs
        })
      })
      .mockReturnValueOnce({
        json: () => deletePromise
      });

    renderWithRouter(<ProjectDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Delete Project'));

    // Try to click cancel while loading - should not work
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
    
    fireEvent.click(cancelButton);
    
    // Dialog should still be open
    expect(screen.getByText('Delete Project')).toBeInTheDocument();

    // Resolve the promise
    resolveDelete!({
      success: true,
      message: 'Project deleted successfully'
    });
  });
});