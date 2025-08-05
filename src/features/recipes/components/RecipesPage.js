import React, { useState, useCallback } from 'react';
import { UNITS } from '../../../shared/constants/units';
import { TIME_UNITS } from '../../../shared/constants/timeUnits';
import { createRecipe, deleteRecipe } from '../../../shared/api';
import RecipeModal from './RecipeModal';
import './RecipesPage.css';

const RecipesPage = ({ recipes, users, refreshRecipes, pantryItems = [] }) => {
  const [currentRecipe, setCurrentRecipe] = useState({
    name: '',
    ingredients: [{ name: '', quantity: '', unit: 'cups' }],
    method: '',
    cookingTime: {
      quantity: '',
      unit: 'minutes'
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    setCurrentRecipe(prev => ({
      ...prev,
      name: value
    }));
  }, []);

  const handleIngredientNameChange = useCallback((index, value) => {
    setCurrentRecipe(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], name: value };
      return {
        ...prev,
        ingredients: newIngredients
      };
    });
  }, []);

  const handleIngredientQuantityChange = useCallback((index, value) => {
    setCurrentRecipe(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], quantity: value };
      return {
        ...prev,
        ingredients: newIngredients
      };
    });
  }, []);

  const handleIngredientUnitChange = useCallback((index, value) => {
    setCurrentRecipe(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], unit: value };
      return {
        ...prev,
        ingredients: newIngredients
      };
    });
  }, []);

  const addIngredient = useCallback(() => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: 'cups' }]
    }));
  }, []);

  const removeIngredient = useCallback((index) => {
    setCurrentRecipe(prev => {
      const newIngredients = prev.ingredients.filter((_, i) => i !== index);
      return {
        ...prev,
        ingredients: newIngredients.length === 0 ? [{ name: '', quantity: '', unit: 'cups' }] : newIngredients
      };
    });
  }, []);

  const handleMethodChange = useCallback((e) => {
    const value = e.target.value;
    setCurrentRecipe(prev => ({
      ...prev,
      method: value
    }));
  }, []);

  const handleCookingTimeQuantityChange = useCallback((e) => {
    const value = e.target.value;
    setCurrentRecipe(prev => ({
      ...prev,
      cookingTime: {
        ...prev.cookingTime,
        quantity: value
      }
    }));
  }, []);

  const handleCookingTimeUnitChange = useCallback((e) => {
    const value = e.target.value;
    setCurrentRecipe(prev => ({
      ...prev,
      cookingTime: {
        ...prev.cookingTime,
        unit: value
      }
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const hasValidIngredients = currentRecipe.ingredients.some(ing => ing.name.trim() && ing.quantity.trim());
    
    const hasValidCookingTime = currentRecipe.cookingTime.quantity.trim() && parseFloat(currentRecipe.cookingTime.quantity) > 0;
    
    if (currentRecipe.name.trim() && hasValidIngredients && currentRecipe.method.trim() && hasValidCookingTime) {
      const filteredIngredients = currentRecipe.ingredients.filter(ing => ing.name.trim() && ing.quantity.trim());
      
      const newRecipe = {
        ...currentRecipe,
        ingredients: filteredIngredients,
        id: Date.now().toString() // Ensure ID is a string for backend
      };
      try {
        await createRecipe(newRecipe);
        refreshRecipes(); // Refresh recipes after creation
      } catch (error) {
        console.error('Error creating recipe:', error);
        alert('Failed to create recipe. Please try again.');
      }
      setCurrentRecipe({
        name: '',
        ingredients: [{ name: '', quantity: '', unit: 'cups' }],
        method: '',
        cookingTime: {
          quantity: '',
          unit: 'minutes'
        }
      });
      setShowForm(false); // Hide form after successful submission
    }
  }, [currentRecipe, refreshRecipes]);

  const toggleForm = useCallback(() => {
    setShowForm(prev => !prev);
    // Reset form when closing
    if (showForm) {
      setCurrentRecipe({
        name: '',
        ingredients: [{ name: '', quantity: '', unit: 'cups' }],
        method: '',
        cookingTime: {
          quantity: '',
          unit: 'minutes'
        }
      });
    }
  }, [showForm]);

  const handleDeleteRecipe = useCallback(async (id) => {
    try {
      await deleteRecipe(id);
      refreshRecipes(); // Refresh recipes after deletion
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  }, [refreshRecipes]);

  const openRecipeModal = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  }, []);

  const closeRecipeModal = useCallback(() => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  }, []);

  return (
    <div className="recipes-page-container">
      {/* Main recipes section */}
      <div className="recipes-main-section">
        <div className="recipes-header-section">
          <h2>My Recipes ({recipes.length})</h2>
          <button onClick={toggleForm} className="add-recipe-btn">
            <span className="add-icon">+</span>
            Create New Recipe
          </button>
        </div>

        {recipes.length === 0 ? (
          <div className="no-recipes-fullwidth">
            <span className="empty-icon">🍳</span>
            <h3>No recipes yet!</h3>
            <p>Click "Create New Recipe" to add your first delicious recipe.</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card" onClick={() => openRecipeModal(recipe)}>
                <div className="recipe-header">
                  <div className="recipe-title-section">
                    <h3>{recipe.name}</h3>
                    {recipe.cookingTime && (
                      <p className="recipe-cooking-time">
                        ⏱️ {typeof recipe.cookingTime === 'object' 
                          ? `${recipe.cookingTime.quantity} ${recipe.cookingTime.unit}`
                          : recipe.cookingTime
                        }
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRecipe(recipe.id);
                    }}
                    className="delete-recipe"
                    title="Delete recipe"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="recipe-preview">
                  <div className="ingredients-preview">
                    <h4>Ingredients ({recipe.ingredients?.length || 0}):</h4>
                    <p className="ingredients-summary">
                      {recipe.ingredients?.slice(0, 3).map(ingredient => {
                        const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
                        return name;
                      }).join(', ')}
                      {recipe.ingredients?.length > 3 && '...'}
                    </p>
                  </div>
                  <div className="click-hint">
                    <span>Click to view full recipe</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form overlay */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-overlay-content">
            <div className="form-header">
              <h2>Create a New Recipe</h2>
              <button onClick={toggleForm} className="close-form-btn">
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="recipe-form">
              <div className="form-group">
                <label htmlFor="recipe-name">Recipe Name:</label>
                <input
                  id="recipe-name"
                  type="text"
                  value={currentRecipe.name}
                  onChange={handleNameChange}
                  placeholder="Enter recipe name"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Ingredients:</label>
                {currentRecipe.ingredients.map((ingredient, index) => {
                  return (
                    <div key={`ingredient-${index}`} className="ingredient-input">
                      <div className="ingredient-details">
                        <div className="ingredient-name-field">
                          <input
                            type="text"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientNameChange(index, e.target.value)}
                            placeholder={`Ingredient ${index + 1}`}
                            className=""
                            autoComplete="off"
                          />
                        </div>
                        
                        <div className="ingredient-quantity-group">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientQuantityChange(index, e.target.value)}
                            placeholder="Qty"
                            className="quantity-input"
                            autoComplete="off"
                          />
                          <select
                            value={ingredient.unit}
                            onChange={(e) => handleIngredientUnitChange(index, e.target.value)}
                            className="unit-select"
                          >
                            {UNITS.map(unit => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {currentRecipe.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="remove-ingredient"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
                <button type="button" onClick={addIngredient} className="add-ingredient">
                  Add Ingredient
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="recipe-method">Method:</label>
                <textarea
                  id="recipe-method"
                  value={currentRecipe.method}
                  onChange={handleMethodChange}
                  placeholder="Enter cooking method/instructions"
                  rows="6"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Cooking Time:</label>
                <div className="cooking-time-input-group">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentRecipe.cookingTime.quantity}
                    onChange={handleCookingTimeQuantityChange}
                    placeholder="Time"
                    className="cooking-time-quantity-input"
                    required
                    autoComplete="off"
                  />
                  <select
                    value={currentRecipe.cookingTime.unit}
                    onChange={handleCookingTimeUnitChange}
                    className="cooking-time-unit-select"
                  >
                    {TIME_UNITS.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={toggleForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-recipe">
                  Add Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      <RecipeModal 
        recipe={selectedRecipe}
        isOpen={showRecipeModal}
        onClose={closeRecipeModal}
        pantryItems={pantryItems}
      />
    </div>
  );
};

export default RecipesPage; 