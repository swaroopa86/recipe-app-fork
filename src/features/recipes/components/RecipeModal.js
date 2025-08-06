import React, { useEffect, useState } from 'react';
import './RecipeModal.css';
import { convertUnits, areUnitsCompatible } from '../../../utils/unitConversion';
import { recordRecipeCooked, updatePantryItem } from '../../../shared/api';

const RecipeModal = ({ recipe, isOpen, onClose, pantryItems = [], currentUser, refreshPantryItems }) => {
  const [servings, setServings] = useState(1);
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

  const handleMarkAsCooked = async () => {
    try {
      const cookingRecord = {
        id: Date.now().toString(),
        recipeId: recipe.id,
        recipeName: recipe.name,
        cookedAt: new Date().toISOString(),
        servings: servings,
        userId: currentUser?.email || currentUser?.id || 'anonymous'
      };
      
      // Record the recipe as cooked
      await recordRecipeCooked(cookingRecord);
      
      // Update pantry quantities by subtracting used ingredients
      if (recipe.ingredients && pantryItems.length > 0) {
        const pantryUpdates = [];
        let updateErrors = [];
        
        for (const ingredient of recipe.ingredients) {
          const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
          const requiredQuantity = typeof ingredient === 'object' ? parseFloat(ingredient.quantity) || 0 : 0;
          const requiredUnit = typeof ingredient === 'object' ? ingredient.unit : '';
          
          if (requiredQuantity <= 0) continue; // Skip ingredients without quantity
          
          // Find matching pantry item (case-insensitive partial match)
          const pantryItem = pantryItems.find(item => 
            item.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
            ingredientName.toLowerCase().includes(item.name.toLowerCase())
          );
          
          if (pantryItem) {
            const availableQuantity = parseFloat(pantryItem.quantity) || 0;
            const totalUsed = requiredQuantity * servings;
            let newQuantity = availableQuantity;
            
            try {
              // Try to convert units if they don't match
              if (requiredUnit !== pantryItem.unit) {
                if (areUnitsCompatible(requiredUnit, pantryItem.unit)) {
                  const convertedUsed = convertUnits(totalUsed, requiredUnit, pantryItem.unit, ingredientName);
                  newQuantity = Math.max(0, availableQuantity - convertedUsed);
                } else {
                  // Units not compatible, skip this ingredient
                  updateErrors.push(`Cannot convert ${requiredUnit} to ${pantryItem.unit} for ${ingredientName}`);
                  continue;
                }
              } else {
                // Same units, direct subtraction
                newQuantity = Math.max(0, availableQuantity - totalUsed);
              }
              
              // Only update if quantity changed
              if (newQuantity !== availableQuantity) {
                pantryUpdates.push({
                  ...pantryItem,
                  quantity: newQuantity.toString()
                });
              }
            } catch (error) {
              updateErrors.push(`Failed to update ${ingredientName}: ${error.message}`);
            }
          }
        }
        
        // Apply all pantry updates
        for (const updatedItem of pantryUpdates) {
          try {
            await updatePantryItem(updatedItem);
          } catch (error) {
            updateErrors.push(`Failed to update ${updatedItem.name}: ${error.message}`);
          }
        }
        
        // Refresh pantry data if we have the refresh function
        if (refreshPantryItems) {
          await refreshPantryItems();
        }
        
        // Show success message with update summary
        let message = `Great! "${recipe.name}" has been marked as cooked with ${servings} serving(s).`;
        if (pantryUpdates.length > 0) {
          message += `\n\nPantry updated: ${pantryUpdates.length} ingredient(s) quantities reduced.`;
        }
        if (updateErrors.length > 0) {
          message += `\n\nNote: ${updateErrors.length} ingredient(s) couldn't be updated automatically.`;
        }
        
        alert(message);
      } else {
        alert(`Great! "${recipe.name}" has been marked as cooked with ${servings} serving(s).`);
      }
      
      onClose();
    } catch (error) {
              // Error recording cooked recipe
      alert('Failed to record the recipe as cooked. Please try again.');
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
          <div className="cooking-actions">
            <div className="servings-input">
              <label htmlFor="servings">Servings made:</label>
              <input
                id="servings"
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                className="servings-input-field"
              />
            </div>
            <button 
              className="recipe-modal-btn primary mark-cooked-btn" 
              onClick={handleMarkAsCooked}
            >
              🍳 Mark as Cooked
            </button>
          </div>
          <button className="recipe-modal-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
