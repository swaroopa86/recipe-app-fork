import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersPage from './UsersPage';

// Mock the API functions
jest.mock('../../../shared/api', () => ({
  createUser: jest.fn(),
  deleteUser: jest.fn()
}));

import { createUser, deleteUser } from '../../../shared/api';

describe('UsersPage', () => {
  const mockUsers = [];
  const mockRefreshUsers = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user form with allergen checkboxes', () => {
    render(<UsersPage users={mockUsers} refreshUsers={mockRefreshUsers} />);
    
    expect(screen.getByText('Add New User')).toBeInTheDocument();
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByText("User's Allergens:")).toBeInTheDocument();
    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    
    // Check that allergen checkboxes are rendered
    expect(screen.getByLabelText('cereals containing gluten')).toBeInTheDocument();
    expect(screen.getByLabelText('crustaceans')).toBeInTheDocument();
    expect(screen.getByLabelText('eggs')).toBeInTheDocument();
  });

  test('allergen checkboxes can be toggled', () => {
    render(<UsersPage users={mockUsers} refreshUsers={mockRefreshUsers} />);
    
    const glutenCheckbox = screen.getByLabelText('cereals containing gluten');
    const eggsCheckbox = screen.getByLabelText('eggs');
    
    // Initially unchecked
    expect(glutenCheckbox).not.toBeChecked();
    expect(eggsCheckbox).not.toBeChecked();
    
    // Check gluten
    fireEvent.click(glutenCheckbox);
    expect(glutenCheckbox).toBeChecked();
    
    // Check eggs
    fireEvent.click(eggsCheckbox);
    expect(eggsCheckbox).toBeChecked();
    
    // Uncheck gluten
    fireEvent.click(glutenCheckbox);
    expect(glutenCheckbox).not.toBeChecked();
  });

  test('select all button selects all allergens', () => {
    render(<UsersPage users={mockUsers} refreshUsers={mockRefreshUsers} />);
    
    const selectAllButton = screen.getByText('Select All');
    const glutenCheckbox = screen.getByLabelText('cereals containing gluten');
    const eggsCheckbox = screen.getByLabelText('eggs');
    
    // Initially unchecked
    expect(glutenCheckbox).not.toBeChecked();
    expect(eggsCheckbox).not.toBeChecked();
    
    // Click select all
    fireEvent.click(selectAllButton);
    
    // All should be checked
    expect(glutenCheckbox).toBeChecked();
    expect(eggsCheckbox).toBeChecked();
  });

  test('clear all button unselects all allergens', () => {
    render(<UsersPage users={mockUsers} refreshUsers={mockRefreshUsers} />);
    
    const selectAllButton = screen.getByText('Select All');
    const clearAllButton = screen.getByText('Clear All');
    const glutenCheckbox = screen.getByLabelText('cereals containing gluten');
    const eggsCheckbox = screen.getByLabelText('eggs');
    
    // Select all first
    fireEvent.click(selectAllButton);
    expect(glutenCheckbox).toBeChecked();
    expect(eggsCheckbox).toBeChecked();
    
    // Clear all
    fireEvent.click(clearAllButton);
    expect(glutenCheckbox).not.toBeChecked();
    expect(eggsCheckbox).not.toBeChecked();
  });

  test('selected count updates correctly', () => {
    render(<UsersPage users={mockUsers} refreshUsers={mockRefreshUsers} />);
    
    const glutenCheckbox = screen.getByLabelText('cereals containing gluten');
    const eggsCheckbox = screen.getByLabelText('eggs');
    
    // Initially 0 selected
    expect(screen.getByText('0 of 14 selected')).toBeInTheDocument();
    
    // Select one
    fireEvent.click(glutenCheckbox);
    expect(screen.getByText('1 of 14 selected')).toBeInTheDocument();
    
    // Select another
    fireEvent.click(eggsCheckbox);
    expect(screen.getByText('2 of 14 selected')).toBeInTheDocument();
    
    // Unselect one
    fireEvent.click(glutenCheckbox);
    expect(screen.getByText('1 of 14 selected')).toBeInTheDocument();
  });
}); 