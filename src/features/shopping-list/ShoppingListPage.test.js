import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShoppingListPage from './components/ShoppingListPage';

describe('ShoppingListPage Component', () => {
  const mockSetShoppingList = jest.fn();
  const initialShoppingList = [
    { id: 1, name: 'Milk', quantity: 2, unit: 'liters', completed: false, category: 'dairy' },
    { id: 2, name: 'Bread', quantity: 1, unit: 'loaf', completed: true, category: 'bakery' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders shopping list page', () => {
    render(<ShoppingListPage shoppingList={[]} setShoppingList={mockSetShoppingList} />);
    
    expect(screen.getByText('🛒 Shopping List')).toBeInTheDocument();
  });

  test('shows empty state when no shopping list items', () => {
    render(<ShoppingListPage shoppingList={[]} setShoppingList={mockSetShoppingList} />);
    
    expect(screen.getByText('Your shopping list is empty!')).toBeInTheDocument();
  });

  test('displays shopping list items when available', () => {
    render(<ShoppingListPage shoppingList={initialShoppingList} setShoppingList={mockSetShoppingList} />);
    
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
  });

  test('shows add item button', () => {
    render(<ShoppingListPage shoppingList={[]} setShoppingList={mockSetShoppingList} />);
    
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  test('shows clear all button when items exist', () => {
    render(<ShoppingListPage shoppingList={initialShoppingList} setShoppingList={mockSetShoppingList} />);
    
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  test('displays item count', () => {
    render(<ShoppingListPage shoppingList={initialShoppingList} setShoppingList={mockSetShoppingList} />);
    
    // Check for the stats display instead of the old format
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    // Use getAllByText since "2" appears multiple times in stats
    const countElements = screen.getAllByText('2');
    expect(countElements.length).toBeGreaterThan(0);
  });

  test('shows checkboxes for items', () => {
    render(<ShoppingListPage shoppingList={initialShoppingList} setShoppingList={mockSetShoppingList} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
  });
});
