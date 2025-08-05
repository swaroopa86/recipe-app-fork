import React, { useEffect } from 'react';
import './RecipeModal.css';
import { convertUnits, areUnitsCompatible } from '../../../utils/unitConversion';

const RecipeModal = ({ recipe, isOpen, onClose, pantryItems = [] }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !recipe) {
    return null;
  }

  return (
    <div className="recipe-modal-backdrop" onClick={handleBackdropClick}>
      <div className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-title">
        <div className="recipe-modal-header">
          <h2 id="recipe-title" className="recipe-modal-title">{recipe.name}</h2>
          <button 
            className="recipe-modal-close"
            onClick={onClose}
            aria-label="Close recipe details"
          >
            ×
          </button>
        </div>
        
        <div className="recipe-modal-content">
          <div className="recipe-section">
            <h3>Cooking Time</h3>
            <p className="cooking-time">
              {recipe.cookingTime && recipe.cookingTime.quantity && recipe.cookingTime.unit
                ? `${recipe.cookingTime.quantity} ${recipe.cookingTime.unit}`
                : (typeof recipe.cookingTime === 'string' ? recipe.cookingTime : '')
              }
            </p>
          </div>

          <div className="recipe-section">
            <h3>Ingredients</h3>
            <ul className="ingredients-list">
              {recipe.ingredients?.map((ingredient, index) => {
                // Check ingredient availability in pantry
                const checkIngredientAvailability = () => {
                  const ingredientName = typeof ingredient === 'string' 
                    ? ingredient 
                    : ingredient.name || ingredient;
                  
                  const requiredQuantity = typeof ingredient === 'object' 
                    ? parseFloat(ingredient.quantity) || 1 
                    : 1;
                  
                  const requiredUnit = typeof ingredient === 'object' 
                    ? ingredient.unit || 'piece' 
                    : 'piece';

                  // Find matching pantry item
                  const pantryItem = pantryItems.find(item => {
                    const pantryName = item.name.toLowerCase().trim();
                    const recipeIngredientName = ingredientName.toLowerCase().trim();
                    return pantryName.includes(recipeIngredientName) || 
                           recipeIngredientName.includes(pantryName);
                  });

                  if (!pantryItem) {
                    return { available: false, status: 'missing' };
                  }

                  // Check if we have enough quantity
                  let availableQuantity = parseFloat(pantryItem.quantity) || 0;
                  
                  // Try to convert units if they don't match
                  if (pantryItem.unit !== requiredUnit) {
                    if (areUnitsCompatible(requiredUnit, pantryItem.unit)) {
                      try {
                        availableQuantity = convertUnits(
                          pantryItem.quantity,
                          pantryItem.unit,
                          requiredUnit,
                          ingredientName
                        );
                      } catch (error) {
                        // If conversion fails, assume insufficient
                        return { available: false, status: 'insufficient' };
                      }
                    } else {
                      // Units not compatible, assume insufficient
                      return { available: false, status: 'insufficient' };
                    }
                  }

                  if (availableQuantity >= requiredQuantity) {
                    return { available: true, status: 'available' };
                  } else {
                    return { available: false, status: 'insufficient' };
                  }
                };

                const availability = checkIngredientAvailability();
                const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
                const quantity = typeof ingredient === 'object' ? ingredient.quantity : 1;
                const unit = typeof ingredient === 'object' ? ingredient.unit : 'piece';

                return (
                  <li key={index} className={`ingredient-item ${availability.status}`}>
                    <span className="ingredient-availability-icon">
                      {availability.status === 'available' && '✅'}
                      {availability.status === 'insufficient' && '⚠️'}
                      {availability.status === 'missing' && '❌'}
                    </span>
                    <span className="ingredient-quantity">
                      {quantity} {unit}
                    </span>
                    <span className="ingredient-name">{ingredientName}</span>
                  </li>
                );
              })}
            </ul>
            <div className="ingredient-legend">
              <div className="legend-item">
                <span className="legend-icon">✅</span>
                <span className="legend-text">Available in pantry</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon">⚠️</span>
                <span className="legend-text">Insufficient quantity</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon">❌</span>
                <span className="legend-text">Not in pantry</span>
              </div>
            </div>
          </div>

          <div className="recipe-section">
            <h3>Method</h3>
            <div className="method-content">
              {recipe.method?.split('\n').map((step, index) => (
                <p key={index} className="method-step">
                  {step}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="recipe-modal-footer">
          <button className="recipe-modal-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
