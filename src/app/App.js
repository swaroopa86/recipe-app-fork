import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useLocalStorage, userSerializer } from '../shared';
import { RecipesPage, UsersPage, UserDetailsPage, PantryPage, CookingForPage, ShoppingListPage, LoginPage } from '../features';
import './App.css';

function App() {
  const [recipes, setRecipes] = useLocalStorage('recipes', []);
  const [users, setUsers] = useLocalStorage('users', [], userSerializer);
  const [pantryItems, setPantryItems] = useLocalStorage('pantryItems', []);
  const [shoppingList, setShoppingList] = useLocalStorage('shoppingList', []);
  const [currentPage, setCurrentPage] = useState('recipes'); // 'recipes', 'users', 'pantry', 'cooking-for', or 'shopping-list'
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);

    const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If user is not logged in, show login page
  if (!currentUser) {
    return (
      <GoogleOAuthProvider clientId="723663086587-drddqfg1vht12the6o24tvr2oh2uvfho.apps.googleusercontent.com">
        <LoginPage onLogin={handleLogin} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>Recipe Creator</h1>
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
          <RecipesPage recipes={recipes} setRecipes={setRecipes} users={users} />
        )}
        {currentPage === 'cooking-for' && (
          <CookingForPage 
            recipes={recipes} 
            users={users} 
            pantryItems={pantryItems} 
            setPantryItems={setPantryItems}
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
          />
        )}
        {currentPage === 'pantry' && (
          <PantryPage pantryItems={pantryItems} setPantryItems={setPantryItems} />
        )}
        {currentPage === 'shopping-list' && (
          <ShoppingListPage shoppingList={shoppingList} setShoppingList={setShoppingList} />
        )}
        {currentPage === 'users' && (
          <UsersPage users={users} setUsers={setUsers} />
        )}
        {currentPage === 'user-details' && (
          <UserDetailsPage currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}

export default App;
