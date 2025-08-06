import React from 'react';
import { UNITS } from '../../../shared/constants/units';

import { useState } from 'react';

const AddItemModal = ({
  showModal,
  currentItem,
  editingId,
  onClose,
  onSubmit,
  onNameChange,
  onQuantityChange,
  onUnitChange,
  onPriceChange
}) => {
  const [multiplyPrice, setMultiplyPrice] = useState(true);

  if (!showModal) return null;

  // Calculate costs
  const price = parseFloat(currentItem.price) || 0;
  const quantity = parseFloat(currentItem.quantity) || 0;
  const multipliedCost = price * quantity;

  return (
    <div className="form-overlay">
      <div className="form-overlay-content">
        <div className="form-header">
          <h2>{editingId ? 'Edit Pantry Item' : 'Add to Pantry'}</h2>
          <button onClick={onClose} className="close-form-btn">
            <span>&times;</span>
          </button>
        </div>
        <form onSubmit={onSubmit} className="pantry-form">
          <div className="form-group">
            <label htmlFor="ingredient-name">Ingredient Name:</label>
            <input
              id="ingredient-name"
              type="text"
              value={currentItem.name}
              onChange={onNameChange}
              placeholder="Enter ingredient name"
              required
              autoComplete="off"
            />
          </div>

          <div className="quantity-unit-group">
            <div className="form-group">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={currentItem.quantity}
                onChange={onQuantityChange}
                placeholder="0"
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit:</label>
              <select
                id="unit"
                value={currentItem.unit}
                onChange={onUnitChange}
                className="unit-select"
              >
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="price">Estimated Price:</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={currentItem.price || ''}
              onChange={onPriceChange}
              placeholder="0.00"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={multiplyPrice}
                onChange={e => setMultiplyPrice(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Multiply price by quantity
            </label>
            <div style={{ marginTop: 6, color: '#555', fontSize: '0.97em' }}>
              Cost to log: <b>${multiplyPrice ? multipliedCost.toFixed(2) : price.toFixed(2)}</b>
              <br />
              (Price: ${price.toFixed(2)}{multiplyPrice ? ` × Qty: ${quantity} = $${multipliedCost.toFixed(2)}` : ''})
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-pantry-item">
              {editingId ? 'Update Item' : 'Add to Pantry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;