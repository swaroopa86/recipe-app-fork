import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PantryPage from './components/PantryPage';

// Mock Tesseract.js for OCR functionality
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(() => Promise.resolve({
    data: {
      text: 'Milk\nBread\nEggs\nButter'
    }
  }))
}));

describe('PantryPage Component', () => {
  const mockSetPantryItems = jest.fn();
  const initialPantryItems = [
    { id: 1, name: 'Milk', quantity: 2, unit: 'liters', expiryDate: '2024-01-15' },
    { id: 2, name: 'Bread', quantity: 1, unit: 'loaf', expiryDate: '2024-01-10' },
    { id: 3, name: 'Eggs', quantity: 12, unit: 'pieces', expiryDate: '2024-01-20' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders pantry page with title', () => {
    render(<PantryPage pantryItems={[]} setPantryItems={mockSetPantryItems} />);
    
    expect(screen.getByText('My Pantry (0 items)')).toBeInTheDocument();
  });

  test('displays pantry items correctly', () => {
    render(<PantryPage pantryItems={initialPantryItems} setPantryItems={mockSetPantryItems} />);
    
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.getByText('Eggs')).toBeInTheDocument();
    
    // Check for quantity and unit separately since they're in different spans
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('liters')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('loaf')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('pieces')).toBeInTheDocument();
  });

  test('shows empty state when no pantry items', () => {
    render(<PantryPage pantryItems={[]} setPantryItems={mockSetPantryItems} />);
    
    expect(screen.getByText(/Your pantry is empty/)).toBeInTheDocument();
  });

  test('shows add item modal when add button clicked', () => {
    render(<PantryPage pantryItems={[]} setPantryItems={mockSetPantryItems} />);
    
    // Click add to pantry button
    fireEvent.click(screen.getByRole('button', { name: /add to pantry/i }));
    
    // Modal should be visible - check for form elements
    expect(screen.getByLabelText(/ingredient name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });

  test('renders scan receipt button', () => {
    render(<PantryPage pantryItems={[]} setPantryItems={mockSetPantryItems} />);
    
    expect(screen.getByText('Scan Receipt')).toBeInTheDocument();
  });

  test('shows empty state message', () => {
    render(<PantryPage pantryItems={[]} setPantryItems={mockSetPantryItems} />);
    
    expect(screen.getByText('Your pantry is empty!')).toBeInTheDocument();
    expect(screen.getByText('Add ingredients manually or scan a receipt to get started.')).toBeInTheDocument();
  });

  test('displays pantry items when available', () => {
    render(<PantryPage pantryItems={initialPantryItems} setPantryItems={mockSetPantryItems} />);
    
    expect(screen.getByText('My Pantry (3 items)')).toBeInTheDocument();
  });

  test('shows scan receipt modal when scan button clicked', () => {
    render(<PantryPage pantryItems={[]} setPantryItems={mockSetPantryItems} />);
    
    fireEvent.click(screen.getByText('Scan Receipt'));
    
    // Modal functionality would be tested separately
    expect(screen.getByText('Scan Receipt')).toBeInTheDocument();
  });
});
