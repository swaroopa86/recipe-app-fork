import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InviteOthersPage from './InviteOthersPage';
import * as api from '../../shared/api';

// Mock the API module
jest.mock('../../shared/api');

const mockPantryDetails = {
  pantryId: 'ABC12345',
  pantryName: 'My Kitchen'
};

const mockOnComplete = jest.fn();

describe('InviteOthersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.sendInvitation.mockResolvedValue({ message: 'Success' });
  });

  test('renders invite others form', () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    expect(screen.getByText('Invite Others to Your Pantry')).toBeInTheDocument();
    expect(screen.getByText(`Share your pantry "My Kitchen" with family, friends, or team members`)).toBeInTheDocument();
    expect(screen.getByText('Invite people to join your pantry:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByText('+ Add Another Person')).toBeInTheDocument();
    expect(screen.getByText('Send Invitations')).toBeInTheDocument();
    expect(screen.getByText('Skip for Now')).toBeInTheDocument();
  });

  test('adds new invitation row when add button is clicked', () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    const addButton = screen.getByText('+ Add Another Person');
    fireEvent.click(addButton);
    
    const nameInputs = screen.getAllByPlaceholderText('Name');
    const emailInputs = screen.getAllByPlaceholderText('Email address');
    
    expect(nameInputs).toHaveLength(2);
    expect(emailInputs).toHaveLength(2);
  });

  test('removes invitation row when remove button is clicked', () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    // Add a second invitation
    const addButton = screen.getByText('+ Add Another Person');
    fireEvent.click(addButton);
    
    // Remove the second invitation
    const removeButtons = screen.getAllByText('✕');
    fireEvent.click(removeButtons[0]);
    
    const nameInputs = screen.getAllByPlaceholderText('Name');
    const emailInputs = screen.getAllByPlaceholderText('Email address');
    
    expect(nameInputs).toHaveLength(1);
    expect(emailInputs).toHaveLength(1);
  });

  test('cannot remove the last invitation row', () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    // Should not have remove button for single invitation
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  test('updates invitation fields correctly', () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email address');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    
    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
  });

  test('submits form with valid invitations', async () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email address');
    const submitButton = screen.getByText('Send Invitations');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.sendInvitation).toHaveBeenCalledWith({
        pantryId: 'ABC12345',
        pantryName: 'My Kitchen',
        invitations: [{ name: 'John Doe', email: 'john@example.com' }]
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully sent 1 invitation(s)!')).toBeInTheDocument();
    });
    
    // Should call onComplete after success message
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('submits form with multiple valid invitations', async () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    // Add second invitation
    const addButton = screen.getByText('+ Add Another Person');
    fireEvent.click(addButton);
    
    const nameInputs = screen.getAllByPlaceholderText('Name');
    const emailInputs = screen.getAllByPlaceholderText('Email address');
    
    fireEvent.change(nameInputs[0], { target: { value: 'John Doe' } });
    fireEvent.change(emailInputs[0], { target: { value: 'john@example.com' } });
    fireEvent.change(nameInputs[1], { target: { value: 'Jane Smith' } });
    fireEvent.change(emailInputs[1], { target: { value: 'jane@example.com' } });
    
    const submitButton = screen.getByText('Send Invitations');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.sendInvitation).toHaveBeenCalledWith({
        pantryId: 'ABC12345',
        pantryName: 'My Kitchen',
        invitations: [
          { name: 'John Doe', email: 'john@example.com' },
          { name: 'Jane Smith', email: 'jane@example.com' }
        ]
      });
    });
  });

  test('filters out empty invitations before submitting', async () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    // Add second invitation but leave it empty
    const addButton = screen.getByText('+ Add Another Person');
    fireEvent.click(addButton);
    
    const nameInputs = screen.getAllByPlaceholderText('Name');
    const emailInputs = screen.getAllByPlaceholderText('Email address');
    
    // Only fill the first invitation
    fireEvent.change(nameInputs[0], { target: { value: 'John Doe' } });
    fireEvent.change(emailInputs[0], { target: { value: 'john@example.com' } });
    
    const submitButton = screen.getByText('Send Invitations');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.sendInvitation).toHaveBeenCalledWith({
        pantryId: 'ABC12345',
        pantryName: 'My Kitchen',
        invitations: [{ name: 'John Doe', email: 'john@example.com' }]
      });
    });
  });

  test('proceeds without sending invitations when all fields are empty', async () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    const submitButton = screen.getByText('Send Invitations');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.sendInvitation).not.toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  test('shows error when API call fails', async () => {
    api.sendInvitation.mockRejectedValue(new Error('API Error'));
    
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email address');
    const submitButton = screen.getByText('Send Invitations');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to send invitations. Please try again.')).toBeInTheDocument();
    });
    
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  test('disables form during submission', async () => {
    api.sendInvitation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email address');
    const submitButton = screen.getByText('Send Invitations');
    const skipButton = screen.getByText('Skip for Now');
    const addButton = screen.getByText('+ Add Another Person');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toHaveTextContent('Sending Invitations...');
    expect(submitButton).toBeDisabled();
    expect(skipButton).toBeDisabled();
    expect(addButton).toBeDisabled();
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
  });

  test('calls onComplete when skip button is clicked', () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    const skipButton = screen.getByText('Skip for Now');
    fireEvent.click(skipButton);
    
    expect(mockOnComplete).toHaveBeenCalled();
    expect(api.sendInvitation).not.toHaveBeenCalled();
  });

  test('displays features section', () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={mockPantryDetails} />);
    
    expect(screen.getByText('Secure Access')).toBeInTheDocument();
    expect(screen.getByText('Invitees get secure access to your pantry')).toBeInTheDocument();
    
    expect(screen.getByText('Collaborative')).toBeInTheDocument();
    expect(screen.getByText('Everyone can contribute to shopping lists')).toBeInTheDocument();
    
    expect(screen.getByText('Easy Setup')).toBeInTheDocument();
    expect(screen.getByText('Simple email invitation process')).toBeInTheDocument();
  });

  test('handles missing pantry details gracefully', () => {
    render(<InviteOthersPage onComplete={mockOnComplete} pantryDetails={null} />);
    
    expect(screen.getByText('Share your pantry "" with family, friends, or team members')).toBeInTheDocument();
  });
}); 