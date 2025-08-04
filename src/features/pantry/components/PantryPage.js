import React, { useState, useCallback } from 'react';
import AddItemModal from './AddItemModal';
import ReceiptScannerModal from './ReceiptScannerModal';
import PantryItemCard from './PantryItemCard';
import { useOCR } from '../../../shared/hooks/useOCR';
import { parseReceiptText } from '../../../shared/utils/receiptParser';
import { createPantryItem, updatePantryItem, deletePantryItem, fetchPantryItems } from '../../../shared/api';
import './PantryPage.css';

const PantryPage = ({ pantryItems, refreshPantryItems }) => {
  // Item management state
  const [currentItem, setCurrentItem] = useState({
    name: '',
    quantity: '',
    unit: 'cups'
  });
  const [editingId, setEditingId] = useState(null);
  
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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (currentItem.name.trim() && currentItem.quantity.trim()) {
      try {
        if (editingId) {
          // Update existing item
          await updatePantryItem({ ...currentItem, id: editingId });
          setEditingId(null);
        } else {
          // Add new item
          const newItem = {
            ...currentItem,
            id: Date.now().toString()
          };
          await createPantryItem(newItem);
        }
        refreshPantryItems(); // Refresh pantry items after creation/update
      } catch (error) {
        console.error('Error saving pantry item:', error);
        alert('Failed to save pantry item. Please try again.');
      }
      
      resetCurrentItem();
      setShowAddForm(false);
    }
  }, [currentItem, editingId, refreshPantryItems]);

  const resetCurrentItem = useCallback(() => {
    setCurrentItem({ name: '', quantity: '', unit: 'cups' });
    setEditingId(null);
  }, []);

  const editItem = useCallback((item) => {
    setCurrentItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit
    });
    setEditingId(item.id);
    setShowAddForm(true);
  }, []);

  const deleteItem = useCallback(async (id) => {
    try {
      await deletePantryItem(id);
      refreshPantryItems(); // Refresh pantry items after deletion
    } catch (error) {
      console.error('Error deleting pantry item:', error);
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
        console.error('Error clearing pantry:', error);
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
  }, [parsedItems, selectedItems, pantryItems, refreshPantryItems, handleClearImage, updatePantryItem, createPantryItem]);

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
      console.error('Image upload failed:', error);
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

  // Save items to pantry
  const addSelectedItemsToPantry = useCallback(async () => {
    const itemsToAdd = parsedItems.filter(item => selectedItems.has(item.id));
    
    if (itemsToAdd.length === 0) {
      return;
    }
    let addedCount = 0;
    let updatedCount = 0;
    for (const receiptItem of itemsToAdd) {
      const existingItem = pantryItems.find(
        item => item.name.toLowerCase() === receiptItem.name.toLowerCase() &&
                item.unit === receiptItem.unit
      );
      if (existingItem) {
        // Update existing item
        const updatedItem = {
          ...existingItem,
          quantity: (parseFloat(existingItem.quantity) + parseFloat(receiptItem.quantity)).toString()
        };
        await updatePantryItem(updatedItem);
        updatedCount++;
      } else {
        // Add new item
        const newItem = {
          ...receiptItem,
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
        };
        await createPantryItem(newItem);
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
  });
      

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
      />
    </div>
  );
};

export default PantryPage; 