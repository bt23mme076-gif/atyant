// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

// Helper to sign JWT with richer payload (includes profilePicture)
const signUserToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      username: user.username,
      profilePicture: user.profilePicture || null, // new: include profile pic
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
  );
};

// --- Signup Route (with auto-login) ---
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If model supports it, profilePicture can be defaulted in schema or set here
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      // profilePicture: req.body.profilePicture || undefined, // optional if provided
    });

    await newUser.save();

    const token = signUserToken(newUser);
    return res.status(201).json({ token, role: newUser.role });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error during user creation.' });
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

    const token = signUserToken(user);
    return res.json({ token, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login.' });
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

    const { name, email, sub, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name,
        email,
        password: await bcrypt.hash(sub + email, 10),
        role: 'user',
        profilePicture: picture || null, // seed from Google profile if available
      });
      await user.save();
    } else if (!user.profilePicture && picture) {
      // optional: backfill profile pic if empty
      user.profilePicture = picture;
      await user.save();
    }

    const jwtToken = signUserToken(user);
    return res.json({ token: jwtToken, role: user.role });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(400).json({ message: 'Google authentication failed.' });
  }
});

export default router;
