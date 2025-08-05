const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:3001/api';

// Helper for API calls
const callApi = async (endpoint, method = 'GET', data = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API error: ${response.statusText}`);
  }
  // Handle 204 No Content for successful deletions
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

// Recipes API
export const fetchRecipes = async () => callApi('/recipes');
export const createRecipe = async (recipe) => callApi('/recipes', 'POST', recipe);
export const updateRecipe = async (recipe) => callApi(`/recipes/${recipe.id}`, 'PUT', recipe);
export const deleteRecipe = async (id) => callApi(`/recipes/${id}`, 'DELETE');

// Users API
export const fetchUsers = async () => callApi('/users');
export const createUser = async (user) => callApi('/users', 'POST', user);
export const updateUser = async (user) => callApi(`/users/${user.id}`, 'PUT', user);
export const deleteUser = async (id) => callApi(`/users/${id}`, 'DELETE');

// Pantry Items API
export const fetchPantryItems = async () => callApi('/pantryItems');
export const createPantryItem = async (item) => callApi('/pantryItems', 'POST', item);
export const updatePantryItem = async (item) => callApi(`/pantryItems/${item.id}`, 'PUT', item);
export const deletePantryItem = async (id) => callApi(`/pantryItems/${id}`, 'DELETE');

// Shopping List API
export const fetchShoppingList = async () => callApi('/shoppingList');
export const createShoppingListItem = async (item) => callApi('/shoppingList', 'POST', item);
export const updateShoppingListItem = async (item) => callApi(`/shoppingList/${item.id}`, 'PUT', item);
export const deleteShoppingListItem = async (id) => callApi(`/shoppingList/${id}`, 'DELETE');

// Cooking History API
export const fetchCookingHistory = async () => callApi('/cookingHistory');
export const recordRecipeCooked = async (cookingRecord) => callApi('/cookingHistory', 'POST', cookingRecord);

// Reports API
export const fetchWeeklyReport = async () => callApi('/reports/weekly');
