import React, { useState, useCallback } from 'react';
import ShoppingItemCard from './ShoppingItemCard';
import { fetchShoppingList, createShoppingListItem, updateShoppingListItem, deleteShoppingListItem } from '../../../shared/api';
import './ShoppingListPage.css';

const ShoppingListPage = ({ shoppingList, setShoppingList, pantryDetails }) => {
  const [editingId, setEditingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  
  // Calculate total items and estimated cost (placeholder)
  const totalItems = shoppingList.length;
  const purchasedItems = shoppingList.filter(item => item.purchased).length;

  // Group items into only 2 categories: Manual Entry and Recipe items
  const manualItems = shoppingList.filter(item => 
    !item.recipeSource || item.recipeSource === 'Manual Entry' || item.recipeSource === 'Other'
  );
  
  const recipeItems = shoppingList.filter(item => 
    item.recipeSource && item.recipeSource !== 'Manual Entry' && item.recipeSource !== 'Other'
  );

  // Handle item updates
  const updateItem = useCallback(async (itemId, updates) => {
    const item = shoppingList.find(item => item.id === itemId);
    if (!item || !pantryDetails?.pantryId) return;
    const updated = { ...item, ...updates, pantryId: pantryDetails.pantryId };
    await updateShoppingListItem(updated);
    const data = await fetchShoppingList(pantryDetails.pantryId);
    setShoppingList(data || []);
  }, [setShoppingList, shoppingList, pantryDetails?.pantryId]);

  // Handle item deletion
  const deleteItem = useCallback(async (itemId) => {
    await deleteShoppingListItem(itemId);
    const data = await fetchShoppingList();
    setShoppingList(data || []);
  }, [setShoppingList]);

  // Handle marking item as purchased/unpurchased
  const togglePurchased = useCallback(async (itemId) => {
    const item = shoppingList.find(item => item.id === itemId);
    if (!item) return;
    await updateItem(itemId, { purchased: !item.purchased });
  }, [updateItem, shoppingList]);

  // Handle clearing all items
  const clearAllItems = useCallback(async () => {
    await Promise.all(shoppingList.map(item => deleteShoppingListItem(item.id)));
    setShoppingList([]);
    setShowClearConfirm(false);
  }, [setShoppingList, shoppingList]);

  // Handle clearing only purchased items
  const clearPurchasedItems = useCallback(async () => {
    const toDelete = shoppingList.filter(item => item.purchased);
    await Promise.all(toDelete.map(item => deleteShoppingListItem(item.id)));
    const data = await fetchShoppingList();
    setShoppingList(data || []);
  }, [setShoppingList, shoppingList]);

  // Handle adding a new manual item
  const addManualItem = useCallback(async () => {
    if (!pantryDetails?.pantryId) return;
    
    const newItem = {
      id: Date.now() + Math.random(),
      name: 'New Item',
      quantity: 1,
      unit: 'item',
      recipeSource: 'Manual Entry',
      purchased: false,
      pantryId: pantryDetails.pantryId
    };
    await createShoppingListItem(newItem);
    // Fetch the latest shopping list
    const data = await fetchShoppingList(pantryDetails.pantryId);
    setShoppingList(data || []);
    // Find the latest item by id (in case backend modifies id)
    const found = (data || []).find(item => item.name === newItem.name && item.quantity === newItem.quantity && item.unit === newItem.unit && item.recipeSource === newItem.recipeSource && item.purchased === newItem.purchased);
    setEditingId(found ? found.id : newItem.id);
  }, [setShoppingList, pantryDetails?.pantryId]);
  return (
    <div className="shopping-list-container">
      <div className="shopping-list-header">
        <h2>🛒 Shopping List</h2>
        <p className="page-description">
          Manage your grocery shopping list with items from your selected recipes
        </p>
        
        {/* Shopping List Stats */}
        <div className="shopping-stats">
          <div className="stat-item">
            <span className="stat-number">{totalItems}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="shopping-actions">
          <button onClick={addManualItem} className="add-manual-btn">
            <span className="add-icon">+</span>
            Add Item
          </button>
          {purchasedItems > 0 && (
            <button onClick={clearPurchasedItems} className="clear-purchased-btn">
              Clear Purchased
            </button>
          )}
          {totalItems > 0 && (
            <button 
              onClick={() => setShowClearConfirm(true)} 
              className="clear-all-btn"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Clear All Items?</h3>
            <p>This will permanently delete all items from your shopping list. This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowClearConfirm(false)} 
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={clearAllItems} 
                className="confirm-btn"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Content */}
      <div className="shopping-list-content">
        {totalItems === 0 ? (
          <div className="empty-shopping-list">
            <span className="empty-icon">🛒</span>
            <h3>Your shopping list is empty!</h3>
            <p>Add items from recipes in the "Cooking For" section or add items manually.</p>
          </div>
        ) : (
          <div className="shopping-groups">
            {/* Manual Entry Section */}
            <div className="shopping-group">
              <h4 className="group-title">
                <span className="recipe-icon">✏️</span>
                Manual Entry
                <span className="item-count">({manualItems.length} item{manualItems.length !== 1 ? 's' : ''})</span>
              </h4>
              <div className="shopping-items">
                {manualItems.length === 0 ? (
                  <div className="empty-section">
                    <p>No items added yet. Click "Add Item" to add ingredients manually.</p>
                  </div>
                ) : (
                  manualItems.map(item => (
                    <ShoppingItemCard
                      key={item.id}
                      item={item}
                      isEditing={editingId === item.id}
                      onEdit={() => setEditingId(item.id)}
                      onSave={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                      onUpdate={updateItem}
                      onDelete={deleteItem}
                      onTogglePurchased={togglePurchased}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Recipe Items Section */}
            <div className="shopping-group">
              <h4 className="group-title">
                <span className="recipe-icon">🍳</span>
                From Recipes
                <span className="item-count">({recipeItems.length} item{recipeItems.length !== 1 ? 's' : ''})</span>
              </h4>
              <div className="shopping-items">
                {recipeItems.length === 0 ? (
                  <div className="empty-section">
                    <p>No recipe ingredients added yet. Add ingredients from recipes in the "Cooking For" section.</p>
                  </div>
                ) : (
                  recipeItems.map(item => (
                    <ShoppingItemCard
                      key={item.id}
                      item={item}
                      isEditing={editingId === item.id}
                      onEdit={() => setEditingId(item.id)}
                      onSave={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                      onUpdate={updateItem}
                      onDelete={deleteItem}
                      onTogglePurchased={togglePurchased}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListPage;
