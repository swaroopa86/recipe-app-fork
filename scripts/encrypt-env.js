const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');

// Encryption key - you should change this in production
const ENCRYPTION_KEY = 'recipe-app-secure-key-2024';

/**
 * Encrypts a string value
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text
 */
const encrypt = (text) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text;
  }
};

/**
 * Reads the current .env file and encrypts the Google Client ID
 */
const encryptGoogleClientId = () => {
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    // Read current .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    // Find and encrypt the Google Client ID
    const updatedLines = lines.map(line => {
      if (line.startsWith('REACT_APP_GOOGLE_CLIENT_ID=')) {
        const currentValue = line.split('=')[1];
        const encryptedValue = encrypt(currentValue);
        return `REACT_APP_GOOGLE_CLIENT_ID=${encryptedValue}`;
      }
      return line;
    });
    
    // Write back to .env file
    const updatedContent = updatedLines.join('\n');
    fs.writeFileSync(envPath, updatedContent);
    
    console.log('✅ Google Client ID has been encrypted and saved to .env file');
    console.log('🔐 The encrypted value is now stored in your .env file');
    console.log('⚠️  Make sure to set REACT_APP_ENCRYPTION_KEY in your environment for production');
    
  } catch (error) {
    console.error('❌ Error encrypting Google Client ID:', error);
  }
};

// Run the encryption
encryptGoogleClientId(); 