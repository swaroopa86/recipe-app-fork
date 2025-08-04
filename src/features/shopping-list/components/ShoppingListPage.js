import React, { useState, useCallback, useEffect } from 'react';
import ShoppingItemCard from './ShoppingItemCard';
import './ShoppingListPage.css';

const ShoppingListPage = ({ shoppingList, setShoppingList }) => {
  const [editingId, setEditingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Consolidate duplicate ingredients on component mount
  useEffect(() => {
    const consolidateExistingDuplicates = () => {
      if (shoppingList.length === 0) return;
      
      const consolidatedList = [];
      
      shoppingList.forEach(item => {
        // Check if a similar item already exists in consolidated list
        const existingIndex = consolidatedList.findIndex(existing => {
          const existingName = existing.name.toLowerCase().trim();
          const itemName = item.name.toLowerCase().trim();
          
          return (existingName === itemName) ||
                 ((existingName.includes(itemName) || itemName.includes(existingName)) &&
                 existing.unit === item.unit);
        });
        
        if (existingIndex !== -1) {
          // Merge with existing item
          const existingItem = consolidatedList[existingIndex];
          const existingSources = existingItem.recipeSource.split(', ');
          const itemSources = item.recipeSource.split(', ');
          const combinedSources = [...new Set([...existingSources, ...itemSources])].join(', ');
          
          consolidatedList[existingIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + item.quantity,
            recipeSource: combinedSources,
            purchased: existingItem.purchased || item.purchased // Keep purchased status if either is purchased
          };
        } else {
          // Add as new item
          consolidatedList.push({ ...item });
        }
      });
      
      // Only update if consolidation actually changed something
      if (consolidatedList.length !== shoppingList.length) {
        setShoppingList(consolidatedList);
      }
    };
    
    consolidateExistingDuplicates();
  }, []); // Only run once on mount

  // Calculate total items and estimated cost (placeholder)
  const totalItems = shoppingList.length;
  const purchasedItems = shoppingList.filter(item => item.purchased).length;
  const remainingItems = totalItems - purchasedItems;

  // Group items by recipe source for better organization
  // For items from multiple recipes, show them in a "Multiple Recipes" group
  const groupedItems = shoppingList.reduce((groups, item) => {
    const sources = item.recipeSource ? item.recipeSource.split(', ') : ['Other'];
    
    if (sources.length > 1) {
      // Item from multiple recipes - put in "Multiple Recipes" group
      if (!groups['Multiple Recipes']) {
        groups['Multiple Recipes'] = [];
      }
      groups['Multiple Recipes'].push(item);
    } else {
      // Item from single recipe or manual entry
      const source = sources[0];
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(item);
    }
    return groups;
  }, {});

  // Handle item updates
  const updateItem = useCallback((itemId, updates) => {
    setShoppingList(prevList => 
      prevList.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, [setShoppingList]);

  // Handle item deletion
  const deleteItem = useCallback((itemId) => {
    setShoppingList(prevList => prevList.filter(item => item.id !== itemId));
  }, [setShoppingList]);

  // Handle marking item as purchased/unpurchased
  const togglePurchased = useCallback((itemId) => {
    updateItem(itemId, { purchased: !shoppingList.find(item => item.id === itemId)?.purchased });
  }, [updateItem, shoppingList]);

  // Handle clearing all items
  const clearAllItems = useCallback(() => {
    setShoppingList([]);
    setShowClearConfirm(false);
  }, [setShoppingList]);

  // Handle clearing only purchased items
  const clearPurchasedItems = useCallback(() => {
    setShoppingList(prevList => prevList.filter(item => !item.purchased));
  }, [setShoppingList]);

  // Handle adding a new manual item
  const addManualItem = useCallback(() => {
    const newItem = {
      id: Date.now() + Math.random(),
      name: 'New Item',
      quantity: 1,
      unit: 'item',
      recipeSource: 'Manual Entry',
      purchased: false
    };
    setShoppingList(prevList => [...prevList, newItem]);
    setEditingId(newItem.id);
  }, [setShoppingList]);

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
          <div className="stat-item">
            <span className="stat-number">{remainingItems}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{purchasedItems}</span>
            <span className="stat-label">Purchased</span>
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
            {Object.entries(groupedItems).map(([source, items]) => (
              <div key={source} className="shopping-group">
                <h4 className="group-title">
                  <span className="recipe-icon">📝</span>
                  {source}
                  <span className="item-count">({items.length} item{items.length !== 1 ? 's' : ''})</span>
                </h4>
                <div className="shopping-items">
                  {items.map(item => (
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListPage;
