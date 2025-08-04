import React, { useState, useEffect, useCallback } from 'react';
import { UNITS } from '../../../shared/constants/units';
import { TIME_UNITS } from '../../../shared/constants/timeUnits';
import RecipeModal from './RecipeModal';
import './RecipesPage.css';

// --- Macros Calculation and API Integration ---
async function getMacros(ingredients) {
  let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const ing of ingredients) {
    const unit = (ing.unit || '').toLowerCase();
    const qty = parseFloat(ing.quantity);
    let macros;
    if (ing.code) {
      macros = await fetchMacrosFromOFFByCode(ing.code);
    } else {
      macros = await fetchMacrosFromOFF(ing.name);
    }

    if (macros && qty && unit) {
      // Always per 100g for OFF
      if (
        (unit === 'g' || unit === 'gram' || unit === 'grams')
      ) {
        total.calories += (macros.calories * qty) / 100;
        total.protein += (macros.protein * qty) / 100;
        total.carbs += (macros.carbs * qty) / 100;
        total.fat += (macros.fat * qty) / 100;
      }
      // You can add more unit logic if needed
    }
  }
  Object.keys(total).forEach(k => total[k] = Math.round(total[k] * 10) / 10);
  return total;
}

async function fetchMacrosFromOFF(ingredientName) {
  const categoryTag = getCategoryTag(ingredientName);
  let searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(ingredientName)}&search_simple=1&action=process&json=1&page_size=10`;
  if (categoryTag) {
    searchUrl += `&tagtype_0=categories&tag_contains_0=contains&tag_0=${categoryTag}`;
  }
  const response = await fetch(searchUrl);
  const data = await response.json();

  if (data.products && data.products.length > 0) {
    let products = data.products;
    if (categoryTag) {
      products = products.filter(p => p.categories_tags && p.categories_tags.includes(categoryTag));
      if (products.length === 0) products = data.products;
    }
    let product = products.find(p => !p.brands_tags || p.brands_tags.length === 0) || products[0];

    const macros = {
      calories: product.nutriments['energy-kcal_100g'],
      protein: product.nutriments['proteins_100g'],
      carbs: product.nutriments['carbohydrates_100g'],
      fat: product.nutriments['fat_100g'],
      servingSize: 100,
      servingSizeUnit: 'g'
    };

    if (
      macros.calories === undefined ||
      macros.protein === undefined ||
      macros.carbs === undefined ||
      macros.fat === undefined
    ) {
      const suggestions = data.products
        .filter(p =>
          p.nutriments['energy-kcal_100g'] !== undefined &&
          p.nutriments['proteins_100g'] !== undefined &&
          p.nutriments['carbohydrates_100g'] !== undefined &&
          p.nutriments['fat_100g'] !== undefined
        )
        .slice(0, 5)
        .map(p => ({
          description: p.product_name,
          code: p.code
        }));
      return { suggestions };
    }

    return macros;
  } else {
    return { suggestions: [] };
  }
}

async function fetchMacrosFromOFFByCode(code) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json`;
  const response = await fetch(url);
  const data = await response.json();
  const product = data.product || {};
  const macros = {
    calories: product.nutriments?.['energy-kcal_100g'],
    protein: product.nutriments?.['proteins_100g'],
    carbs: product.nutriments?.['carbohydrates_100g'],
    fat: product.nutriments?.['fat_100g'],
    servingSize: 100,
    servingSizeUnit: 'g'
  };
  if (
    macros.calories === undefined ||
    macros.protein === undefined ||
    macros.carbs === undefined ||
    macros.fat === undefined ||
    (
      macros.calories === 0 &&
      macros.protein === 0 &&
      macros.carbs === 0 &&
      macros.fat === 0
    )
  ) {
    return null;
  }
  return macros;
}

const CATEGORY_MAP = {
  "lettuce": "lettuces",
  "burger bun": "buns",
  "chicken breast": "chicken-breasts",
  "cooked chicken breast": "chicken-breasts",
  "egg": "eggs",
  "cheese": "cheeses",
  "tomato": "tomatoes",
  "onion": "onions",
};

function getCategoryTag(ingredientName) {
  const key = ingredientName.trim().toLowerCase();
  return CATEGORY_MAP[key] || null;
}

