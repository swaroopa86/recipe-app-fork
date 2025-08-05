import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PantrySetupPage from './PantrySetupPage';

// Mock the API
jest.mock('../../shared/api', () => ({
  createPantryDetails: jest.fn(),
  generatePantryId: jest.fn()
}));

import { createPantryDetails, generatePantryId } from '../../shared/api';

describe('PantrySetupPage', () => {
  const mockCurrentUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    generatePantryId.mockResolvedValue({ pantryId: 'ABC12345' });
  });

  test('renders pantry setup form', () => {
    render(<PantrySetupPage currentUser={mockCurrentUser} onComplete={mockOnComplete} />);
    
    expect(screen.getByText('🍳 Welcome to Smart Pantry!')).toBeInTheDocument();
    expect(screen.getByText("Let's set up your pantry to get started")).toBeInTheDocument();
    expect(screen.getByText('Pantry Setup')).toBeInTheDocument();
    expect(screen.getByLabelText('Pantry Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Pantry Type')).toBeInTheDocument();
    expect(screen.getByText('Complete Setup')).toBeInTheDocument();
  });

  test('shows error when form is submitted with empty fields', async () => {
    render(<PantrySetupPage currentUser={mockCurrentUser} onComplete={mockOnComplete} />);
    
    const submitButton = screen.getByText('Complete Setup');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    createPantryDetails.mockResolvedValueOnce({});
    
    render(<PantrySetupPage currentUser={mockCurrentUser} onComplete={mockOnComplete} />);
    
    const pantryNameInput = screen.getByLabelText('Pantry Name');
    const pantryTypeSelect = screen.getByLabelText('Pantry Type');
    const submitButton = screen.getByText('Complete Setup');
    
    fireEvent.change(pantryNameInput, { target: { value: 'My Kitchen' } });
    fireEvent.change(pantryTypeSelect, { target: { value: 'Household' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(generatePantryId).toHaveBeenCalled();
      expect(createPantryDetails).toHaveBeenCalledWith({
        userId: 'test-user-id',
        pantryId: 'ABC12345',
        pantryName: 'My Kitchen',
        pantryType: 'Household'
      });
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  test('shows error when API call fails', async () => {
    createPantryDetails.mockRejectedValueOnce(new Error('API Error'));
    
    render(<PantrySetupPage currentUser={mockCurrentUser} onComplete={mockOnComplete} />);
    
    const pantryNameInput = screen.getByLabelText('Pantry Name');
    const pantryTypeSelect = screen.getByLabelText('Pantry Type');
    const submitButton = screen.getByText('Complete Setup');
    
    fireEvent.change(pantryNameInput, { target: { value: 'My Kitchen' } });
    fireEvent.change(pantryTypeSelect, { target: { value: 'Hotel' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save pantry details. Please try again.')).toBeInTheDocument();
    });
  });

  test('disables form during submission', async () => {
    createPantryDetails.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<PantrySetupPage currentUser={mockCurrentUser} onComplete={mockOnComplete} />);
    
    const pantryNameInput = screen.getByLabelText('Pantry Name');
    const pantryTypeSelect = screen.getByLabelText('Pantry Type');
    const submitButton = screen.getByText('Complete Setup');
    
    fireEvent.change(pantryNameInput, { target: { value: 'My Kitchen' } });
    fireEvent.change(pantryTypeSelect, { target: { value: 'Household' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Setting up...');
    expect(pantryNameInput).toBeDisabled();
    expect(pantryTypeSelect).toBeDisabled();
  });

  test('displays pantry type options', () => {
    render(<PantrySetupPage currentUser={mockCurrentUser} onComplete={mockOnComplete} />);
    
    const pantryTypeSelect = screen.getByLabelText('Pantry Type');
    const options = pantryTypeSelect.querySelectorAll('option');
    
    expect(options).toHaveLength(3); // Including the default "Select pantry type" option
    expect(options[1]).toHaveValue('Household');
    expect(options[2]).toHaveValue('Hotel');
  });

  test('generates pantry ID during form submission', async () => {
    createPantryDetails.mockResolvedValueOnce({});
    
    render(<PantrySetupPage currentUser={mockCurrentUser} onComplete={mockOnComplete} />);
    
    const pantryNameInput = screen.getByLabelText('Pantry Name');
    const pantryTypeSelect = screen.getByLabelText('Pantry Type');
    const submitButton = screen.getByText('Complete Setup');
    
    fireEvent.change(pantryNameInput, { target: { value: 'My Kitchen' } });
    fireEvent.change(pantryTypeSelect, { target: { value: 'Household' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(generatePantryId).toHaveBeenCalledTimes(1);
      expect(createPantryDetails).toHaveBeenCalledWith({
        userId: 'test-user-id',
        pantryId: 'ABC12345',
        pantryName: 'My Kitchen',
        pantryType: 'Household'
      });
    });
  });
}); 