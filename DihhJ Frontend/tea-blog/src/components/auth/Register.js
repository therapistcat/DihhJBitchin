import React, { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { authAPI } from '../../services/api';
import './Auth.css';

const Register = ({ onSwitchToLogin, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    year: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!['26', '27', '28', '29'].includes(formData.year)) {
      setError('Please select a valid batch year');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: formData.username,
        password: formData.password,
        year: parseInt(formData.year) + 2000 // Convert "26" to 2026
      };

      const response = await authAPI.register(registrationData);

      if (response.user) {
        login(response.user);
        onClose();
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-modal">
        <div className="auth-header">
          <h2>Join the Bitchin! 🔥💯</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="privacy-notice">
          <p>🔒 <strong>Privacy Tip:</strong> Use a creative username, not your real name! Keep it anonymous and fun! 😎</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username (3+ characters)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Batch Year</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">Select your batch</option>
              <option value="26">Batch 26</option>
              <option value="27">Batch 27</option>
              <option value="28">Batch 28</option>
              <option value="29">Batch 29</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password (6+ characters)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button 
              className="link-btn" 
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
