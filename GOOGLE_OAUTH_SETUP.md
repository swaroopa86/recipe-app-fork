# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Recipe App.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace organization)
3. Fill in the required information:
   - App name: "Samrt Pantry"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email address) if you're in testing mode

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Click "Create"

## Step 4: Get Your Client ID

After creating the OAuth 2.0 client, you'll get a Client ID. Copy this ID.

## Step 5: Update Your App

1. Open `src/app/App.js`
2. Find this line:
   ```javascript
   <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:
   ```javascript
   <GoogleOAuthProvider clientId="123456789-abcdefghijklmnop.apps.googleusercontent.com">
   ```

## Step 6: Test the Integration

1. Start your development server: `npm start`
2. Open your app in the browser
3. You should see the login screen with a Google Sign-In button
4. Click the button and sign in with your Google account
5. After successful authentication, you should be redirected to the main app

## Security Notes

- Never commit your Client ID to version control if it's a production app
- Use environment variables for production deployments
- The Client ID is safe to expose in client-side code, but keep your Client Secret secure

## Environment Variables (Recommended for Production)

For production, you can use environment variables:

1. Create a `.env` file in your project root:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```

2. Update your App.js:
   ```javascript
   <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
   ```

3. Add `.env` to your `.gitignore` file

## Troubleshooting

- **"popup_closed_by_user" error**: This usually means the user closed the popup before completing authentication
- **"access_denied" error**: Check your OAuth consent screen configuration
- **"redirect_uri_mismatch" error**: Make sure your redirect URIs are correctly configured in Google Cloud Console

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://github.com/MomenSherif/react-oauth)
- [Google Cloud Console](https://console.cloud.google.com/) 