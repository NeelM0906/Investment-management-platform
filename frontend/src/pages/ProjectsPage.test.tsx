import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProjectsPage from './ProjectsPage';

// Mock fetch
global.fetch = jest.fn();

// Mock alert
global.alert = jest.fn();

const mockProjects = [
  {
    id: '1',
    projectName: 'Test Project 1',
    legalProjectName: 'Test Project 1 LLC',
    unitCalculationPrecision: 2,
    targetAmount: 1000000,
    currency: 'USD',
    timeframe: {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    commitments: {
      totalAmount: 0,
      investorCount: 0
    },
    reservations: {
      totalAmount: 0,
      investorCount: 0
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    projectName: 'Test Project 2',
    legalProjectName: 'Test Project 2 LLC',
    unitCalculationPrecision: 2,
    targetAmount: 2000000,
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
  }
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProjectsPage Delete Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: mockProjects
      })
    });
  });

  test('renders delete buttons for each project', async () => {
    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getAllByTitle('Delete Project')).toHaveLength(2);
    });
  });

  test('opens delete confirmation dialog when delete button is clicked', async () => {
    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Project');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Project')).toBeInTheDocument();
    expect(screen.getByText(/Do you want to delete this project/)).toBeInTheDocument();
    expect(screen.getByText(/Test Project 1/)).toBeInTheDocument();
  });

  test('shows warning message for projects with commitments and reservations', async () => {
    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Project');
    fireEvent.click(deleteButtons[1]); // Click delete for project with commitments

    expect(screen.getByText(/⚠️ WARNING: This project has associated data/)).toBeInTheDocument();
    expect(screen.getByText(/3 commitments totaling \$500,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/2 reservations totaling \$200,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/permanently remove all associated commitment and reservation data/)).toBeInTheDocument();
  });

  test('does not show warning for projects without commitments and reservations', async () => {
    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Project');
    fireEvent.click(deleteButtons[0]); // Click delete for project without commitments

    expect(screen.queryByText(/⚠️ WARNING/)).not.toBeInTheDocument();
    expect(screen.queryByText(/commitments totaling/)).not.toBeInTheDocument();
    expect(screen.queryByText(/reservations totaling/)).not.toBeInTheDocument();
  });

  test('closes dialog when cancel is clicked', async () => {
    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Project');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Project')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
    });
  });

  test('successfully deletes project when confirmed', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProjects
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          message: 'Project deleted successfully'
        })
      });

    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Project');
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByText('Delete Project'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/projects/1',
        { method: 'DELETE' }
      );
    });

    expect(global.alert).toHaveBeenCalledWith(
      'Project "Test Project 1" has been deleted successfully.'
    );
  });

  test('shows error message when deletion fails', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockProjects
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

    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Project');
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByText('Delete Project'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Failed to delete project: Failed to delete project'
      );
    });
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
          data: mockProjects
        })
      })
      .mockReturnValueOnce({
        json: () => deletePromise
      });

    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Project');
    fireEvent.click(deleteButtons[0]);

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
          data: mockProjects
        })
      })
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Project');
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByText('Delete Project'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Failed to delete project: Network error'
      );
    });
  });
});