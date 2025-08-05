import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be stored securely
// For now, we'll use a combination of environment variables and a fallback
const getEncryptionKey = () => {
  // Try to get from environment variable first
  const envKey = process.env.REACT_APP_ENCRYPTION_KEY;
  if (envKey) {
    return envKey;
  }
  
  // Fallback key - in production, you should always set REACT_APP_ENCRYPTION_KEY
  return '';
};

/**
 * Encrypts a string value
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text
 */
export const encrypt = (text) => {
  try {
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Return original text if encryption fails
  }
};

/**
 * Decrypts an encrypted string value
 * @param {string} encryptedText - The encrypted text to decrypt
 * @returns {string} - The decrypted text
 */
export const decrypt = (encryptedText) => {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // Return encrypted text if decryption fails
  }
};

/**
 * Checks if a string is encrypted
 * @param {string} text - The text to check
 * @returns {boolean} - True if the text appears to be encrypted
 */
export const isEncrypted = (text) => {
  try {
    // Try to decrypt it - if it succeeds, it was encrypted
    const decrypted = decrypt(text);
    return decrypted !== text;
  } catch {
    return false;
  }
};

/**
 * Gets the decrypted Google Client ID
 * @returns {string} - The decrypted Google Client ID
 */
export const getDecryptedGoogleClientId = () => {
  const encryptedClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  if (!encryptedClientId) {
    console.warn('REACT_APP_GOOGLE_CLIENT_ID is not set');
    return '';
  }
  
  // Check if it's already encrypted
  if (isEncrypted(encryptedClientId)) {
    return decrypt(encryptedClientId);
  }
  
  // If not encrypted, return as is (for backward compatibility)
  return encryptedClientId;
}; 