// --- Main Component ---
const RecipesPage = ({ recipes, setRecipes, users }) => {
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
  const [macrosByRecipe, setMacrosByRecipe] = useState({});
  const [error, setError] = useState('');
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  useEffect(() => {
    async function fetchAllMacros() {
      const macrosObj = {};
      for (const recipe of recipes) {
        macrosObj[recipe.id] = await getMacros(recipe.ingredients);
      }
      setMacrosByRecipe(macrosObj);
    }
    fetchAllMacros();
  }, [recipes]);

  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    setCurrentRecipe(prev => ({
      ...prev,
      name: value
    }));
  }, []);

  const handleIngredientNameChange = useCallback((index, name, code = null) => {
    setCurrentRecipe(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], name, code: code || null };
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
    setError('');
    setIngredientSuggestions([]);
    setSuggestionIndex(null);

    const hasValidIngredients = currentRecipe.ingredients.some(ing => ing.name.trim() && ing.quantity.trim());
    const hasValidCookingTime = currentRecipe.cookingTime.quantity.trim() && parseFloat(currentRecipe.cookingTime.quantity) > 0;

    if (
      currentRecipe.name.trim() &&
      hasValidIngredients &&
      currentRecipe.method.trim() &&
      hasValidCookingTime
    ) {
      const filteredIngredients = currentRecipe.ingredients.filter(
        ing => ing.name.trim() && ing.quantity.trim()
      );

      // Validate each ingredient before adding the recipe
      for (let i = 0; i < filteredIngredients.length; i++) {
        const ing = filteredIngredients[i];
        const macros = ing.code
          ? await fetchMacrosFromOFFByCode(ing.code)
          : await fetchMacrosFromOFF(ing.name);

        const isSuggestionsObj = macros && macros.suggestions !== undefined;
        const unit = (ing.unit || '').toLowerCase();

        if (
          !macros ||
          isSuggestionsObj ||
          macros.calories === undefined ||
          macros.protein === undefined ||
          macros.carbs === undefined ||
          macros.fat === undefined ||
          (
            macros.calories === 0 &&
            macros.protein === 0 &&
            macros.carbs === 0 &&
            macros.fat === 0
          )
        ) {
          let suggestionMsg = `Ingredient "${ing.name}" not found or has no nutrition data in Open Food Facts database.`;
          let suggestionsList = [];

          if (isSuggestionsObj && macros.suggestions.length > 0) {
            suggestionMsg += " Did you mean:";
            suggestionsList = macros.suggestions;
          } else if (
            unit !== "g" && unit !== "gram" && unit !== "grams"
          ) {
            suggestionMsg += ` Try changing the unit to "grams" for better results.`;
            if (ing.name.toLowerCase().includes("egg")) {
              suggestionMsg += ' Or try "egg, whole, raw" with unit "grams" or "large".';
              suggestionsList = [
                { description: "Egg, whole, raw", code: null },
                { description: "Egg, large", code: null },
                { description: "Egg, medium", code: null }
              ];
            }
          } else {
            suggestionMsg += " Try a more specific ingredient name or a different unit.";
          }

          setError(suggestionMsg);
          setIngredientSuggestions(suggestionsList);
          setSuggestionIndex(i);
          return;
        }
      }

      // If all ingredients are valid, add the recipe
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
        cookingTime: {
          quantity: '',
          unit: 'minutes'
        }
      });
      setShowForm(false);
      setIngredientSuggestions([]);
      setSuggestionIndex(null);
    }
  }, [currentRecipe, setRecipes]);

  const toggleForm = useCallback(() => {
    setShowForm(prev => !prev);
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

  const openRecipeModal = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  }, []);

  const closeRecipeModal = useCallback(() => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  }, []);

  const deleteRecipe = useCallback((id) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  }, [setRecipes]);

  return (
    <div className="recipes-page-container">
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
            {recipes.map((recipe) => {
              const macros = macrosByRecipe[recipe.id] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
              return (
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
                        deleteRecipe(recipe.id);
                      }}
                      className="delete-recipe"
                      title="Delete recipe"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="recipe-content">
                    <div className="ingredients-section">
                      <h4>Ingredients:</h4>
                      <ul>
                        {recipe.ingredients.map((ingredient, index) => {
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
                    {/* --- Macros Section --- */}
                    <div className="macros-section">
                      <div className="macros-title">Macros (per recipe):</div>
                      <div className="macros-list">
                        <div>
                          <span className="macro-label">Calories</span>
                          <span className="macro-value">{macros.calories} kcal</span>
                        </div>
                        <div>
                          <span className="macro-label">Protein</span>
                          <span className="macro-value">{macros.protein} g</span>
                        </div>
                        <div>
                          <span className="macro-label">Carbs</span>
                          <span className="macro-value">{macros.carbs} g</span>
                        </div>
                        <div>
                          <span className="macro-label">Fat</span>
                          <span className="macro-value">{macros.fat} g</span>
                        </div>
                      </div>
                      <div className="macros-source">Macros calculated using Open Food Facts.</div>
                    </div>
                    {/* --- End Macros Section --- */}
                    <div className="method-section">
                      <h4>Method:</h4>
                      <p>{recipe.method}</p>
                    </div>
                  </div>
                </div>
              );
            })}
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

              {/* Error message display */}
              {error && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              {/* Suggestions display for ingredient names */}
              {ingredientSuggestions.length > 0 && suggestionIndex !== null && (
                <div style={{ color: 'blue', marginBottom: '1rem' }}>
                  Suggestions:
                  <ul>
                    {ingredientSuggestions.map((suggestion, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => {
                            handleIngredientNameChange(suggestionIndex, suggestion.description, suggestion.code);
                            setError('');
                            setIngredientSuggestions([]);
                            setSuggestionIndex(null);
                          }}
                        >
                          {suggestion.description}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ingredientSuggestions.length === 0 && error && (
                <div style={{ color: 'blue', marginBottom: '1rem' }}>
                  No suggestions found. Try a more specific ingredient name or a different unit.
                </div>
              )}

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
      />
    </div>
  );
};

export default RecipesPage;