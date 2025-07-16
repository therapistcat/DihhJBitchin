const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../config/database');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, year } = req.body;
    
    // Validation
    if (!username || !password || !year) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Username, password, and year are required'
      });
    }
    
    if (username.length < 3) {
      return res.status(400).json({
        error: 'Invalid username',
        message: 'Username must be at least 3 characters long'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long'
      });
    }
    
    if (year < 1900 || year > new Date().getFullYear() + 10) {
      return res.status(400).json({
        error: 'Invalid year',
        message: 'Please provide a valid year'
      });
    }
    
    const db = getDB();
    const usersCollection = db.collection('users');
    
    // Check if username already exists
    const existingUser = await usersCollection.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'Username taken',
        message: 'This username is already taken'
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const newUser = {
      username: username.toLowerCase(),
      originalUsername: username,
      password: hashedPassword,
      year: parseInt(year),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    // Return success response (without password)
    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: result.insertedId,
        username: newUser.originalUsername,
        year: newUser.year,
        created_at: newUser.created_at
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }
    
    const db = getDB();
    const usersCollection = db.collection('users');
    
    // Find user
    const user = await usersCollection.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid username or password'
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid username or password'
      });
    }
    
    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { last_login: new Date() } }
    );
    
    // Return success response (without password)
    res.json({
      message: 'Login successful!',
      user: {
        id: user._id,
        username: user.originalUsername,
        year: user.year,
        created_at: user.created_at,
        last_login: new Date()
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Get user profile (optional endpoint for future use)
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const db = getDB();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne(
      { username: username.toLowerCase() },
      { projection: { password: 0 } } // Exclude password
    );
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.originalUsername,
        year: user.year,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'An error occurred while fetching profile'
    });
  }
});

module.exports = router;
