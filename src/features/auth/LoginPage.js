import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Create user object from Google data
      const user = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        loginTime: new Date().toISOString()
      };
      
      onLogin(user);
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🍳 Smart Pantry</h1>
          <p>Sign in to manage your recipes and pantry</p>
        </div>
        
        <div className="login-content">
          <div className="login-illustration">
            <div className="recipe-icons">
              <span className="icon">🥘</span>
              <span className="icon">🥗</span>
              <span className="icon">🍰</span>
              <span className="icon">🥪</span>
            </div>
          </div>
          
          <div className="login-form">
            <h2>Welcome Back!</h2>
            <p>Sign in with your Google account to continue</p>
            
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
            
            <div className="login-features">
              <div className="feature">
                <span className="feature-icon">📝</span>
                <span>Create and save recipes</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🥫</span>
                <span>Track your pantry</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🛒</span>
                <span>Manage shopping lists</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Share with family</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 