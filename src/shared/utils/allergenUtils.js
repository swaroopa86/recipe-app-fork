import { ALLERGENS } from '../constants/allergens';

// Function to detect allergens in an ingredient for a specific user
export const detectAllergensForUser = (ingredient, user) => {
  if (!ingredient || !user) return [];
  
  const detectedAllergens = [];
  const lowerIngredient = ingredient.toLowerCase();
  
  Object.entries(ALLERGENS).forEach(([allergenType, allergenList]) => {
    // Only check for allergens that this specific user is allergic to
    if (user.allergens.has(allergenType)) {
      allergenList.forEach(allergen => {
        if (lowerIngredient.includes(allergen)) {
          if (!detectedAllergens.includes(allergenType)) {
            detectedAllergens.push(allergenType);
          }
        }
      });
    }
  });
  
  return detectedAllergens;
};

// Function to detect all allergens in an ingredient (for general recipe info)
export const detectAllAllergens = (ingredient) => {
  if (!ingredient) return [];
  
  const detectedAllergens = [];
  const lowerIngredient = ingredient.toLowerCase();
  
  Object.entries(ALLERGENS).forEach(([allergenType, allergenList]) => {
    allergenList.forEach(allergen => {
      if (lowerIngredient.includes(allergen)) {
        if (!detectedAllergens.includes(allergenType)) {
          detectedAllergens.push(allergenType);
        }
      }
    });
  });
  
  return detectedAllergens;
};

// Function to get all allergens in a recipe (for general display)
export const getRecipeAllergens = (ingredients) => {
  const allAllergens = new Set();
  ingredients.forEach(ingredient => {
    const allergens = detectAllAllergens(ingredient);
    allergens.forEach(allergen => allAllergens.add(allergen));
  });
  return Array.from(allAllergens);
};

// Function to get allergen conflicts for selected user
export const getUserAllergenConflicts = (ingredients, user) => {
  if (!user) return [];
  
  const allConflicts = new Set();
  ingredients.forEach(ingredient => {
    const conflicts = detectAllergensForUser(ingredient, user);
    conflicts.forEach(conflict => allConflicts.add(conflict));
  });
  return Array.from(allConflicts);
}; 