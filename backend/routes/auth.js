// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

// --- Signup Route (with auto-login) ---
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

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role, username: newUser.username }, // Added username
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    res.status(201).json({ token, role: newUser.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error during user creation.' });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username }, // Added username
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});
// --- GOOGLE LOGIN ROUTE ---
router.post('/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Verifies the token is for your app
        });
        const { name, email, sub } = ticket.getPayload();
        
        let user = await User.findOne({ email });

        if (!user) { // If user doesn't exist, create a new one
            user = new User({
                username: name,
                email: email,
                password: await bcrypt.hash(sub + email, 10),
                role: 'user'
            });
            await user.save();
        }
        
        const jwtToken = jwt.sign({ userId: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: jwtToken, role: user.role });

    } catch (error) {
        console.error("Google auth error:", error);
        res.status(400).json({ message: 'Google authentication failed.' });
    }
});
export default router;