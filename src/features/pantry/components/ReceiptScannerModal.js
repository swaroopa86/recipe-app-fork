import React from 'react';
import { UNITS } from '../../../shared/constants/units';

const ImageUploadSection = ({
  uploadedImage,
  isProcessingOCR,
  ocrProgress,
  ocrStatus,
  onImageUpload,
  onClearImage
}) => (
  <div className="image-upload-section">
    <div className="form-group">
      <label htmlFor="receipt-image">Upload Receipt Image:</label>
      <div className="image-upload-area">
        <input
          id="receipt-image"
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          disabled={isProcessingOCR}
          className="image-input"
        />
        <div className="upload-instructions">
          <div className="upload-icon">📸</div>
          <div className="upload-text">
            <strong>Click to upload receipt image</strong>
            <br />
            <small>
              📋 Tips: Ensure receipt is flat, well-lit, and all text is readable
              <br />
              💡 Supports: JPG, PNG, WEBP (max 10MB)
            </small>
          </div>
        </div>
      </div>
    </div>

    {uploadedImage && (
      <div className="uploaded-image-preview">
        <div className="image-preview-header">
          <span>📷 {uploadedImage.name}</span>
          <div className="image-info">
            <small>{(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</small>
          </div>
          <button
            type="button"
            onClick={onClearImage}
            className="clear-image"
            disabled={isProcessingOCR}
            title="Remove image and start over"
          >
            ✕
          </button>
        </div>
        <img
          src={URL.createObjectURL(uploadedImage)}
          alt="Receipt preview"
          className="receipt-image-preview"
        />
      </div>
    )}

    {isProcessingOCR && (
      <div className="ocr-progress">
        <div className="progress-header">
          <span>🔍 Processing Receipt Image...</span>
          <span className="progress-percentage">{ocrProgress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${ocrProgress}%` }}
          ></div>
        </div>
        <div className="progress-status">{ocrStatus}</div>
      </div>
    )}

    {ocrStatus && !isProcessingOCR && (
      <div className={`ocr-result ${ocrStatus.includes('✅') ? 'success' : ocrStatus.includes('⚠️') ? 'warning' : 'error'}`}>
        {ocrStatus}
      </div>
    )}
  </div>
);

const ParsedItemsList = ({
  parsedItems,
  selectedItems,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onSaveItems,
  onClose,
  onItemQuantityChange,
  onItemUnitChange,
  onItemPriceChange
}) => (
  <div className="parsed-items-section">
    <div className="parsed-items-header">
      <h3>📦 Found {parsedItems.length} items:</h3>
      <div className="selection-buttons">
        <button type="button" onClick={onSelectAll} className="select-all">
          Select All
        </button>
        <button type="button" onClick={onDeselectAll} className="deselect-all">
          Deselect All
        </button>
      </div>
    </div>

    <div className="parsed-items-list">
      {parsedItems.map(item => (
        <div key={item.id} className={`parsed-item ${selectedItems.has(item.id) ? 'selected' : ''}`}>
          <div className="parsed-item-content">
            <div className="parsed-item-checkbox-section">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => onToggleSelection(item.id)}
                className="parsed-item-checkbox"
              />
            </div>

            <div className="parsed-item-details">
              <div className="parsed-item-name">{item.name}</div>
              <div className="parsed-item-quantity-controls">
                <div className="quantity-input-group">
                  <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => onItemQuantityChange(item.id, e.target.value)}
                    className="quantity-input"
                    placeholder="Qty"
                  />
                </div>

                <div className="unit-select-group">
                  <label htmlFor={`unit-${item.id}`} className="sr-only">Unit</label>
                  <select
                    id={`unit-${item.id}`}
                    value={item.unit}
                    onChange={(e) => onItemUnitChange(item.id, e.target.value)}
                    className="unit-select"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="quantity-unit-group">
                  <div className="price-input-group">
                    <label htmlFor={`price-${item.id}`} className="sr-only">Price</label>
                    <input
                      id={`price-${item.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price || ''}
                      onChange={(e) => onItemPriceChange(item.id, e.target.value)}
                      className="quantity-input" // use same class as quantity for consistent style
                      placeholder="Price"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="save-to-pantry-section">
      <div className="save-summary">
        <h4>💾 Save to Your Pantry:</h4>
        <p>
          {selectedItems.size > 0
            ? `${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''} selected and ready to save`
            : 'Select items above to save them to your pantry'
          }
        </p>
        <small className="edit-hint">💡 Tip: You can edit quantities and units before saving!</small>
      </div>

      <div className="save-actions">
        <button
          type="button"
          onClick={onSaveItems}
          disabled={selectedItems.size === 0}
          className="save-to-pantry-btn"
        >
          💾 Save {selectedItems.size || 0} Item{selectedItems.size !== 1 ? 's' : ''} to Pantry
        </button>

        <button type="button" onClick={onClose} className="cancel-btn secondary">
          Close Scanner
        </button>
      </div>
    </div>
  </div>
);


const ReceiptScannerModal = ({
  showModal,
  showSuccessMessage,
  successMessage,
  receiptText,
  parsedItems,
  selectedItems,
  uploadedImage,
  isProcessingOCR,
  ocrProgress,
  ocrStatus,
  onClose,
  onTextChange,
  onImageUpload,
  onClearImage,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onSaveItems,
  onItemQuantityChange,
  onItemUnitChange,
  onItemPriceChange
}) => {
  if (!showModal) return null;

  return (
    <div className="form-overlay">
      <div className="form-overlay-content receipt-form-content">
        <div className="form-header">
          <h2>📄 Scan Receipt</h2>
          <button onClick={onClose} className="close-form-btn">
            <span>&times;</span>
          </button>
        </div>
        <div className="receipt-form">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <ImageUploadSection
            uploadedImage={uploadedImage}
            isProcessingOCR={isProcessingOCR}
            ocrProgress={ocrProgress}
            ocrStatus={ocrStatus}
            onImageUpload={onImageUpload}
            onClearImage={onClearImage}
          />

          <div className="divider">
            <span>OR</span>
          </div>

          {/* Text Input Section */}
          <div className="form-group">
            <label htmlFor="receipt-text">Paste Receipt Text:</label>
            <textarea
              id="receipt-text"
              value={receiptText}
              onChange={onTextChange}
              placeholder="Paste your receipt text here or upload an image above...&#10;&#10;Example formats:&#10;BANANAS 2.18 lbs @ $0.68/lb $1.48&#10;3 Honeycrisp Apples $4.99&#10;MILK WHOLE GALLON $3.49&#10;GROUND BEEF 1.25 LB $7.49"
              rows={8}
              className="receipt-textarea"
              disabled={isProcessingOCR}
            />
          </div>

          {parsedItems.length > 0 && (
            <ParsedItemsList
              parsedItems={parsedItems}
              selectedItems={selectedItems}
              onToggleSelection={onToggleSelection}
              onSelectAll={onSelectAll}
              onDeselectAll={onDeselectAll}
              onSaveItems={onSaveItems}
              onClose={onClose}
              onItemQuantityChange={onItemQuantityChange}
              onItemUnitChange={onItemUnitChange}
              onItemPriceChange={onItemPriceChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScannerModal; 