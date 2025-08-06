import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the Google OAuth provider
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div data-testid="google-oauth-provider">{children}</div>
}));

// Mock the encryption utility
jest.mock('../utils/encryption', () => ({
  getDecryptedGoogleClientId: () => 'mock-client-id'
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock all feature components
jest.mock('../features', () => ({
  RecipesPage: ({ recipes, setRecipes }) => (
    <div data-testid="recipes-page">
      Recipes Page - {recipes.length} recipes
    </div>
  ),
  UsersPage: ({ users, setUsers }) => (
    <div data-testid="users-page">
      Users Page - {users.length} users
    </div>
  ),
  UserDetailsPage: ({ currentUser }) => (
    <div data-testid="user-details-page">
      Profile: {currentUser?.name}
    </div>
  ),
  PantryPage: ({ pantryItems, setPantryItems }) => (
    <div data-testid="pantry-page">
      Pantry Page - {pantryItems.length} items
    </div>
  ),
  CookingForPage: ({ recipes, users, pantryItems, shoppingList }) => (
    <div data-testid="cooking-for-page">
      Cooking For Page
    </div>
  ),
  ShoppingListPage: ({ shoppingList, setShoppingList }) => (
    <div data-testid="shopping-list-page">
      Shopping List - {shoppingList.length} items
    </div>
  ),
  LoginPage: ({ onLogin }) => (
    <div data-testid="login-page">
      <button onClick={() => onLogin({ name: 'Test User', picture: 'test.jpg' })}>
        Login
      </button>
    </div>
  ),
  Chatbot: () => <div data-testid="chatbot">Chatbot</div>
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Authentication Flow', () => {
    test('shows login page when user is not logged in', () => {
      render(<App />);
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('google-oauth-provider')).toBeInTheDocument();
    });

    test('shows main app when user is logged in', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ name: 'John Doe', picture: 'john.jpg' });
        }
        return null;
      });

      render(<App />);
      
      expect(screen.getByText('Smart Pantry')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('recipes-page')).toBeInTheDocument();
    });

    test('handles login correctly', async () => {
      render(<App />);
      
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Smart Pantry')).toBeInTheDocument();
      });
    });

    test('handles logout correctly', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ name: 'John Doe', picture: 'john.jpg' });
        }
        return null;
      });

      render(<App />);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('currentUser', 'null');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ name: 'John Doe', picture: 'john.jpg' });
        }
        return JSON.stringify([]);
      });
    });

    test('renders all navigation buttons', () => {
      render(<App />);
      
      expect(screen.getByText('Recipes')).toBeInTheDocument();
      expect(screen.getByText('Cooking For')).toBeInTheDocument();
      expect(screen.getByText('Pantry')).toBeInTheDocument();
      expect(screen.getByText('Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    test('navigates to different pages', () => {
      render(<App />);
      
      // Default should be recipes page
      expect(screen.getByTestId('recipes-page')).toBeInTheDocument();
      
      // Navigate to pantry
      fireEvent.click(screen.getByText('Pantry'));
      expect(screen.getByTestId('pantry-page')).toBeInTheDocument();
      
      // Navigate to users
      fireEvent.click(screen.getByText('Users'));
      expect(screen.getByTestId('users-page')).toBeInTheDocument();
      
      // Navigate to profile
      fireEvent.click(screen.getByText('Profile'));
      expect(screen.getByTestId('user-details-page')).toBeInTheDocument();
    });

    test('shows active navigation state', () => {
      render(<App />);
      
      const recipesButton = screen.getByRole('button', { name: /recipes/i });
      expect(recipesButton).toHaveClass('active');
      
      fireEvent.click(screen.getByText('Pantry'));
      const pantryButton = screen.getByRole('button', { name: /pantry/i });
      expect(pantryButton).toHaveClass('active');
      expect(recipesButton).not.toHaveClass('active');
    });
  });

  describe('Badge Counters', () => {
    test('shows pantry item count badge', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ name: 'John Doe', picture: 'john.jpg' });
        }
        if (key === 'pantryItems') {
          return JSON.stringify([{ id: 1, name: 'Milk' }, { id: 2, name: 'Bread' }]);
        }
        return JSON.stringify([]);
      });

      render(<App />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('shows shopping list count badge', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ name: 'John Doe', picture: 'john.jpg' });
        }
        if (key === 'shoppingList') {
          return JSON.stringify([{ id: 1, name: 'Eggs' }]);
        }
        return JSON.stringify([]);
      });

      render(<App />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('shows users count badge', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ name: 'John Doe', picture: 'john.jpg' });
        }
        if (key === 'users') {
          return JSON.stringify([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
        }
        return JSON.stringify([]);
      });

      render(<App />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('User Interface', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ name: 'John Doe', picture: 'john.jpg' });
        }
        return JSON.stringify([]);
      });
    });

    test('displays user avatar and name', () => {
      render(<App />);
      
      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'john.jpg');
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('renders chatbot component', () => {
      render(<App />);
      
      expect(screen.getByTestId('chatbot')).toBeInTheDocument();
    });
  });

  describe('Header Display', () => {
    test('shows personalized welcome message with pantry name when pantry details are available', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ 
            id: 'test-user-id',
            name: 'John Doe', 
            picture: 'john.jpg' 
          });
        }
        return null;
      });

      // Mock pantry details
      const mockPantryDetails = {
        userId: 'test-user-id',
        pantryName: 'My Kitchen',
        pantryType: 'Household',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      render(<App />);
      
      // Mock the fetchPantryDetails to return pantry details
      const mockFetchPantryDetails = jest.fn().mockResolvedValue(mockPantryDetails);
      jest.doMock('../shared/api', () => ({
        ...jest.requireActual('../shared/api'),
        fetchPantryDetails: mockFetchPantryDetails
      }));

      expect(screen.getByText('Smart pantry - My Kitchen')).toBeInTheDocument();
      expect(screen.getByText('My Kitchen')).toHaveClass('pantry-name');
    });

    test('shows default title when no pantry details are available', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ 
            id: 'test-user-id',
            name: 'John Doe', 
            picture: 'john.jpg' 
          });
        }
        return null;
      });

      render(<App />);
      
      expect(screen.getByText('Smart Pantry')).toBeInTheDocument();
    });

    test('shows loading message while fetching pantry details', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'currentUser') {
          return JSON.stringify({ 
            id: 'test-user-id',
            name: 'John Doe', 
            picture: 'john.jpg' 
          });
        }
        return null;
      });

      render(<App />);
      
      // During the loading state, it should show the loading message
      expect(screen.getByText('Loading your pantry...')).toBeInTheDocument();
    });
  });
});
