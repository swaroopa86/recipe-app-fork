import React, { useState, useCallback } from 'react';
import { ALLERGENS } from '../../../shared/constants/allergens';
import './UsersPage.css';

const UsersPage = ({ users, setUsers }) => {
  const [currentUser, setCurrentUser] = useState({
    name: '',
    allergens: new Set()
  });

  // User management functions
  const handleUserNameChange = useCallback((e) => {
    const value = e.target.value;
    setCurrentUser(prev => ({
      ...prev,
      name: value
    }));
  }, []);

  const toggleUserAllergen = useCallback((allergenType) => {
    setCurrentUser(prev => {
      const newAllergens = new Set(prev.allergens);
      if (newAllergens.has(allergenType)) {
        newAllergens.delete(allergenType);
      } else {
        newAllergens.add(allergenType);
      }
      return {
        ...prev,
        allergens: newAllergens
      };
    });
  }, []);

  const selectAllUserAllergens = useCallback(() => {
    setCurrentUser(prev => ({
      ...prev,
      allergens: new Set(Object.keys(ALLERGENS))
    }));
  }, []);

  const clearAllUserAllergens = useCallback(() => {
    setCurrentUser(prev => ({
      ...prev,
      allergens: new Set()
    }));
  }, []);

  const handleUserSubmit = useCallback((e) => {
    e.preventDefault();
    if (currentUser.name.trim()) {
      const newUser = {
        ...currentUser,
        id: Date.now()
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser({
        name: '',
        allergens: new Set()
      });
    }
  }, [currentUser, setUsers]);

  const deleteUser = useCallback((id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  }, [setUsers]);

  return (
    <div className="users-container">
      <div className="users-form-section">
        <div className="users-form-container">
          <h2>Add New User</h2>
          <form onSubmit={handleUserSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="user-name">Name:</label>
              <input
                id="user-name"
                type="text"
                value={currentUser.name}
                onChange={handleUserNameChange}
                placeholder="Enter user name"
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>User's Allergens:</label>
              <div className="user-allergen-actions">
                <button type="button" onClick={selectAllUserAllergens} className="select-all-btn">
                  Select All
                </button>
                <button type="button" onClick={clearAllUserAllergens} className="clear-all-btn">
                  Clear All
                </button>
                <span className="selected-count">
                  {currentUser.allergens.size} of {Object.keys(ALLERGENS).length} selected
                </span>
              </div>
              
              <div className="user-allergen-grid">
                {Object.keys(ALLERGENS).map(allergenType => (
                  <label key={allergenType} className="user-allergen-checkbox">
                    <input
                      type="checkbox"
                      checked={currentUser.allergens.has(allergenType)}
                      onChange={() => toggleUserAllergen(allergenType)}
                    />
                    <span className="checkmark"></span>
                    <span className="allergen-name">{allergenType}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-user">
              Add User
            </button>
          </form>
        </div>
      </div>

      <div className="users-list-section">
        <h2>Registered Users ({users.length})</h2>
        {users.length === 0 ? (
          <p className="no-users">No users registered yet. Add your first user above!</p>
        ) : (
          <div className="users-list">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <div className="user-info">
                    <h3>{user.name}</h3>
                  </div>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="delete-user"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="user-allergens">
                  <h4>Allergens ({user.allergens.size}):</h4>
                  {user.allergens.size === 0 ? (
                    <p className="no-allergens">No allergens specified</p>
                  ) : (
                    <div className="user-allergen-tags">
                      {[...user.allergens].map(allergen => (
                        <span key={allergen} className="user-allergen-tag">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage; 