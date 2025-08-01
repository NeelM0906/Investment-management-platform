import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DebtEquityClassesList from './DebtEquityClassesList';

// Mock fetch
global.fetch = jest.fn();

const mockProps = {
  projectId: 'test-project-id',
  onAddNew: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe('DebtEquityClassesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component with header', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DebtEquityClassesList {...mockProps} />);
    
    expect(screen.getByText('Debt & Equity Classes')).toBeInTheDocument();
    
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Add New Class')).toBeInTheDocument();
    });
  });

  test('shows empty state when no classes exist', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DebtEquityClassesList {...mockProps} />);
    
    // Wait for the component to finish loading
    await screen.findByText('No debt or equity classes available');
    
    expect(screen.getByText('No debt or equity classes available')).toBeInTheDocument();
    expect(screen.getByText('Add Your First Class')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<DebtEquityClassesList {...mockProps} />);
    
    expect(screen.getByText('Loading classes...')).toBeInTheDocument();
  });
});