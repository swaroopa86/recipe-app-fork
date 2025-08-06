import React, { useState, useCallback } from 'react';
import AddItemModal from './AddItemModal';
import ReceiptScannerModal from './ReceiptScannerModal';
import PantryItemCard from './PantryItemCard';
import { useOCR } from '../../../shared/hooks/useOCR';
import { parseReceiptText } from '../../../shared/utils/receiptParser';
import { createPantryItem, updatePantryItem, deletePantryItem, fetchPantryItems } from '../../../shared/api';
import { logPriceHistory } from '../../../shared/api/priceHistory';
import './PantryPage.css';

const PantryPage = ({ pantryItems, refreshPantryItems, pantryDetails }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Item management state
  const [currentItem, setCurrentItem] = useState({
    name: '',
    quantity: '',
    unit: 'cups',
    price: '' // Only for user input, not for pantryItems display
  });
  const [editingId, setEditingId] = useState(null);
  const [multiplyPrice, setMultiplyPrice] = useState(true);
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  
  // Receipt scanning states
  const [receiptText, setReceiptText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // OCR hook
  const { 
    uploadedImage, 
    isProcessingOCR, 
    ocrProgress, 
    ocrStatus, 
    handleImageUpload, 
    clearImage, 
    updateStatus 
  } = useOCR();

  // Item form handlers
  const handleNameChange = useCallback((e) => {
    setCurrentItem(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleQuantityChange = useCallback((e) => {
    setCurrentItem(prev => ({ ...prev, quantity: e.target.value }));
  }, []);

  const handleUnitChange = useCallback((e) => {
    setCurrentItem(prev => ({ ...prev, unit: e.target.value }));
  }, []);

  const handlePriceChange = useCallback((e) => {
    setCurrentItem(prev => ({ ...prev, price: e.target.value }));
  }, []);

  const resetCurrentItem = useCallback(() => {
    setCurrentItem({ name: '', quantity: '', unit: 'cups', price: '' });
    setEditingId(null);
  }, []);


  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (currentItem.name.trim() && currentItem.quantity.trim() && pantryDetails?.pantryId) {
      try {
        // Determine the price to log
        let priceToLog = currentItem.price !== '' ? parseFloat(currentItem.price) : null;
        const quantity = parseFloat(currentItem.quantity) || 0;
        if (multiplyPrice && priceToLog !== null) {
          priceToLog = priceToLog * quantity;
        }
        if (editingId) {
          // Update existing item
          await updatePantryItem({ ...currentItem, id: editingId, price: priceToLog, pantryId: pantryDetails.pantryId });
          setEditingId(null);
        } else {
          // Group by name (case-insensitive, trimmed)
          const normalizedName = currentItem.name.trim().toLowerCase();
          const existing = pantryItems.find(item => item.name.trim().toLowerCase() === normalizedName);
          if (existing) {
            // Sum quantity, update price to new value
            const updatedQuantity = (parseFloat(existing.quantity) || 0) + (parseFloat(currentItem.quantity) || 0);
            await updatePantryItem({
              ...existing,
              quantity: updatedQuantity.toString(),
              price: priceToLog
            });
          } else {
            // Add new item
            const newItem = {
              ...currentItem,
              id: Date.now().toString(),
              price: priceToLog,
              pantryId: pantryDetails.pantryId
            };
            await createPantryItem(newItem);
          }
        }
        refreshPantryItems(); // Refresh pantry items after creation/update
      } catch (error) {
        // Error saving pantry item
        alert('Failed to save pantry item. Please try again.');
      }
      
      resetCurrentItem();
      setShowAddForm(false);
    }
    setIsSubmitting(false);
  }, [currentItem, editingId, refreshPantryItems, resetCurrentItem, pantryDetails?.pantryId, multiplyPrice, isSubmitting]);


  const editItem = useCallback((item) => {
    setCurrentItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: '' // No price from pantryItems, only for new input
    });
    setEditingId(item.id);
    setShowAddForm(true);
  }, []);

  const deleteItem = useCallback(async (id) => {
    try {
      await deletePantryItem(id);
      refreshPantryItems(); // Refresh pantry items after deletion
    } catch (error) {
      // Error deleting pantry item
      alert('Failed to delete pantry item. Please try again.');
    }
  }, [refreshPantryItems]);

  const clearPantry = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear your entire pantry? This action cannot be undone.')) {
      try {
        // Fetch all pantry items and delete them one by one
        // This is not ideal for very large datasets, but works for now
        const allItems = await fetchPantryItems();
        for (const item of allItems) {
          await deletePantryItem(item.id);
        }
        refreshPantryItems(); // Refresh after clearing
      } catch (error) {
        // Error clearing pantry
        alert('Failed to clear pantry. Please try again.');
      }
    }
  }, [refreshPantryItems]);

  // Image clear handler (move above all usages)
  const handleClearImage = useCallback(() => {
    clearImage();
    setReceiptText('');
    setParsedItems([]);
    setSelectedItems(new Set());
    setShowSuccessMessage(false);
  }, [clearImage]);

  // Modal control functions
  const toggleAddForm = useCallback(() => {
    setShowAddForm(prev => !prev);
    if (showAddForm) {
      resetCurrentItem();
    }
  }, [showAddForm, resetCurrentItem]);

  const toggleReceiptForm = useCallback(() => {
    setShowReceiptForm(prev => !prev);
    if (showReceiptForm) {
      // Clear the parsed items but keep the form open for more scanning
      setReceiptText('');
      setParsedItems([]);
      setSelectedItems(new Set());
      handleClearImage();
    }
  }, [showReceiptForm, handleClearImage]);

  // Receipt text handling
  const handleReceiptTextChange = useCallback((e) => {
    const text = e.target.value;
    setReceiptText(text);
    
    if (text.trim()) {
      const items = parseReceiptText(text);
      setParsedItems(items);
      setSelectedItems(new Set(items.map(item => item.id)));
      updateStatus('', items.length);
    } else {
      setParsedItems([]);
      setSelectedItems(new Set());
    }
    setShowSuccessMessage(false);
  }, [updateStatus]);

  // Image upload handling
  const handleImageUploadWrapper = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Clear previous results
      setReceiptText('');
      setParsedItems([]);
      setSelectedItems(new Set());
      setShowSuccessMessage(false);

      await handleImageUpload(file, (extractedText) => {
        setReceiptText(extractedText);
        const items = parseReceiptText(extractedText);
        setParsedItems(items);
        setSelectedItems(new Set(items.map(item => item.id)));
        updateStatus('', items.length);
      });
    } catch (error) {
              // Image upload failed
    }
  }, [handleImageUpload, updateStatus]);

  
  // Item selection handlers
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedItems(new Set(parsedItems.map(item => item.id)));
  }, [parsedItems]);

  const deselectAllItems = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Item editing handlers for parsed items
  const handleItemQuantityChange = useCallback((itemId, newQuantity) => {
    setParsedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  }, []);

  const handleItemUnitChange = useCallback((itemId, newUnit) => {
    setParsedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, unit: newUnit }
        : item
    ));
  }, []);

  const handleItemPriceChange = useCallback((itemId, newPrice) => {
    setParsedItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, price: newPrice }
        : item
    ));
  }, []);

  // Save items to pantry
  // Utility: deduplicate array of items by name, unit, price, quantity
  function deduplicateBatches(items) {
    const unique = [];
    const seen = new Set();
    for (const item of items) {
      const key = [
        item.name.trim().toLowerCase(),
        item.unit,
        item.price !== undefined && item.price !== '' ? Number(item.price) : null,
        item.quantity
      ].join('|');
      if (!seen.has(key)) {
        unique.push(item);
        seen.add(key);
      }
    }
    return unique;
  }

  const addSelectedItemsToPantry = useCallback(async () => {
    // Filter selected, then deduplicate batches
    const selected = parsedItems.filter(item => selectedItems.has(item.id));
    // Only allow batches with a valid price
    const itemsToAdd = deduplicateBatches(selected).filter(
      item => item.price !== undefined && item.price !== '' && !isNaN(Number(item.price))
    );

    if (itemsToAdd.length === 0 || !pantryDetails?.pantryId) {
      return;
    }
    let addedCount = 0;
    let updatedCount = 0;
    for (const receiptItem of itemsToAdd) {
      const existingItem = pantryItems.find(
        item => item.name.toLowerCase() === receiptItem.name.toLowerCase() &&
                item.unit === receiptItem.unit
      );
      const price = receiptItem.price !== undefined && receiptItem.price !== '' ? Number(receiptItem.price) : null;
      if (existingItem) {
        // Update existing item
        const increment = parseFloat(receiptItem.quantity);
        const updatedQuantity = (parseFloat(existingItem.quantity) || 0) + increment;
        const updatedItem = {
          ...existingItem,
          quantity: updatedQuantity.toString(),
          pantryId: pantryDetails.pantryId
        };
        await updatePantryItem(updatedItem);
        // Only log the incremental batch, not the new total!
        await logPriceHistory({ pantry_item_id: existingItem.id, price, quantity: increment });
        updatedCount++;
      } else {
        // Add new item
        const newId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
        const newItem = {
          ...receiptItem,
          id: newId,
          pantryId: pantryDetails.pantryId
        };
        await createPantryItem(newItem);
        await logPriceHistory({ pantry_item_id: newId, price, quantity: receiptItem.quantity });
        addedCount++;
      }
    }
    refreshPantryItems();
    const totalItems = itemsToAdd.length;
    let message = `✅ Successfully saved ${totalItems} item${totalItems !== 1 ? 's' : ''} to your pantry!`;
    if (updatedCount > 0 && addedCount > 0) {
      message += ` (${addedCount} new, ${updatedCount} updated)`;
    } else if (updatedCount > 0) {
      message += ` (${updatedCount} updated with new quantities)`;
    }

    setSuccessMessage(message);
    setShowSuccessMessage(true);
    // Optionally clear receipt state
    setReceiptText('');
    setParsedItems([]);
    setSelectedItems(new Set());
    handleClearImage();
  }, [parsedItems, selectedItems, pantryItems, refreshPantryItems, handleClearImage, pantryDetails?.pantryId]);

  return (
    <div className="pantry-page-container">
      {/* Main pantry section */}
      <div className="pantry-main-section">
        <div className="pantry-header-section">
          <h2>My Pantry ({pantryItems.length} items)</h2>
          <div className="pantry-action-buttons">
            <button onClick={toggleAddForm} className="add-pantry-btn">
              <span className="add-icon">+</span>
              Add to Pantry
            </button>
            <button onClick={toggleReceiptForm} className="scan-receipt-btn">
              <span className="scan-icon">📄</span>
              Scan Receipt
            </button>
            {pantryItems.length > 0 && (
              <button onClick={clearPantry} className="clear-pantry-btn">
                Clear All
              </button>
            )}
          </div>
        </div>

        {pantryItems.length === 0 ? (
          <div className="no-pantry-items-fullwidth">
            <span className="empty-icon">🥫</span>
            <h3>Your pantry is empty!</h3>
            <p>Add ingredients manually or scan a receipt to get started.</p>
          </div>
        ) : (
          <div className="pantry-grid">
            {pantryItems
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => (
                <PantryItemCard
                  key={item.id}
                  item={item}
                  onEdit={editItem}
                  onDelete={deleteItem}
                />
              ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        showModal={showAddForm}
        currentItem={currentItem}
        editingId={editingId}
        onClose={toggleAddForm}
        onSubmit={handleSubmit}
        onNameChange={handleNameChange}
        onQuantityChange={handleQuantityChange}
        onUnitChange={handleUnitChange}
        onPriceChange={handlePriceChange}
        multiplyPrice={multiplyPrice}
        setMultiplyPrice={setMultiplyPrice}
      />

      {/* Receipt Scanner Modal */}
      <ReceiptScannerModal
        showModal={showReceiptForm}
        showSuccessMessage={showSuccessMessage}
        successMessage={successMessage}
        receiptText={receiptText}
        parsedItems={parsedItems}
        selectedItems={selectedItems}
        uploadedImage={uploadedImage}
        isProcessingOCR={isProcessingOCR}
        ocrProgress={ocrProgress}
        ocrStatus={ocrStatus}
        onClose={toggleReceiptForm}
        onTextChange={handleReceiptTextChange}
        onImageUpload={handleImageUploadWrapper}
        onClearImage={handleClearImage}
        onToggleSelection={toggleItemSelection}
        onSelectAll={selectAllItems}
        onDeselectAll={deselectAllItems}
        onSaveItems={addSelectedItemsToPantry}
        onItemQuantityChange={handleItemQuantityChange}
        onItemUnitChange={handleItemUnitChange}
        onItemPriceChange={handleItemPriceChange}
      />
    </div>
  );
};

export default PantryPage;