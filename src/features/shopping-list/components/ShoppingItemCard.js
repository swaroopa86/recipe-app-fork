import React, { useState, useCallback } from 'react';
import { UNITS } from '../../../shared/constants/units';

const ShoppingItemCard = ({ 
  item, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onUpdate, 
  onDelete, 
  onTogglePurchased 
}) => {
  const [editForm, setEditForm] = useState({
    name: item.name,
    quantity: item.quantity.toString(),
    unit: item.unit
  });

  const handleSave = useCallback(() => {
    if (editForm.name.trim() && editForm.quantity.trim()) {
      onUpdate(item.id, {
        name: editForm.name.trim(),
        quantity: parseFloat(editForm.quantity) || 1,
        unit: editForm.unit
      });
      onSave();
    }
  }, [editForm, item.id, onUpdate, onSave]);

  const handleCancel = useCallback(() => {
    setEditForm({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit
    });
    onCancel();
  }, [item, onCancel]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" from your shopping list?`)) {
      onDelete(item.id);
    }
  }, [item.id, item.name, onDelete]);

  if (isEditing) {
    return (
      <div className="shopping-item-card editing">
        <div className="edit-form">
          <div className="form-row">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Item name"
              className="item-name-input"
              autoFocus
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              step="0.01"
              min="0"
              value={editForm.quantity}
              onChange={(e) => setEditForm(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="Quantity"
              className="quantity-input"
            />
            <select
              value={editForm.unit}
              onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
              className="unit-select"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div className="edit-actions">
            <button onClick={handleCancel} className="cancel-edit-btn">
              Cancel
            </button>
            <button onClick={handleSave} className="save-edit-btn">
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`shopping-item-card ${item.purchased ? 'purchased' : ''}`}>
      <div className="item-main">
        <div className="item-checkbox">
          <input
            type="checkbox"
            checked={item.purchased || false}
            onChange={() => onTogglePurchased(item.id)}
            className="purchase-checkbox"
          />
        </div>
        <div className="item-details">
          <div className="item-name-section">
            <span className={`item-name ${item.purchased ? 'purchased-text' : ''}`}>
              {item.name}
            </span>
          </div>
          {item.recipeSource && item.recipeSource !== 'Manual Entry' && (
            <div className="item-source">
              <span className="source-label">From:</span>
              <span className="source-text">{item.recipeSource}</span>
            </div>
          )}
        </div>
        <div className="item-actions">
          <button
            onClick={onEdit}
            className="edit-item-btn"
            title="Edit item"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="delete-item-btn"
            title="Delete item"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingItemCard;
