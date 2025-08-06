import React, { useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';
import { fetchRecipes, fetchUsers, fetchPantryItems, fetchShoppingList, fetchPantryDetails, getPendingInvitation } from '../shared/api';
import { RecipesPage, UsersPage, UserDetailsPage, PantryPage, CookingForPage, ShoppingListPage, LoginPage, ReportsPage, PantrySetupPage, InviteOthersPage, InvitationResponsePage, Chatbot, CaloricGoalPage } from '../features';
import { getDecryptedGoogleClientId } from '../utils/encryption';
import './App.css';
import { getMacros } from '../features/recipes/components/RecipesPage';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [shoppingList, setShoppingList] = useLocalStorage('shoppingList', []);
  const [currentPage, setCurrentPage] = useState('recipes'); // 'recipes', 'users', 'pantry', 'cooking-for', 'shopping-list', 'reports', or 'user-details'
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);
  const [pantryDetails, setPantryDetails] = useState(null);
  const [showPantrySetup, setShowPantrySetup] = useState(false);
  const [showInviteOthers, setShowInviteOthers] = useState(false);
  const [showInvitationResponse, setShowInvitationResponse] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState(null);
  const [isLoadingPantryDetails, setIsLoadingPantryDetails] = useState(false);
  const [macrosByRecipe, setMacrosByRecipe] = useState({});

    const handleLogin = async (user) => {
    setCurrentUser(user);
    setIsLoadingPantryDetails(true);
    
    // Check if user has pantry details
    try {
      const details = await fetchPantryDetails(user.id);
      setPantryDetails(details);
      setShowPantrySetup(false);
      setShowInvitationResponse(false);
    } catch (error) {
      // If no pantry details found, check for pending invitations
      try {
        const invitationData = await getPendingInvitation(user.email);
        if (invitationData) {
          setPendingInvitation(invitationData);
          setShowInvitationResponse(true);
          setShowPantrySetup(false);
        } else {
          // No pending invitations, show setup page
          setShowPantrySetup(true);
          setShowInvitationResponse(false);
        }
             } catch (invitationError) {
         // Error checking for pending invitations
         // Fallback to setup page if invitation check fails
         setShowPantrySetup(true);
         setShowInvitationResponse(false);
       }
    } finally {
      setIsLoadingPantryDetails(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPantryDetails(null);
    setShowPantrySetup(false);
    setShowInviteOthers(false);
    setShowInvitationResponse(false);
    setPendingInvitation(null);
    setIsLoadingPantryDetails(false);
  };

  const refreshRecipes = useCallback(async () => {
    if (pantryDetails?.pantryId) {
      const data = await fetchRecipes(pantryDetails.pantryId);
      setRecipes(data);
    } else {
      setRecipes([]);
    }
  }, [pantryDetails?.pantryId]);

  const refreshUsers = useCallback(async () => {
    if (pantryDetails?.pantryId) {
      const data = await fetchUsers(pantryDetails.pantryId);
      setUsers(data.map(user => ({
        ...user,
        allergens: new Set(user.allergens || [])
      })));
    } else {
      setUsers([]);
    }
  }, [pantryDetails?.pantryId]);

  const refreshPantryItems = useCallback(async () => {
    if (pantryDetails?.pantryId) {
      const data = await fetchPantryItems(pantryDetails.pantryId);
      setPantryItems(data);
    } else {
      setPantryItems([]);
    }
  }, [pantryDetails?.pantryId]);

  const refreshShoppingList = useCallback(async () => {
    if (pantryDetails?.pantryId) {
      const data = await fetchShoppingList(pantryDetails.pantryId);
      setShoppingList(data || []);
    } else {
      setShoppingList([]);
    }
  }, [pantryDetails?.pantryId, setShoppingList]);

  useEffect(() => {
    if (currentUser && !showPantrySetup && !showInviteOthers && !showInvitationResponse) {
      refreshRecipes();
      refreshUsers();
      refreshPantryItems();
      refreshShoppingList();
    }
  }, [currentUser, showPantrySetup, showInviteOthers, showInvitationResponse, refreshRecipes, refreshUsers, refreshPantryItems, refreshShoppingList]);

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

  // If user is not logged in, show login page
  if (!currentUser) {
    return (
      <GoogleOAuthProvider clientId={getDecryptedGoogleClientId()}>
        <LoginPage onLogin={handleLogin} />
      </GoogleOAuthProvider>
    );
  }

  // If user needs to set up pantry details, show setup page
  if (showPantrySetup) {
    return (
      <PantrySetupPage 
        currentUser={currentUser} 
        onComplete={async () => {
          setShowPantrySetup(false);
          setIsLoadingPantryDetails(true);
          try {
            // Refresh pantry details after setup
            const details = await fetchPantryDetails(currentUser.id);
            setPantryDetails(details);
            // Show invite others page after pantry setup
            setShowInviteOthers(true);
          } catch (error) {
            console.error('Error fetching pantry details after setup:', error);
            // If fetching fails, still proceed to invite others page
            setShowInviteOthers(true);
          } finally {
            setIsLoadingPantryDetails(false);
          }
        }} 
      />
    );
  }

  // If user needs to respond to an invitation, show invitation response page
  if (showInvitationResponse && pendingInvitation) {
    return (
      <InvitationResponsePage 
        invitation={pendingInvitation.invitation}
        pantryDetails={pendingInvitation.pantryDetails}
        currentUser={currentUser}
        onAccept={(acceptedPantryDetails) => {
          setPantryDetails(acceptedPantryDetails);
          setShowInvitationResponse(false);
          setPendingInvitation(null);
        }}
        onDecline={() => {
          setShowInvitationResponse(false);
          setPendingInvitation(null);
          setShowPantrySetup(true);
        }}
      />
    );
  }

  // If user needs to invite others, show invite page
  if (showInviteOthers) {
    return (
      <InviteOthersPage 
        pantryDetails={pantryDetails}
        onComplete={() => {
          setShowInviteOthers(false);
        }} 
      />
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>
            {isLoadingPantryDetails ? (
              'Loading your pantry...'
            ) : pantryDetails ? (
              <>
                Smart pantry: <span className="pantry-name">{pantryDetails.pantryName}</span>
              </>
            ) : (
              'Smart Pantry'
            )}
          </h1>
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
          <button
            className={`nav-btn ${currentPage === 'calorie-goal' ? 'active' : ''}`}
            onClick={() => setCurrentPage('calorie-goal')}
          >
            <span className="nav-icon">🔥</span>
            Calorie Goal
          </button>
        </nav>
      </header>

      <main className="App-main single-column-layout">
        {currentPage === 'recipes' && (
          <RecipesPage
            recipes={recipes}
            users={users}
            refreshRecipes={refreshRecipes}
            pantryItems={pantryItems}
            currentUser={currentUser}
            refreshPantryItems={refreshPantryItems}
            macrosByRecipe={macrosByRecipe}
            pantryDetails={pantryDetails}
          />
        )}
        {currentPage === 'cooking-for' && (
          <CookingForPage
            recipes={recipes}
            users={users}
            pantryItems={pantryItems}
            refreshPantryItems={refreshPantryItems}
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
            macrosByRecipe={macrosByRecipe}
            pantryDetails={pantryDetails}
          />
        )}
        {currentPage === 'pantry' && (
          <PantryPage 
            pantryItems={pantryItems} 
            refreshPantryItems={refreshPantryItems}
            pantryDetails={pantryDetails}
          />
        )}
        {currentPage === 'shopping-list' && (
          <ShoppingListPage 
            shoppingList={shoppingList} 
            setShoppingList={setShoppingList}
            pantryDetails={pantryDetails}
          />
        )}
        {currentPage === 'reports' && (
          <ReportsPage 
            macrosByRecipe={macrosByRecipe} 
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage === 'users' && (
          <UsersPage 
            users={users} 
            refreshUsers={refreshUsers}
            pantryDetails={pantryDetails}
          />
        )}
        {currentPage === 'user-details' && (
          <UserDetailsPage currentUser={currentUser} />
        )}
        {currentPage === 'calorie-goal' && (
          <CaloricGoalPage currentUser={currentUser} />
        )}
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
