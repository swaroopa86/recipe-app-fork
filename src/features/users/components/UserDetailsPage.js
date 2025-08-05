import React, { useState, useEffect } from 'react';
import { fetchPantryDetails } from '../../../shared/api';
import './UserDetailsPage.css';

const UserDetailsPage = ({ currentUser }) => {
  const [pantryDetails, setPantryDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPantryDetails = async () => {
      if (currentUser?.id) {
        try {
          const details = await fetchPantryDetails(currentUser.id);
          setPantryDetails(details);
        } catch (error) {
          console.error('Error loading pantry details:', error);
          setPantryDetails(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadPantryDetails();
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <div className="user-details-container">
        <div className="user-details-card">
          <h2>User Not Found</h2>
          <p>Please log in to view your profile details.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="user-details-container">
      <div className="user-details-card">
        <div className="user-profile-header">
          <div className="user-avatar-section">
            <img 
              src={currentUser.picture} 
              alt={currentUser.name} 
              className="user-profile-avatar"
            />
            <div className="online-status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>
          
          <div className="user-info-section">
            <h1 className="user-name">{currentUser.name}</h1>
            <p className="user-email">{currentUser.email}</p>
          </div>
        </div>

        <div className="user-details-content">
          <div className="details-section">
            <h3>Account Information</h3>
            <div className="detail-grid">
              
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{currentUser.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{currentUser.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Login Time</span>
                <span className="detail-value">{formatDate(currentUser.loginTime)}</span>
              </div>
              {pantryDetails && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Pantry Name</span>
                    <span className="detail-value">{pantryDetails.pantryName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pantry Type</span>
                    <span className="detail-value">
                      <span className={`pantry-type-badge ${pantryDetails.pantryType.toLowerCase()}`}>
                        {pantryDetails.pantryType}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="details-section">
            <h3>Account Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">🍳</span>
                <h4>Recipe Management</h4>
                <p>Create, save, and organize your favorite recipes</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🥫</span>
                <h4>Pantry Tracking</h4>
                <p>Keep track of ingredients in your kitchen</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🛒</span>
                <h4>Shopping Lists</h4>
                <p>Manage grocery shopping with smart lists</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">👥</span>
                <h4>Family Sharing</h4>
                <p>Share recipes and lists with family members</p>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Account Security</h3>
            <div className="security-info">
              <div className="security-item">
                <span className="security-icon">🔐</span>
                <div className="security-text">
                  <h4>Google OAuth</h4>
                  <p>Your account is secured with Google's authentication system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage; 