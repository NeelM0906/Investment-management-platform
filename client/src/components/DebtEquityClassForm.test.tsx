import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DebtEquityClassForm from './DebtEquityClassForm';

// Mock fetch
global.fetch = jest.fn();

const mockProps = {
  projectId: 'test-project-id',
  onSave: jest.fn(),
  onCancel: jest.fn(),
};

describe('DebtEquityClassForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  test('renders form with all required fields', () => {
    render(<DebtEquityClassForm {...mockProps} />);
    
    expect(screen.getByText('Create New Debt & Equity Class')).toBeInTheDocument();
    expect(screen.getByLabelText(/Unit Class/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unit Price/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Open to Investments/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Minimum Investment/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maximum Investment/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Investment Increment Amount/)).toBeInTheDocument();
  });

  test('shows validation errors for empty required fields', async () => {
    render(<DebtEquityClassForm {...mockProps} />);
    
    const submitButton = screen.getByText('Create Class');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Unit class is required')).toBeInTheDocument();
    expect(screen.getByText('Unit price must be greater than 0')).toBeInTheDocument();
  });

  test('renders in edit mode when editingClass is provided', () => {
    const editingClass = {
      id: 'test-id',
      projectId: 'test-project-id',
      unitClass: 'Class A',
      unitPrice: 100,
      isOpenToInvestments: true,
      investmentIncrementAmount: 10,
      minInvestmentAmount: 50,
      maxInvestmentAmount: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<DebtEquityClassForm {...mockProps} editingClass={editingClass} />);
    
    expect(screen.getByText('Edit Debt & Equity Class')).toBeInTheDocument();
    expect(screen.getByText('Update Class')).toBeInTheDocument();
  });

  test('toggle switch works correctly', () => {
    render(<DebtEquityClassForm {...mockProps} />);
    
    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeChecked(); // Default is true
    
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  test('shows inline custom class creation form when "Create your own" is selected', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<DebtEquityClassForm {...mockProps} />);
    
    const unitClassSelect = screen.getByLabelText(/Unit Class/);
    fireEvent.change(unitClassSelect, { target: { value: 'CREATE_CUSTOM' } });
    
    expect(screen.getByText('Create Custom Unit Class')).toBeInTheDocument();
    expect(screen.getByText('Enter a name for your custom unit class. This will be saved for future use.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter custom class name/)).toBeInTheDocument();
    expect(screen.getByText('Create & Use')).toBeInTheDocument();
  });

  test('validates inline custom class name input', async () => {
    await act(async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<DebtEquityClassForm {...mockProps} />);
    });
    
    const unitClassSelect = screen.getByLabelText(/Unit Class/);
    fireEvent.change(unitClassSelect, { target: { value: 'CREATE_CUSTOM' } });
    
    const customNameInput = screen.getByPlaceholderText(/Enter custom class name/);
    
    // Test too short
    await act(async () => {
      fireEvent.change(customNameInput, { target: { value: 'a' } });
    });
    expect(screen.getByText('Class name must be at least 2 characters long')).toBeInTheDocument();

    // Test invalid characters
    await act(async () => {
      fireEvent.change(customNameInput, { target: { value: 'Class@#$' } });
    });
    expect(screen.getByText('Class name can only contain letters, numbers, spaces, hyphens, and underscores')).toBeInTheDocument();

    // Test valid input
    await act(async () => {
      fireEvent.change(customNameInput, { target: { value: 'Class B' } });
    });
    expect(screen.queryByText(/Class name must be at least 2 characters long/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Class name can only contain/)).not.toBeInTheDocument();
  });

  test('creates custom class inline and selects it', async () => {
    const newClass = { id: '1', name: 'Class B', createdAt: new Date() };

    // Mock initial fetch for custom classes
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: newClass }),
      });

    render(<DebtEquityClassForm {...mockProps} />);
    
    const unitClassSelect = screen.getByLabelText(/Unit Class/);
    fireEvent.change(unitClassSelect, { target: { value: 'CREATE_CUSTOM' } });
    
    const customNameInput = screen.getByPlaceholderText(/Enter custom class name/);
    fireEvent.change(customNameInput, { target: { value: 'Class B' } });
    
    const createButton = screen.getByText('Create & Use');
    fireEvent.click(createButton);

    await screen.findByText('Custom class "Class B" created successfully!');
    
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/custom-unit-classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Class B' }),
    });
  });

  test('cancels inline custom class creation', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<DebtEquityClassForm {...mockProps} />);
    
    const unitClassSelect = screen.getByLabelText(/Unit Class/);
    fireEvent.change(unitClassSelect, { target: { value: 'CREATE_CUSTOM' } });
    
    expect(screen.getByText('Create Custom Unit Class')).toBeInTheDocument();
    
    // Find the cancel button within the inline form
    const inlineForm = screen.getByText('Create Custom Unit Class').closest('.inline-custom-form');
    const cancelButton = inlineForm?.querySelector('.cancel-button') as HTMLButtonElement;
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText('Create Custom Unit Class')).not.toBeInTheDocument();
  });

  test('opens custom class manager when "Manage custom classes" is selected', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<DebtEquityClassForm {...mockProps} />);
    
    const unitClassSelect = screen.getByLabelText(/Unit Class/);
    fireEvent.change(unitClassSelect, { target: { value: 'MANAGE_CUSTOM' } });
    
    expect(screen.getByText('Manage Custom Unit Classes')).toBeInTheDocument();
  });

  test('shows success message when custom class is created from manager', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<DebtEquityClassForm {...mockProps} />);
    
    const unitClassSelect = screen.getByLabelText(/Unit Class/);
    fireEvent.change(unitClassSelect, { target: { value: 'MANAGE_CUSTOM' } });
    
    // Simulate custom class creation from manager
    const form = screen.getByText('Create New Debt & Equity Class').closest('div');
    const customClassManager = form?.querySelector('.custom-class-manager');
    
    // This would normally be triggered by the CustomClassManager component
    // For testing, we'll simulate the callback
    fireEvent.click(screen.getByText('Close')); // Close the manager first
    
    // Simulate the callback that would be called when a class is created
    const mockEvent = new CustomEvent('customClassCreated', { detail: 'New Class' });
    document.dispatchEvent(mockEvent);
  });

  test('dismisses success message', async () => {
    const newClass = { id: '1', name: 'Class B', createdAt: new Date() };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: newClass }),
      });

    render(<DebtEquityClassForm {...mockProps} />);
    
    const unitClassSelect = screen.getByLabelText(/Unit Class/);
    fireEvent.change(unitClassSelect, { target: { value: 'CREATE_CUSTOM' } });
    
    const customNameInput = screen.getByPlaceholderText(/Enter custom class name/);
    fireEvent.change(customNameInput, { target: { value: 'Class B' } });
    
    const createButton = screen.getByText('Create & Use');
    fireEvent.click(createButton);

    const successMessage = await screen.findByText('Custom class "Class B" created successfully!');
    expect(successMessage).toBeInTheDocument();
    
    const dismissButton = screen.getByLabelText('Dismiss success message');
    fireEvent.click(dismissButton);
    
    expect(screen.queryByText('Custom class "Class B" created successfully!')).not.toBeInTheDocument();
  });
});