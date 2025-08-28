// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// --- Signup Route (Updated for Auto-Login) ---
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();
    
    // Auto-Login Logic: Create a token immediately
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Send the token and role back
    res.status(201).json({
      message: 'User created successfully!',
      token,
      role: newUser.role
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: 'Server error during user creation.' });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token, 
      role: user.role 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;