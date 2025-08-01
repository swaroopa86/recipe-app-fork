# Environment Variable Encryption Setup

This document explains how the Google Client ID encryption system works in the Recipe App.

## Overview

The `REACT_APP_GOOGLE_CLIENT_ID` environment variable is now encrypted to enhance security. The encryption system uses AES encryption from the `crypto-js` library.

## How It Works

1. **Encryption**: The Google Client ID is encrypted using AES encryption with a secret key
2. **Storage**: The encrypted value is stored in the `.env` file
3. **Runtime Decryption**: The app automatically decrypts the value when needed

## Files Created

- `src/utils/encryption.js` - Encryption/decryption utilities
- `scripts/encrypt-env.js` - Script to encrypt environment variables
- `ENCRYPTION_SETUP.md` - This documentation file

## Current Status

✅ **Google Client ID has been encrypted and saved to `.env` file**

## Usage

### For Development

The app will work as-is with the current setup. The encryption key is hardcoded for development purposes.

### For Production

1. **Set a secure encryption key**:
   ```bash
   # Add this to your production environment variables
   REACT_APP_ENCRYPTION_KEY=your-secure-production-key-here
   ```

2. **Re-encrypt with the new key**:
   ```bash
   # Update the encryption key in scripts/encrypt-env.js
   # Then run:
   npm run encrypt-env
   ```

### Re-encrypting Environment Variables

If you need to update the Google Client ID or change the encryption key:

1. Update the `ENCRYPTION_KEY` in `scripts/encrypt-env.js`
2. Run the encryption script:
   ```bash
   npm run encrypt-env
   ```

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit the encryption key to version control**
2. **Use different encryption keys for different environments**
3. **The current encryption key is for development only**
4. **In production, always set `REACT_APP_ENCRYPTION_KEY`**

## How the App Uses Encryption

The app automatically handles encryption/decryption:

```javascript
// Instead of directly accessing the environment variable:
// process.env.REACT_APP_GOOGLE_CLIENT_ID

// The app now uses:
import { getDecryptedGoogleClientId } from '../utils/encryption';
const clientId = getDecryptedGoogleClientId();
```

## Troubleshooting

### If the app doesn't start:
1. Check that `crypto-js` is installed: `npm install crypto-js`
2. Verify the `.env` file exists and contains the encrypted value
3. Check browser console for any decryption errors

### If Google OAuth doesn't work:
1. Verify the decrypted value matches your original Google Client ID
2. Check that the encryption key is consistent between encryption and runtime

## Encryption Key Management

For production deployments, consider using:
- Environment-specific encryption keys
- Key rotation strategies
- Secure key management services (AWS KMS, Azure Key Vault, etc.)

## Files Modified

- `src/app/App.js` - Updated to use decryption utility
- `package.json` - Added encryption script
- `.env` - Contains encrypted Google Client ID 