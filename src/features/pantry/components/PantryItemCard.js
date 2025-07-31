import React from 'react';

const PantryItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="pantry-item-card">
      <div className="pantry-item-header">
        <h3>{item.name}</h3>
        <div className="pantry-item-actions">
          <button
            onClick={() => onEdit(item)}
            className="edit-item"
            title="Edit item"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="delete-item"
            title="Delete item"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="pantry-item-quantity">
        <span className="quantity">{item.quantity}</span>
        <span className="unit">{item.unit}</span>
      </div>
    </div>
  );
};

export default PantryItemCard; 