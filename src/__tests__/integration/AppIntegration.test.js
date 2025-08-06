import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../app/App';

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => children,
  GoogleLogin: jest.fn(() => (
    <div data-testid="google-login-button">
      <button>Sign in with Google</button>
    </div>
  )),
  useGoogleLogin: () => jest.fn(),
  googleLogout: jest.fn(),
}));

// Mock crypto-js
jest.mock('crypto-js', () => ({
  AES: {
    decrypt: jest.fn(() => ({ toString: () => 'mock-client-id' })),
  },
  enc: {
    Utf8: {},
  },
}));

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(() => Promise.resolve({ data: { text: 'Mock OCR text' } })),
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({
    sub: '123',
    name: 'Test User',
    email: 'test@example.com',
    picture: 'test.jpg'
  }))
}));

// Mock encryption utility
jest.mock('../../utils/encryption', () => ({
  getDecryptedGoogleClientId: jest.fn(() => 'mock-client-id')
}));

describe('App Integration Tests', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    picture: 'test.jpg'
  };

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Mock successful login
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    jest.clearAllMocks();
  });

  test('renders login page when no user', () => {
    // Clear user from localStorage to show login page
    localStorage.removeItem('user');
    render(<App />);
    
    expect(screen.getByText('🍳 Smart Pantry')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  test('shows Google login container', () => {
    localStorage.removeItem('user');
    render(<App />);
    
    // Check if the Google login container exists
    expect(screen.getByTestId('google-login-container')).toBeInTheDocument();
  });

  test('shows login features', () => {
    localStorage.removeItem('user');
    render(<App />);
    
    expect(screen.getByText('Create and save recipes')).toBeInTheDocument();
    expect(screen.getByText('Track your pantry')).toBeInTheDocument();
    expect(screen.getByText('Manage shopping lists')).toBeInTheDocument();
    expect(screen.getByText('Share with family')).toBeInTheDocument();
  });

});
