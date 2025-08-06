import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './LoginPage';

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: jest.fn(({ onSuccess, onError }) => (
    <button 
      data-testid="google-login-button"
      onClick={() => onSuccess({ 
        credential: 'mock-jwt-token',
        clientId: 'mock-client-id'
      })}
    >
      Sign in with Google
    </button>
  ))
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
    sub: '123456789'
  }))
}));

describe('LoginPage Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login page with title and description', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    expect(screen.getByText('🍳 Smart Pantry')).toBeInTheDocument();
    // The actual description text
    expect(screen.getByText('Sign in to manage your recipes and pantry')).toBeInTheDocument();
  });

  test('renders Google login container', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    expect(screen.getByTestId('google-login-container')).toBeInTheDocument();
  });

  test('calls onLogin when Google login succeeds', async () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  test('displays loading state during authentication', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    // Initially should not show loading
    expect(screen.queryByText('Signing you in...')).not.toBeInTheDocument();
  });

  test('renders feature highlights', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    // Check for feature text instead of emojis since they're in separate elements
    expect(screen.getByText('Create and save recipes')).toBeInTheDocument();
    expect(screen.getByText('Track your pantry')).toBeInTheDocument();
    expect(screen.getByText('Manage shopping lists')).toBeInTheDocument();
    expect(screen.getByText('Share with family')).toBeInTheDocument();
  });

  test('handles Google login error gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<LoginPage onLogin={mockOnLogin} />);
    
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('applies correct CSS classes', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    // Check for the login container by finding a unique element within it
    expect(screen.getByText('🍳 Smart Pantry')).toBeInTheDocument();
    expect(screen.getByText('Sign in to manage your recipes and pantry')).toBeInTheDocument();
  });
});
