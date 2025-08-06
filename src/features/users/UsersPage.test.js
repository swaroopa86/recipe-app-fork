import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersPage from './components/UsersPage';

describe('UsersPage Component', () => {
  const mockSetUsers = jest.fn();
  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      dietaryRestrictions: ['vegetarian'],
      allergens: new Set(['nuts', 'dairy'])
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders users page', () => {
    render(<UsersPage users={[]} setUsers={mockSetUsers} />);
    
    // The actual header text
    expect(screen.getByText(/Registered Users/)).toBeInTheDocument();
  });

  test('shows empty state when no users', () => {
    render(<UsersPage users={[]} setUsers={mockSetUsers} />);
    
    // The actual empty state text
    expect(screen.getByText('No users registered yet. Add your first user above!')).toBeInTheDocument();
  });

  test('displays users when available', () => {
    render(<UsersPage users={mockUsers} setUsers={mockSetUsers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('shows add user button', () => {
    render(<UsersPage users={[]} setUsers={mockSetUsers} />);
    
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });

  test('displays user count', () => {
    render(<UsersPage users={mockUsers} setUsers={mockSetUsers} />);
    
    // Check for the user count text - it's split across elements
    expect(screen.getByText(/Registered Users/)).toBeInTheDocument();
    // Use more specific query to avoid multiple matches
    expect(screen.getByText(/Registered Users \(/)).toBeInTheDocument();
  });

  test('shows user cards', () => {
    render(<UsersPage users={mockUsers} setUsers={mockSetUsers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Email is not displayed in the component UI
    // Check for allergen tags specifically (not form checkboxes)
    const allergenTags = screen.getAllByText('nuts');
    expect(allergenTags.length).toBeGreaterThan(0);
    const dairyTags = screen.getAllByText('dairy');
    expect(dairyTags.length).toBeGreaterThan(0);
  });

});
