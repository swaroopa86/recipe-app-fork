import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';
import { fetchRecipes, fetchUsers, fetchPantryItems } from '../shared/api';
import { RecipesPage, UsersPage, PantryPage, CookingForPage, ShoppingListPage } from '../features';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [shoppingList, setShoppingList] = useLocalStorage('shoppingList', []);
  const [currentPage, setCurrentPage] = useState('recipes'); // 'recipes', 'users', 'pantry', 'cooking-for', or 'shopping-list'

  const refreshRecipes = useCallback(async () => {
    const data = await fetchRecipes();
    setRecipes(data);
  }, []);

  const refreshUsers = useCallback(async () => {
    const data = await fetchUsers();
    setUsers(data.map(user => ({
      ...user,
      allergens: new Set(user.allergens || [])
    })));
  }, []);

  const refreshPantryItems = useCallback(async () => {
    const data = await fetchPantryItems();
    setPantryItems(data);
  }, []);



  useEffect(() => {
    refreshRecipes();
    refreshUsers();
    refreshPantryItems();
  }, [refreshRecipes, refreshUsers, refreshPantryItems]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Recipe Creator</h1>
        <nav className="main-nav">
          <button
            className={`nav-btn ${currentPage === 'recipes' ? 'active' : ''}`}
            onClick={() => setCurrentPage('recipes')}
          >
            <span className="nav-icon">🍳</span>
            Recipes
          </button>
          <button
            className={`nav-btn ${currentPage === 'cooking-for' ? 'active' : ''}`}
            onClick={() => setCurrentPage('cooking-for')}
          >
            <span className="nav-icon">👨‍🍳</span>
            Cooking For
          </button>
          <button
            className={`nav-btn ${currentPage === 'pantry' ? 'active' : ''}`}
            onClick={() => setCurrentPage('pantry')}
          >
            <span className="nav-icon">🥫</span>
            Pantry
            {pantryItems.length > 0 && (
              <span className="pantry-badge">{pantryItems.length}</span>
            )}
          </button>
          <button
            className={`nav-btn ${currentPage === 'shopping-list' ? 'active' : ''}`}
            onClick={() => setCurrentPage('shopping-list')}
          >
            <span className="nav-icon">🛒</span>
            Shopping List
            {shoppingList.length > 0 && (
              <span className="shopping-badge">{shoppingList.length}</span>
            )}
          </button>
          <button
            className={`nav-btn ${currentPage === 'users' ? 'active' : ''}`}
            onClick={() => setCurrentPage('users')}
          >
            <span className="nav-icon">👥</span>
            Users
            {users.length > 0 && (
              <span className="users-badge">{users.length}</span>
            )}
          </button>
        </nav>
      </header>

      <main className="App-main single-column-layout">
        {currentPage === 'recipes' && (
          <RecipesPage recipes={recipes} users={users} refreshRecipes={refreshRecipes} />
        )}
        {currentPage === 'cooking-for' && (
          <CookingForPage 
            recipes={recipes} 
            users={users} 
            pantryItems={pantryItems} 
            refreshPantryItems={refreshPantryItems}
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
          />
        )}
        {currentPage === 'pantry' && (
          <PantryPage pantryItems={pantryItems} refreshPantryItems={refreshPantryItems} />
        )}
        {currentPage === 'shopping-list' && (
          <ShoppingListPage shoppingList={shoppingList} setShoppingList={setShoppingList} />
        )}
        {currentPage === 'users' && (
          <UsersPage users={users} refreshUsers={refreshUsers} />
        )}
      </main>
    </div>
  );
}

export default App;
