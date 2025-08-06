import React, { useState } from 'react';
import { sendInvitation } from '../../shared/api';
import './InviteOthersPage.css';

const InviteOthersPage = ({ onComplete, pantryDetails }) => {
  const [invitations, setInvitations] = useState([{ email: '', name: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addInvitation = () => {
    setInvitations([...invitations, { email: '', name: '' }]);
  };

  const removeInvitation = (index) => {
    if (invitations.length > 1) {
      const newInvitations = invitations.filter((_, i) => i !== index);
      setInvitations(newInvitations);
    }
  };

  const updateInvitation = (index, field, value) => {
    const newInvitations = [...invitations];
    newInvitations[index][field] = value;
    setInvitations(newInvitations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Filter out empty invitations
      const validInvitations = invitations.filter(inv => inv.email.trim() && inv.name.trim());
      
      if (validInvitations.length > 0) {
        const invitationData = {
          pantryId: pantryDetails.pantryId,
          pantryName: pantryDetails.pantryName,
          invitations: validInvitations
        };

        const response = await sendInvitation(invitationData);
        const successfulCount = response.successfulEmails || validInvitations.length;
        const failedCount = response.failedEmails || 0;
        
        if (failedCount > 0) {
          setSuccess(`Sent ${successfulCount} invitation(s) successfully. ${failedCount} invitation(s) failed to send.`);
        } else {
          setSuccess(`Successfully sent ${successfulCount} invitation(s)!`);
        }
        
        // Wait a moment to show success message before proceeding
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        // No valid invitations, just proceed
        onComplete();
      }
    } catch (err) {
      setError('Failed to send invitations. Please try again.');
      console.error('Error sending invitations:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="invite-others-container">
      <div className="invite-others-card">
        <div className="invite-others-header">
          <h2>Invite Others to Your Pantry</h2>
          <p>Share your pantry "{pantryDetails?.pantryName}" with family, friends, or team members</p>
        </div>

        <div className="invite-others-content">
          <div className="invite-illustration">
            <div className="invite-icons">
              <span className="invite-icon">👥</span>
              <span className="invite-icon">📧</span>
              <span className="invite-icon">🥫</span>
            </div>
          </div>

          <form className="invite-others-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Invite people to join your pantry:</label>
              
              {invitations.map((invitation, index) => (
                <div key={index} className="invitation-row">
                  <div className="invitation-inputs">
                    <input
                      type="text"
                      placeholder="Name"
                      value={invitation.name}
                      onChange={(e) => updateInvitation(index, 'name', e.target.value)}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={invitation.email}
                      onChange={(e) => updateInvitation(index, 'email', e.target.value)}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>
                  {invitations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInvitation(index)}
                      className="remove-invitation-btn"
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addInvitation}
                className="add-invitation-btn"
                disabled={isSubmitting}
              >
                + Add Another Person
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="invite-actions">
              <button
                type="submit"
                className="send-invitations-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Invitations...' : 'Send Invitations'}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                className="skip-btn"
                disabled={isSubmitting}
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>

        <div className="invite-features">
          <div className="feature">
            <span className="feature-icon">🔐</span>
            <div>
              <h4>Secure Access</h4>
              <p>Invitees get secure access to your pantry</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">👥</span>
            <div>
              <h4>Collaborative</h4>
              <p>Everyone can contribute to shopping lists</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <div>
              <h4>Easy Setup</h4>
              <p>Simple email invitation process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteOthersPage; 