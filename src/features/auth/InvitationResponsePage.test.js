import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvitationResponsePage from './InvitationResponsePage';
import * as api from '../../shared/api';

// Mock the API module
jest.mock('../../shared/api');

const mockInvitation = {
  id: 'inv123',
  inviteeName: 'John Doe',
  inviteeEmail: 'john@example.com',
  pantryId: 'ABC12345'
};

const mockPantryDetails = {
  pantryId: 'ABC12345',
  pantryName: 'My Kitchen',
  pantryType: 'Household'
};

const mockCurrentUser = {
  id: 'user123',
  name: 'John Doe',
  email: 'john@example.com'
};

const mockOnAccept = jest.fn();
const mockOnDecline = jest.fn();

describe('InvitationResponsePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.acceptInvitation.mockResolvedValue({
      pantryDetails: mockPantryDetails
    });
    api.declineInvitation.mockResolvedValue({ message: 'Success' });
  });

  test('renders invitation response page', () => {
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    expect(screen.getByText("🎉 You're Invited!")).toBeInTheDocument();
    expect(screen.getByText("Someone wants you to join their Smart Pantry")).toBeInTheDocument();
    expect(screen.getByText('My Kitchen', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('Household')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('🎉 Join Pantry')).toBeInTheDocument();
    expect(screen.getByText('❌ Decline')).toBeInTheDocument();
  });

  test('displays pantry type badge correctly', () => {
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    const badge = screen.getByText('Household');
    expect(badge).toHaveClass('pantry-type-badge', 'household');
  });

  test('displays hotel pantry type badge correctly', () => {
    const hotelPantryDetails = { ...mockPantryDetails, pantryType: 'Hotel' };
    
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={hotelPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    const badge = screen.getByText('Hotel');
    expect(badge).toHaveClass('pantry-type-badge', 'hotel');
  });

  test('displays benefits list', () => {
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    expect(screen.getByText("What you'll be able to do:")).toBeInTheDocument();
    expect(screen.getByText(/Track pantry items and expiration dates/)).toBeInTheDocument();
    expect(screen.getByText(/Create and share shopping lists/)).toBeInTheDocument();
    expect(screen.getByText(/Discover recipes based on available ingredients/)).toBeInTheDocument();
    expect(screen.getByText(/Collaborate with family or team members/)).toBeInTheDocument();
    expect(screen.getByText(/Set and track caloric goals/)).toBeInTheDocument();
    expect(screen.getByText(/Monitor your nutrition and health goals/)).toBeInTheDocument();
  });

  test('handles accept invitation successfully', async () => {
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    const acceptButton = screen.getByText('🎉 Join Pantry');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(api.acceptInvitation).toHaveBeenCalledWith({
        invitationId: 'inv123',
        userId: 'user123',
        userEmail: 'john@example.com',
        userName: 'John Doe'
      });
    });
    
    await waitFor(() => {
      expect(mockOnAccept).toHaveBeenCalledWith(mockPantryDetails);
    });
  });

  test('handles decline invitation successfully', async () => {
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    const declineButton = screen.getByText('❌ Decline');
    fireEvent.click(declineButton);
    
    await waitFor(() => {
      expect(api.declineInvitation).toHaveBeenCalledWith({
        invitationId: 'inv123'
      });
    });
    
    await waitFor(() => {
      expect(mockOnDecline).toHaveBeenCalled();
    });
  });

  test('shows error when accept invitation fails', async () => {
    api.acceptInvitation.mockRejectedValue(new Error('API Error'));
    
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    const acceptButton = screen.getByText('🎉 Join Pantry');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to accept invitation. Please try again.')).toBeInTheDocument();
    });
    
    expect(mockOnAccept).not.toHaveBeenCalled();
  });

  test('shows error when decline invitation fails', async () => {
    api.declineInvitation.mockRejectedValue(new Error('API Error'));
    
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    const declineButton = screen.getByText('❌ Decline');
    fireEvent.click(declineButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to decline invitation. Please try again.')).toBeInTheDocument();
    });
    
    expect(mockOnDecline).not.toHaveBeenCalled();
  });

  test('disables buttons during processing', async () => {
    api.acceptInvitation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    const acceptButton = screen.getByText('🎉 Join Pantry');
    const declineButton = screen.getByText('❌ Decline');
    
    fireEvent.click(acceptButton);
    
    expect(acceptButton).toHaveTextContent('Joining...');
    expect(acceptButton).toBeDisabled();
    expect(declineButton).toHaveTextContent('Processing...');
    expect(declineButton).toBeDisabled();
  });

  test('displays invitation note', () => {
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    expect(screen.getByText(/By accepting, you'll be added to this pantry/)).toBeInTheDocument();
    expect(screen.getByText(/You can always leave later if needed/)).toBeInTheDocument();
  });

  test('displays correct invitee name in message', () => {
    const customInvitation = { ...mockInvitation, inviteeName: 'Jane Smith' };
    
    render(
      <InvitationResponsePage 
        invitation={customInvitation}
        pantryDetails={mockPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('displays correct pantry name in message', () => {
    const customPantryDetails = { ...mockPantryDetails, pantryName: 'Restaurant Kitchen' };
    
    render(
      <InvitationResponsePage 
        invitation={mockInvitation}
        pantryDetails={customPantryDetails}
        currentUser={mockCurrentUser}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    );
    
    expect(screen.getByText('Restaurant Kitchen', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('Restaurant Kitchen', { selector: 'strong' })).toBeInTheDocument();
  });
}); 