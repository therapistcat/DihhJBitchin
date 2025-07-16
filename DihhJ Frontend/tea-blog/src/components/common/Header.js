import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import AuthModal from '../auth/AuthModal';
import './Common.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleCreatePost = () => {
    navigate('/create');
  };

  const handleShowProfile = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 6) {
      const secrets = [
        'Welcome to the secret society of professional bitchers!',
        'You\'ve unlocked the crown of ultimate tea mastery!',
        'The ancient art of bitchin has chosen you as its vessel!',
        'Congratulations! You\'re now a mythical creature of pure drama!',
        'Achievement unlocked: Master of Chaos and Tea!'
      ];
      const randomSecret = secrets[Math.floor(Math.random() * secrets.length)];

      // Create a temporary notification element
      const notification = document.createElement('div');
      notification.className = 'header-easter-notification';
      notification.textContent = randomSecret;
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      setClickCount(0);
    }
  };





  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo and Title */}
          <div className="header-brand">
            <h1
              className="header-title"
              onClick={() => {
                handleTitleClick();
                handleLogoClick();
              }}
              style={{ cursor: 'pointer' }}
            >
              <span className="brand-icon">⚡</span>
              DihhJ Bitchin
              <span className="brand-icon">◆</span>
            </h1>
            <p className="header-subtitle">Where the bitchin' never stops!</p>
          </div>

          {/* Navigation Controls */}
          <div className="header-nav">
            {/* Create Post Button */}
            {user && (
              <button onClick={handleCreatePost} className="create-post-btn">
                <span>🔥</span>
                Drop Some Heat
              </button>
            )}

            {/* User Authentication */}
            <div className="auth-section">
              {user ? (
                <div className="user-menu">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="user-btn"
                  >
                    <span className="user-avatar">👤</span>
                    {user.username}
                    <span className="user-batch">Batch {user.year}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <div className="user-info">
                        <strong>{user.username}</strong>
                        <span>Batch {user.year}</span>
                      </div>
                      <button
                        onClick={handleShowProfile}
                        className="profile-btn"
                      >
                        👤 Profile
                      </button>
                      <button onClick={handleLogout} className="logout-btn">
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className="auth-btn login"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleAuthClick('register')}
                    className="auth-btn register"
                  >
                    Join
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;
