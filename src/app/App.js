import React, { useState } from 'react';
import { useLocalStorage, userSerializer } from '../shared';
import { RecipesPage, UsersPage, PantryPage, CookingForPage } from '../features';
import './App.css';

function App() {
  const [recipes, setRecipes] = useLocalStorage('recipes', []);
  const [users, setUsers] = useLocalStorage('users', [], userSerializer);
  const [pantryItems, setPantryItems] = useLocalStorage('pantryItems', []);
  const [currentPage, setCurrentPage] = useState('recipes'); // 'recipes', 'users', 'pantry', 'cooking-for'

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
          <RecipesPage recipes={recipes} setRecipes={setRecipes} users={users} />
        )}
        {currentPage === 'cooking-for' && (
          <CookingForPage recipes={recipes} users={users} pantryItems={pantryItems} />
        )}
        {currentPage === 'pantry' && (
          <PantryPage pantryItems={pantryItems} setPantryItems={setPantryItems} />
        )}
        {currentPage === 'users' && (
          <UsersPage users={users} setUsers={setUsers} />
        )}

      </main>
    </div>
  );
}

export default App;
