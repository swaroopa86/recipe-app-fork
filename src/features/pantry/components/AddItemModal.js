import React from 'react';
import { UNITS } from '../../../shared/constants/units';

const AddItemModal = ({
  showModal,
  currentItem,
  editingId,
  onClose,
  onSubmit,
  onNameChange,
  onQuantityChange,
  onUnitChange
}) => {
  if (!showModal) return null;

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