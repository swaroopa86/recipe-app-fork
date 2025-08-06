import React, { useState } from 'react';
import { acceptInvitation, declineInvitation } from '../../shared/api';
import './InvitationResponsePage.css';

const InvitationResponsePage = ({ invitation, pantryDetails, currentUser, onAccept, onDecline }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await acceptInvitation({
        invitationId: invitation.id,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name
      });

      onAccept(response.pantryDetails);
    } catch (err) {
      setError('Failed to accept invitation. Please try again.');
      console.error('Error accepting invitation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    setError('');

    try {
      await declineInvitation({
        invitationId: invitation.id
      });

      onDecline();
    } catch (err) {
      setError('Failed to decline invitation. Please try again.');
      console.error('Error declining invitation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="invitation-response-container">
      <div className="invitation-response-card">
        <div className="invitation-response-header">
          <h2>🎉 You're Invited!</h2>
          <p>Someone wants you to join their Smart Pantry</p>
        </div>

        <div className="invitation-response-content">
          <div className="invitation-details">
            <div className="pantry-info">
              <div className="pantry-icon">🥫</div>
              <div className="pantry-details">
                <h3>{pantryDetails.pantryName}</h3>
                <span className={`pantry-type-badge ${pantryDetails.pantryType.toLowerCase()}`}>
                  {pantryDetails.pantryType}
                </span>
              </div>
            </div>

            <div className="invitation-message">
              <p>
                You have been invited you to join the pantry 
                "<strong>{pantryDetails.pantryName}</strong>" on Smart Pantry.
              </p>
              
              <div className="benefits-list">
                <h4>What you'll be able to do:</h4>
                <ul>
                  <li>📝 Track pantry items and expiration dates</li>
                  <li>🛒 Create and share shopping lists</li>
                  <li>🍳 Discover recipes based on available ingredients</li>
                  <li>👥 Collaborate with family or team members</li>
                  <li>🔥 Set and track caloric goals</li>
                  <li>📊 Monitor your nutrition and health goals</li>
                </ul>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="invitation-actions">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="accept-btn"
            >
              {isProcessing ? 'Joining...' : '🎉 Join Pantry'}
            </button>
            
            <button
              onClick={handleDecline}
              disabled={isProcessing}
              className="decline-btn"
            >
              {isProcessing ? 'Processing...' : '❌ Decline'}
            </button>
          </div>

          <div className="invitation-note">
            <p>
              <small>
                By accepting, you'll be added to this pantry and can start collaborating immediately. 
                You can always leave later if needed.
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationResponsePage; 