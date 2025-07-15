import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);

  if (!isOpen) return null;

  const handleSwitchToRegister = () => setMode('register');
  const handleSwitchToLogin = () => setMode('login');

  return (
    <>
      {mode === 'login' ? (
        <Login 
          onSwitchToRegister={handleSwitchToRegister}
          onClose={onClose}
        />
      ) : (
        <Register 
          onSwitchToLogin={handleSwitchToLogin}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default AuthModal;
