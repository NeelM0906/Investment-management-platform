import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomClassManager from './CustomClassManager';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('CustomClassManager', () => {
  const mockOnClose = jest.fn();
  const mockOnClassCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  const renderComponent = (isOpen = true) => {
    return render(
      <CustomClassManager
        isOpen={isOpen}
        onClose={mockOnClose}
        onClassCreated={mockOnClassCreated}
      />
    );
  };

  it('should not render when isOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Manage Custom Unit Classes')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    renderComponent();
    
    expect(screen.getByText('Manage Custom Unit Classes')).toBeInTheDocument();
    expect(screen.getByText('Create New Custom Class')).toBeInTheDocument();
    expect(screen.getByText('Existing Custom Classes')).toBeInTheDocument();
  });

  it('should fetch custom classes on open', async () => {
    const mockClasses = [
      { id: '1', name: 'Class B', createdAt: new Date() },
      { id: '2', name: 'Premium Class', createdAt: new Date() }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockClasses }),
    } as Response);

    renderComponent();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/custom-unit-classes');
    });

    await waitFor(() => {
      expect(screen.getByText('Class B')).toBeInTheDocument();
      expect(screen.getByText('Premium Class')).toBeInTheDocument();
    });
  });

  it('should validate custom class name input', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    renderComponent();
    
    const input = screen.getByPlaceholderText(/Enter custom class name/);
    
    // Test empty input
    await userEvent.type(input, 'a');
    await userEvent.clear(input);
    expect(screen.getByText('Class name is required')).toBeInTheDocument();

    // Test too short
    await userEvent.type(input, 'a');
    expect(screen.getByText('Class name must be at least 2 characters long')).toBeInTheDocument();

    // Test invalid characters
    await userEvent.clear(input);
    await userEvent.type(input, 'Class@#$');
    expect(screen.getByText('Class name can only contain letters, numbers, spaces, hyphens, and underscores')).toBeInTheDocument();

    // Test valid input
    await userEvent.clear(input);
    await userEvent.type(input, 'Class B');
    expect(screen.queryByText(/Class name/)).not.toBeInTheDocument();
  });

  it('should create a new custom class successfully', async () => {
    const newClass = { id: '3', name: 'Class C', createdAt: new Date() };

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    // Mock create request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: newClass }),
    } as Response);

    renderComponent();

    const input = screen.getByPlaceholderText(/Enter custom class name/);
    const createButton = screen.getByText('Create Class');

    await userEvent.type(input, 'Class C');
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/custom-unit-classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Class C' }),
      });
    });

    await waitFor(() => {
      expect(mockOnClassCreated).toHaveBeenCalledWith('Class C');
    });

    expect(screen.getByText('Custom class "Class C" created successfully!')).toBeInTheDocument();
  });

  it('should handle create class error', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    // Mock create request error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Class name already exists' } }),
    } as Response);

    renderComponent();

    const input = screen.getByPlaceholderText(/Enter custom class name/);
    const createButton = screen.getByText('Create Class');

    await userEvent.type(input, 'Duplicate Class');
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Class name already exists')).toBeInTheDocument();
    });
  });

  it('should allow using existing custom class', async () => {
    const mockClasses = [
      { id: '1', name: 'Class B', createdAt: new Date() }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockClasses }),
    } as Response);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Class B')).toBeInTheDocument();
    });

    const useButton = screen.getByText('Use This Class');
    await userEvent.click(useButton);

    expect(mockOnClassCreated).toHaveBeenCalledWith('Class B');
  });

  it('should allow deleting custom class', async () => {
    const mockClasses = [
      { id: '1', name: 'Class B', createdAt: new Date() }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockClasses }),
    } as Response);

    // Mock delete request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Class B')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    await userEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete the custom class "Class B"? This action cannot be undone.'
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/custom-unit-classes/1', {
        method: 'DELETE',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Custom class "Class B" deleted successfully.')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    renderComponent();

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show empty state when no custom classes exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No custom classes created yet. Create your first custom class above.')).toBeInTheDocument();
    });
  });

  it('should show loading state', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    renderComponent();

    expect(screen.getByText('Loading custom classes...')).toBeInTheDocument();
  });

  it('should dismiss success and error messages', async () => {
    const newClass = { id: '3', name: 'Class C', createdAt: new Date() };

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    // Mock create request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: newClass }),
    } as Response);

    renderComponent();

    const input = screen.getByPlaceholderText(/Enter custom class name/);
    const createButton = screen.getByText('Create Class');

    await userEvent.type(input, 'Class C');
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Custom class "Class C" created successfully!')).toBeInTheDocument();
    });

    const dismissButton = screen.getByText('Dismiss');
    await userEvent.click(dismissButton);

    expect(screen.queryByText('Custom class "Class C" created successfully!')).not.toBeInTheDocument();
  });
});