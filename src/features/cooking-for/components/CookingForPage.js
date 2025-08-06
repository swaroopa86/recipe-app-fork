import React, { useState, useMemo } from 'react';
import { detectAllAllergens, getUserAllergenConflicts } from '../../../shared/utils/allergenUtils';
import { convertUnits, areUnitsCompatible, formatQuantity } from '../../../utils/unitConversion';
import RecipeModal from '../../recipes/components/RecipeModal';
import './CookingForPage.css';

const CookingForPage = ({
  recipes,
  users,
  pantryItems,
  setPantryItems,
  shoppingList,
  setShoppingList,
  macrosByRecipe // <-- add this
}) => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const selectedUser = useMemo(() => {
    return selectedUserId ? users.find(user => user.id === selectedUserId) : null;
  }, [selectedUserId, users]);

  const safeRecipes = useMemo(() => {
    if (!selectedUser) return [];
    
    return recipes.filter(recipe => {
      // Handle both old string format and new object format for ingredients
      const ingredientNames = recipe.ingredients.map(ingredient => 
        typeof ingredient === 'string' ? ingredient : ingredient.name
      );
      
      // Check if recipe has any allergen conflicts with the selected user
      const conflicts = getUserAllergenConflicts(ingredientNames, selectedUser);
      return conflicts.length === 0; // Only return recipes with no conflicts
    });
  }, [recipes, selectedUser]);

  // Helper function to check if an ingredient is available in pantry
  const checkIngredientAvailability = useMemo(() => {
    return (recipeIngredient) => {
      const ingredientName = typeof recipeIngredient === 'string' ? recipeIngredient : recipeIngredient.name;
      const requiredQuantity = typeof recipeIngredient === 'string' ? 0 : parseFloat(recipeIngredient.quantity) || 0;
      const requiredUnit = typeof recipeIngredient === 'string' ? '' : recipeIngredient.unit;

      // Find matching pantry item (case-insensitive partial match)
      const pantryItem = pantryItems.find(item => 
        item.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
        ingredientName.toLowerCase().includes(item.name.toLowerCase())
      );

      if (!pantryItem) {
        return { available: false, reason: 'Not in pantry' };
      }

      // If we don't have quantity info for the recipe, just check if item exists
      if (requiredQuantity === 0) {
        return { available: true, reason: 'Available', pantryItem };
      }

      // Check if units are compatible (simplified logic)
      const availableQuantity = parseFloat(pantryItem.quantity) || 0;
      const availableUnit = pantryItem.unit;

      // Simple unit compatibility check
      if (requiredUnit === availableUnit) {
        const hasEnough = availableQuantity >= requiredQuantity;
        return {
          available: hasEnough,
          reason: hasEnough ? 'Sufficient quantity' : `Need ${requiredQuantity} ${requiredUnit}, have ${availableQuantity} ${availableUnit}`,
          pantryItem,
          hasEnough
        };
      }

      // If units don't match, we can't easily compare quantities
      return {
        available: true,
        reason: `Available (${availableQuantity} ${availableUnit} vs needed ${requiredQuantity} ${requiredUnit})`,
        pantryItem,
        hasEnough: null // Unknown due to unit mismatch
      };
    };
  }, [pantryItems]);

  // Categorize safe recipes by pantry availability
  const categorizedRecipes = useMemo(() => {
    const canMakeNow = [];
    const missingIngredients = [];

    safeRecipes.forEach(recipe => {
      const ingredientChecks = recipe.ingredients.map(ingredient => ({
        ingredient,
        check: checkIngredientAvailability(ingredient)
      }));

      const availableCount = ingredientChecks.filter(check => check.check.available).length;
      const totalCount = ingredientChecks.length;

      const recipeWithAvailability = {
        ...recipe,
        ingredientChecks,
        availableCount,
        totalCount,
        canMakeNow: availableCount === totalCount
      };

      if (recipeWithAvailability.canMakeNow) {
        canMakeNow.push(recipeWithAvailability);
      } else {
        missingIngredients.push(recipeWithAvailability);
      }
    });

    return { canMakeNow, missingIngredients };
  }, [safeRecipes, checkIngredientAvailability]);

  // Function to handle selecting a recipe and updating pantry quantities
  const handleSelectRecipe = (recipe) => {
    if (!recipe || !recipe.ingredients) return;

    let updatedItemsCount = 0;
    let conversionErrors = [];

    setPantryItems(prevItems => {
      const updatedItems = [...prevItems];
      
      recipe.ingredients.forEach(ingredient => {
        // Handle both old string format and new object format
        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
        const requiredQuantity = typeof ingredient === 'string' ? 0 : parseFloat(ingredient.quantity) || 0;
        const requiredUnit = typeof ingredient === 'string' ? '' : ingredient.unit;

        if (requiredQuantity <= 0) return; // Skip ingredients without quantity

        // Find matching pantry item (case-insensitive partial match)
        const pantryItemIndex = updatedItems.findIndex(item => 
          item.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
          ingredientName.toLowerCase().includes(item.name.toLowerCase())
        );

        if (pantryItemIndex !== -1) {
          const pantryItem = updatedItems[pantryItemIndex];
          const availableQuantity = parseFloat(pantryItem.quantity) || 0;
          
          try {
            let quantityToSubtract = requiredQuantity;
            
            // Convert units if they don't match
            if (pantryItem.unit !== requiredUnit) {
              if (areUnitsCompatible(requiredUnit, pantryItem.unit)) {
                // Convert required quantity to pantry unit
                quantityToSubtract = convertUnits(
                  requiredQuantity, 
                  requiredUnit, 
                  pantryItem.unit, 
                  ingredientName
                );
              } else {
                conversionErrors.push(`Cannot convert ${requiredUnit} to ${pantryItem.unit} for ${ingredientName}`);
                return; // Skip this ingredient
              }
            }
            
            // Check if we have enough quantity (with small tolerance for floating point)
            if (availableQuantity >= quantityToSubtract - 0.001) {
              const newQuantity = Math.max(0, availableQuantity - quantityToSubtract);
              updatedItems[pantryItemIndex] = {
                ...pantryItem,
                quantity: formatQuantity(newQuantity)
              };
              
              updatedItemsCount++;
              
              // Remove item if quantity reaches 0 or very close to 0
              if (newQuantity < 0.001) {
                updatedItems.splice(pantryItemIndex, 1);
              }
            }
          } catch (error) {
            conversionErrors.push(`Error converting units for ${ingredientName}: ${error.message}`);
          }
        }
      });
      
      return updatedItems;
    });
    
    // Show success message with detailed feedback
    let message = `You have selected "${recipe.name}"`;
    
    if (updatedItemsCount > 0) {
      message += ` and updated ${updatedItemsCount} pantry item${updatedItemsCount !== 1 ? 's' : ''} with unit conversion.`;
    } else {
      message += `, but no pantry items were updated.`;
    }
    
    if (conversionErrors.length > 0) {
      message += ` Note: ${conversionErrors.length} ingredient${conversionErrors.length !== 1 ? 's' : ''} could not be converted.`;
      console.warn('Unit conversion errors:', conversionErrors);
    }
    
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    
    // Auto-hide message after 5 seconds (longer for more detailed message)
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  // Function to handle adding ingredients to shopping list
  const handleAddToShoppingList = (recipe, canMakeNow = false) => {
    if (!recipe || !recipe.ingredients) return;

    const ingredientsToAdd = [];
    
    recipe.ingredients.forEach(ingredient => {
      // Handle both old string format and new object format
      const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
      const requiredQuantity = typeof ingredient === 'string' ? 1 : parseFloat(ingredient.quantity) || 1;
      const requiredUnit = typeof ingredient === 'string' ? 'item' : ingredient.unit || 'item';

      if (canMakeNow) {
        // For "Can Make Now" recipes, add ALL ingredients to shopping list
        ingredientsToAdd.push({
          name: ingredientName,
          quantity: requiredQuantity,
          unit: requiredUnit,
          recipeSource: recipe.name,
          id: Date.now() + Math.random()
        });
      } else {
        // For "Need Items" recipes, only add missing or insufficient ingredients
        // Find matching pantry item (case-insensitive partial match)
        const pantryItem = pantryItems.find(item => 
          item.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
          ingredientName.toLowerCase().includes(item.name.toLowerCase())
        );

        // If ingredient is not in pantry or insufficient quantity, add to shopping list
        if (!pantryItem) {
          ingredientsToAdd.push({
            name: ingredientName,
            quantity: requiredQuantity,
            unit: requiredUnit,
            recipeSource: recipe.name,
            id: Date.now() + Math.random()
          });
        } else if (requiredQuantity > 0 && pantryItem.unit === requiredUnit) {
          const availableQuantity = parseFloat(pantryItem.quantity) || 0;
          if (availableQuantity < requiredQuantity) {
            const neededQuantity = requiredQuantity - availableQuantity;
            ingredientsToAdd.push({
              name: ingredientName,
              quantity: neededQuantity,
              unit: requiredUnit,
              recipeSource: recipe.name,
              id: Date.now() + Math.random()
            });
          }
        }
      }
    });

    // Add ingredients to shopping list (avoid duplicates)
    setShoppingList(prevList => {
      const updatedList = [...prevList];
      
      ingredientsToAdd.forEach(newItem => {
        // Check for existing items with similar names
        const existingItemIndex = updatedList.findIndex(item => {
          const existingName = item.name.toLowerCase().trim();
          const newName = newItem.name.toLowerCase().trim();
          
          // Check for exact match or partial match (either direction)
          return (existingName === newName) ||
                 ((existingName.includes(newName) || newName.includes(existingName)) &&
                 item.unit === newItem.unit);
        });

        if (existingItemIndex !== -1) {
          // Update quantity and combine recipe sources if item already exists
          const existingItem = updatedList[existingItemIndex];
          const existingSources = existingItem.recipeSource.split(', ');
          const newSources = newItem.recipeSource.split(', ');
          const combinedSources = [...new Set([...existingSources, ...newSources])].join(', ');
          
          updatedList[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + newItem.quantity,
            recipeSource: combinedSources
          };
        } else {
          // Add new item
          updatedList.push(newItem);
        }
      });
      
      return updatedList;
    });

    // Show appropriate success message based on what was added
    const itemCount = ingredientsToAdd.length;
    let message;
    
    if (canMakeNow) {
      // For "Can Make Now" recipes, all ingredients were added
      message = `Added all ${itemCount} ingredient${itemCount !== 1 ? 's' : ''} from "${recipe.name}" to your shopping list!`;
    } else if (itemCount === 0) {
      // For "Need Items" recipes where all ingredients are available in pantry
      message = `All ingredients for "${recipe.name}" are already available in your pantry! No items added to shopping list.`;
    } else {
      // For "Need Items" recipes where some ingredients were missing and added
      message = `Added ${itemCount} missing ingredient${itemCount !== 1 ? 's' : ''} from "${recipe.name}" to your shopping list!`;
    }
    
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    
    // Auto-hide message after 4 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 4000);
  };

  const handleUserSelectionChange = (e) => {
    const userId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedUserId(userId);
  };

  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  };

  if (users.length === 0) {
    return (
      <div className="cooking-for-container">
        <div className="no-users-message">
          <h2>👥 Cooking For</h2>
          <div className="empty-state">
            <span className="empty-icon">👤</span>
            <h3>No Users Found</h3>
            <p>You need to create users first before you can see safe recipes for them.</p>
            <p>Go to the Users page to add people and their allergen profiles.</p>
          </div>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="cooking-for-container">
        <div className="no-recipes-message">
          <h2>👥 Cooking For</h2>
          <div className="user-selection">
            <label htmlFor="user-select">Select who you're cooking for:</label>
            <select
              id="user-select"
              value={selectedUserId || ''}
              onChange={handleUserSelectionChange}
              className="user-select"
            >
              <option value="">Choose a person...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.allergens.size} allergens)
                </option>
              ))}
            </select>
          </div>
          <div className="empty-state">
            <span className="empty-icon">🍳</span>
            <h3>No Recipes Found</h3>
            <p>You need to create recipes first before you can filter them by user allergens.</p>
            <p>Go to the Recipes page to add some delicious recipes!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cooking-for-container">
      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div className="success-message-popup">
          <div className="success-message-content">
            <span className="success-icon">✅</span>
            <span className="success-text">{successMessage}</span>
            <button 
              className="close-message-btn"
              onClick={() => setShowSuccessMessage(false)}
              title="Close message"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="cooking-for-header">
        <h2>👥 Cooking For</h2>
        <p className="page-description">
          Select someone to see recipes that are safe for them to eat and check pantry availability
        </p>
      </div>

      <div className="user-selection">
        <label htmlFor="user-select">Select who you're cooking for:</label>
        <select
          id="user-select"
          value={selectedUserId || ''}
          onChange={handleUserSelectionChange}
          className="user-select"
        >
          <option value="">Choose a person...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.allergens.size} allergens)
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="selected-user-info">
          <div className="user-card">
            <h3>👤 {selectedUser.name}</h3>
            {selectedUser.allergens.size > 0 ? (
              <div className="user-allergens">
                <p><strong>Allergic to:</strong></p>
                <div className="allergen-tags">
                  {Array.from(selectedUser.allergens).map(allergen => (
                    <span key={allergen} className="allergen-tag">
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-allergens">✅ No known allergens</p>
            )}
            <div className="pantry-info">
              <p><strong>Pantry items:</strong> {pantryItems.length} ingredients available</p>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="recipes-section">
          <div className="recipes-header">
            <h3>Safe Recipes for {selectedUser.name}</h3>
            <div className="recipe-count">
              {safeRecipes.length} of {recipes.length} recipes are safe
            </div>
          </div>

          {safeRecipes.length === 0 ? (
            <div className="no-safe-recipes">
              <span className="warning-icon">⚠️</span>
              <h4>No Safe Recipes Found</h4>
              <p>
                Unfortunately, all current recipes contain ingredients that {selectedUser.name} is allergic to.
              </p>
              <p>
                Try creating recipes without ingredients containing: {Array.from(selectedUser.allergens).join(', ')}
              </p>
            </div>
          ) : (
            <>
              {/* Recipes that can be made now */}
              {categorizedRecipes.canMakeNow.length > 0 && (
                <div className="recipe-category">
                  <div className="category-header can-make-header">
                    <h4>🍳 Can Make Now ({categorizedRecipes.canMakeNow.length})</h4>
                    <p>All ingredients are available in your pantry</p>
                  </div>
                  <div className="safe-recipes-list">
                    {categorizedRecipes.canMakeNow.map((recipe) => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        selectedUser={selectedUser}
                        canMakeNow={true}
                        onSelectRecipe={handleSelectRecipe}
                        onAddToShoppingList={handleAddToShoppingList}
                        onOpenRecipeModal={openRecipeModal}
                        macros={macrosByRecipe && macrosByRecipe[recipe.id] ? macrosByRecipe[recipe.id] : { calories: 0, protein: 0, carbs: 0, fat: 0 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recipes missing some ingredients */}
              {categorizedRecipes.missingIngredients.length > 0 && (
                <div className="recipe-category">
                  <div className="category-header missing-ingredients-header">
                    <h4>🛒 Missing Ingredients ({categorizedRecipes.missingIngredients.length})</h4>
                    <p>Safe to eat, but you'll need to shop for some ingredients</p>
                  </div>
                  <div className="safe-recipes-list">
                    {categorizedRecipes.missingIngredients.map((recipe) => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        selectedUser={selectedUser}
                        canMakeNow={false}
                        onSelectRecipe={handleSelectRecipe}
                        onAddToShoppingList={handleAddToShoppingList}
                        onOpenRecipeModal={openRecipeModal}
                        macros={macrosByRecipe && macrosByRecipe[recipe.id] ? macrosByRecipe[recipe.id] : { calories: 0, protein: 0, carbs: 0, fat: 0 }} // <-- add this line
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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

// Separate component for recipe cards to keep code organized
const RecipeCard = ({ recipe, selectedUser, canMakeNow, onSelectRecipe, onAddToShoppingList, onOpenRecipeModal, macros }) => {
  return (
    <div 
      className={`recipe-card safe-recipe ${canMakeNow ? 'can-make-now' : 'missing-ingredients'} clickable-recipe`}
      onClick={() => onOpenRecipeModal(recipe)}
    >
      <div className="recipe-header">
        <div className="recipe-title-section">
          <h4>{recipe.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {recipe.cookingTime && (
              <p className="recipe-cooking-time" style={{ margin: 0 }}>
                ⏱️ {typeof recipe.cookingTime === 'object'
                  ? `${recipe.cookingTime.quantity} ${recipe.cookingTime.unit}`
                  : recipe.cookingTime
                }
              </p>
            )}
            {/* --- Macros Section --- */}
            <div className="macros-inline">
              <span className="macro-label">Calories</span>
              <span className="macro-value">{macros.calories} kcal</span>
              <span className="macro-label">Protein</span>
              <span className="macro-value">{macros.protein} g</span>
              <span className="macro-label">Carbs</span>
              <span className="macro-value">{macros.carbs} g</span>
              <span className="macro-label">Fat</span>
              <span className="macro-value">{macros.fat} g</span>
            </div>
            {/* --- End Macros Section --- */}
          </div>
          <div className="recipe-badges">
            <div className="safety-badge">
              <span className="safe-icon">✅</span>
              Safe for {selectedUser.name}
            </div>
            <div className={`availability-badge ${canMakeNow ? 'can-make' : 'missing'}`}>
              <span className="availability-icon">{canMakeNow ? '🍳' : '🛒'}</span>
              {canMakeNow ? 'Can make now' : `${recipe.availableCount}/${recipe.totalCount} ingredients`}
            </div>
          </div>
        </div>
        <div className="recipe-actions">
          {canMakeNow && (
            <button 
              className="select-recipe-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelectRecipe(recipe);
              }}
              title="Select this recipe and update pantry quantities"
            >
              <span className="select-icon">✓</span>
              Select Recipe
            </button>
          )}
          <button 
            className="add-to-shopping-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToShoppingList(recipe, canMakeNow);
            }}
            title={canMakeNow ? "Add all ingredients to shopping list for future use" : "Add missing ingredients to shopping list"}
          >
            <span className="shopping-icon">🛒</span>
            {canMakeNow ? "Add to Shopping List" : "Add Missing Items"}
          </button>
        </div>
      </div>
      
      <div className="recipe-content">
        <div className="recipe-summary">
          <p className="recipe-description">
            {canMakeNow ? 
              '✅ All ingredients available in your pantry' : 
              '🛒 Some ingredients need to be purchased'
            }
          </p>
          <p className="click-hint">Click to view full recipe details</p>
        </div>
      </div>
    </div>
  );
};

export default CookingForPage;
