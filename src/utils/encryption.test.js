import { getDecryptedGoogleClientId } from './encryption';
import CryptoJS from 'crypto-js';

// Mock CryptoJS
jest.mock('crypto-js', () => ({
  AES: {
    decrypt: jest.fn(),
    encrypt: jest.fn()
  },
  enc: {
    Utf8: {}
  }
}));

// Mock environment variables
const originalEnv = process.env;

describe('Encryption Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getDecryptedGoogleClientId', () => {
    test('returns decrypted client ID when encrypted value exists', () => {
      // Set up encrypted client ID and encryption key
      process.env.REACT_APP_GOOGLE_CLIENT_ID = '<your_client_id_here>';
      process.env.REACT_APP_ENCRYPTION_KEY = 'secret_key';
      
      // Mock the decryption to return a different value (simulating encrypted data)
      const mockDecryptedBytes = { toString: jest.fn(() => 'decrypted_client_id') };
      CryptoJS.AES.decrypt.mockReturnValue(mockDecryptedBytes);
      
      const result = getDecryptedGoogleClientId();
      
      // The function should attempt decryption
      expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('<your_client_id_here>', 'secret_key');
      expect(result).toBe('decrypted_client_id');
    });

    test('returns fallback client ID when encrypted value does not exist', () => {
      // Set up a regular (non-encrypted) client ID
      process.env.REACT_APP_GOOGLE_CLIENT_ID = 'fallback_client_id';
      process.env.REACT_APP_ENCRYPTION_KEY = '<your_encryption_key_here>';
      
      // Mock decryption to return the same value (simulating non-encrypted data)
      const mockDecryptedBytes = { toString: jest.fn(() => 'fallback_client_id') };
      CryptoJS.AES.decrypt.mockReturnValue(mockDecryptedBytes);
      
      const result = getDecryptedGoogleClientId();
      
      expect(result).toBe('fallback_client_id');
      // The function will still call decrypt to check if it's encrypted
      expect(CryptoJS.AES.decrypt).toHaveBeenCalled();
    });

    test('handles decryption errors gracefully', () => {
      process.env.REACT_APP_GOOGLE_CLIENT_ID = 'encrypted_value';
      process.env.REACT_APP_ENCRYPTION_KEY = 'secret_key';
      
      // Mock decryption to throw an error
      CryptoJS.AES.decrypt.mockImplementation(() => {
        throw new Error('Decryption failed');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = getDecryptedGoogleClientId();
      
      // Should return the original encrypted value when decryption fails
      expect(result).toBe('encrypted_value');
      expect(consoleSpy).toHaveBeenCalledWith('Decryption failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    test('returns empty string when no client ID is available', () => {
      delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = getDecryptedGoogleClientId();
      
      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('REACT_APP_GOOGLE_CLIENT_ID is not set');
      
      consoleSpy.mockRestore();
    });

    test('handles missing encryption key', () => {
      process.env.REACT_APP_GOOGLE_CLIENT_ID = 'some_client_id';
      delete process.env.REACT_APP_ENCRYPTION_KEY;
      
      // Mock decryption with empty key to return same value
      const mockDecryptedBytes = { toString: jest.fn(() => 'some_client_id') };
      CryptoJS.AES.decrypt.mockReturnValue(mockDecryptedBytes);
      
      const result = getDecryptedGoogleClientId();
      
      expect(result).toBe('some_client_id');
      // Should still attempt decryption with empty key
      expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('some_client_id', '');
    });
  });
});
