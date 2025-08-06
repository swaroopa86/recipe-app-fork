import React, { useState } from 'react';
import { createPantryDetails, generatePantryId } from '../../shared/api';
import './PantrySetupPage.css';

function PantrySetupPage({ currentUser, onComplete }) {
  const [pantryName, setPantryName] = useState('');
  const [pantryType, setPantryType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pantryName.trim() || !pantryType) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Generate unique pantry ID before saving
      const response = await generatePantryId();
      const generatedPantryId = response.pantryId;
      
      await createPantryDetails({
        userId: currentUser.id,
        pantryId: generatedPantryId,
        pantryName: pantryName.trim(),
        pantryType
      });
      onComplete();
    } catch (err) {
      setError('Failed to save pantry details. Please try again.');
      console.error('Error saving pantry details:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pantry-setup-container">
      <div className="pantry-setup-card">
        <div className="pantry-setup-header">
          <h1>🍳 Welcome to Smart Pantry!</h1>
          <p>Let's set up your pantry to get started</p>
        </div>
        
        <div className="pantry-setup-content">
          <div className="setup-illustration">
            <div className="pantry-icons">
              <span className="icon">🥫</span>
              <span className="icon">🧂</span>
              <span className="icon">🥜</span>
              <span className="icon">🍯</span>
            </div>
          </div>
          
          <form className="pantry-setup-form" onSubmit={handleSubmit}>
            <h2>Pantry Setup</h2>
            <p>Tell us about your pantry to personalize your experience</p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            

            
            <div className="form-group">
              <label htmlFor="pantryName">Pantry Name</label>
              <input
                type="text"
                id="pantryName"
                value={pantryName}
                onChange={(e) => setPantryName(e.target.value)}
                placeholder="e.g., My Kitchen, Home Pantry, Restaurant Storage"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="pantryType">Pantry Type</label>
              <select
                id="pantryType"
                value={pantryType}
                onChange={(e) => setPantryType(e.target.value)}
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="">Select pantry type</option>
                <option value="Household">Household</option>
                <option value="Hotel">Hotel</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </button>
          </form>
          
          <div className="setup-features">
            <div className="feature">
              <span className="feature-icon">📝</span>
              <span>Track ingredients efficiently</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🛒</span>
              <span>Smart shopping lists</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🍽️</span>
              <span>Recipe recommendations</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Usage analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PantrySetupPage; 