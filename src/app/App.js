import React, { useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';
import { fetchRecipes, fetchUsers, fetchPantryItems } from '../shared/api';
import { RecipesPage, UsersPage, UserDetailsPage, PantryPage, CookingForPage, ShoppingListPage, ReportsPage, LoginPage, Chatbot } from '../features';
import { getDecryptedGoogleClientId } from '../utils/encryption';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [shoppingList, setShoppingList] = useLocalStorage('shoppingList', []);
  const [currentPage, setCurrentPage] = useState('recipes'); // 'recipes', 'users', 'pantry', 'cooking-for', 'shopping-list', 'reports', or 'user-details'
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);

    const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

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
    if (currentUser) {
      refreshRecipes();
      refreshUsers();
      refreshPantryItems();
    }
  }, [currentUser, refreshRecipes, refreshUsers, refreshPantryItems]);

  // If user is not logged in, show login page
  if (!currentUser) {
    return (
      <GoogleOAuthProvider clientId={getDecryptedGoogleClientId()}>
        <LoginPage onLogin={handleLogin} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>Smart Pantry</h1>
          <div className="user-info">
            <img 
              src={currentUser.picture} 
              alt={currentUser.name} 
              className="user-avatar"
            />
            <span className="user-name">{currentUser.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
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
          <button
            className={`nav-btn ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => setCurrentPage('reports')}
          >
            <span className="nav-icon">📊</span>
            Reports
          </button>
          <button
            className={`nav-btn ${currentPage === 'user-details' ? 'active' : ''}`}
            onClick={() => setCurrentPage('user-details')}
          >
            <span className="nav-icon">👤</span>
            Profile
          </button>
        </nav>
      </header>

      <main className="App-main single-column-layout">
        {currentPage === 'recipes' && (
          <RecipesPage recipes={recipes} users={users} refreshRecipes={refreshRecipes} pantryItems={pantryItems} currentUser={currentUser} refreshPantryItems={refreshPantryItems} />
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
        {currentPage === 'reports' && (
          <ReportsPage />
        )}
        {currentPage === 'users' && (
          <UsersPage users={users} refreshUsers={refreshUsers} />
        )}
        {currentPage === 'user-details' && (
          <UserDetailsPage currentUser={currentUser} />
        )}
        {currentPage === 'user-details' && (
          <UserDetailsPage currentUser={currentUser} />
        )}
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
