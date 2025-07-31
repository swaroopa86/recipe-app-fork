import React, { useState, useCallback } from 'react';
import { UNITS } from '../../../shared/constants/units';
import './RecipesPage.css';

const RecipesPage = ({ recipes, setRecipes, users }) => {
  const [currentRecipe, setCurrentRecipe] = useState({
    name: '',
    ingredients: [{ name: '', quantity: '', unit: 'cups' }],
    method: '',
    cookingTime: ''
  });

  const [showForm, setShowForm] = useState(false);

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

  const handleCookingTimeChange = useCallback((e) => {
    const value = e.target.value;
    setCurrentRecipe(prev => ({
      ...prev,
      cookingTime: value
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const hasValidIngredients = currentRecipe.ingredients.some(ing => ing.name.trim() && ing.quantity.trim());
    
    if (currentRecipe.name.trim() && hasValidIngredients && currentRecipe.method.trim() && currentRecipe.cookingTime.trim()) {
      const filteredIngredients = currentRecipe.ingredients.filter(ing => ing.name.trim() && ing.quantity.trim());
      
      const newRecipe = {
        ...currentRecipe,
        ingredients: filteredIngredients,
        id: Date.now()
      };
      setRecipes(prev => [...prev, newRecipe]);
      setCurrentRecipe({
        name: '',
        ingredients: [{ name: '', quantity: '', unit: 'cups' }],
        method: '',
        cookingTime: ''
      });
      setShowForm(false); // Hide form after successful submission
    }
  }, [currentRecipe, setRecipes]);

  const toggleForm = useCallback(() => {
    setShowForm(prev => !prev);
    // Reset form when closing
    if (showForm) {
      setCurrentRecipe({
        name: '',
        ingredients: [{ name: '', quantity: '', unit: 'cups' }],
        method: '',
        cookingTime: ''
      });
    }
  }, [showForm]);

  const deleteRecipe = useCallback((id) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  }, [setRecipes]);

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
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-header">
                  <div className="recipe-title-section">
                    <h3>{recipe.name}</h3>
                    {recipe.cookingTime && (
                      <p className="recipe-cooking-time">⏱️ {recipe.cookingTime}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    className="delete-recipe"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="recipe-content">
                  <div className="ingredients-section">
                    <h4>Ingredients:</h4>
                    <ul>
                      {recipe.ingredients.map((ingredient, index) => {
                        // Handle both old string format and new object format for backward compatibility
                        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
                        const ingredientQuantity = typeof ingredient === 'string' ? '' : ingredient.quantity;
                        const ingredientUnit = typeof ingredient === 'string' ? '' : ingredient.unit;
                        
                        return (
                          <li key={index} className="">
                            <div className="ingredient-display">
                              <span className="ingredient-amount">
                                {ingredientQuantity && ingredientUnit && (
                                  <strong>{ingredientQuantity} {ingredientUnit}</strong>
                                )}
                              </span>
                              <span className="ingredient-name">{ingredientName}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="method-section">
                    <h4>Method:</h4>
                    <p>{recipe.method}</p>
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
                <label htmlFor="recipe-cooking-time">Cooking Time:</label>
                <input
                  id="recipe-cooking-time"
                  type="text"
                  value={currentRecipe.cookingTime}
                  onChange={handleCookingTimeChange}
                  placeholder="e.g., 1 hour, 30 minutes"
                  required
                  autoComplete="off"
                />
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
    </div>
  );
};

export default RecipesPage; 