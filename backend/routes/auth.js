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
  console.time('jwt-generation'); // ⭐ ADD THIS
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      username: user.username,
      profilePicture: user.profilePicture || null,
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
  );
  console.timeEnd('jwt-generation'); // ⭐ ADD THIS
  return token;
};

// --- Signup Route (with auto-login) ---
router.post('/signup', async (req, res) => {
  console.time('signup-operation'); // ⭐ ADD THIS - शुरुआत में
  
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    console.time('user-existence-check'); // ⭐ ADD THIS
    const existingUser = await User.findOne({ email });
    console.timeEnd('user-existence-check'); // ⭐ ADD THIS
    
    if (existingUser) {
      console.timeEnd('signup-operation'); // ⭐ ADD THIS - error case में भी end करें
      return res
        .status(400)
        .json({ message: 'User with this email already exists.' });
    }

    console.time('password-hashing'); // ⭐ ADD THIS
    const hashedPassword = await bcrypt.hash(password, 10);
    console.timeEnd('password-hashing'); // ⭐ ADD THIS

    console.time('user-creation'); // ⭐ ADD THIS
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    console.timeEnd('user-creation'); // ⭐ ADD THIS

    const token = signUserToken(newUser);
    
    console.timeEnd('signup-operation'); // ⭐ ADD THIS - success case में end करें
    return res.status(201).json({ token, role: newUser.role });
  } catch (error) {
    console.timeEnd('signup-operation'); // ⭐ ADD THIS - error case में भी end करें
    console.error('Signup error:', error); // ⭐ ADD THIS - better error logging
    return res
      .status(500)
      .json({ message: 'Server error during user creation.' });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  console.time('login-operation'); // ⭐ ADD THIS - शुरुआत में
  
  try {
    const { email, password } = req.body;

    console.time('user-lookup'); // ⭐ ADD THIS
    const user = await User.findOne({ email });
    console.timeEnd('user-lookup'); // ⭐ ADD THIS
    
    if (!user) {
      console.timeEnd('login-operation'); // ⭐ ADD THIS
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    console.time('password-comparison'); // ⭐ ADD THIS
    const isMatch = await bcrypt.compare(password, user.password);
    console.timeEnd('password-comparison'); // ⭐ ADD THIS
    
    if (!isMatch) {
      console.timeEnd('login-operation'); // ⭐ ADD THIS
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = signUserToken(user);
    
    console.timeEnd('login-operation'); // ⭐ ADD THIS - success case में
    return res.json({ token, role: user.role });
  } catch (error) {
    console.timeEnd('login-operation'); // ⭐ ADD THIS - error case में भी
    console.error('Login error:', error); // ⭐ ADD THIS - better error logging
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- GOOGLE LOGIN ROUTE ---
router.post('/google-login', async (req, res) => {
  console.time('google-login-operation'); // ⭐ ADD THIS
  
  const { token } = req.body;
  try {
    console.time('google-token-verification'); // ⭐ ADD THIS
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.timeEnd('google-token-verification'); // ⭐ ADD THIS

    const { name, email, sub, picture } = ticket.getPayload();

    console.time('google-user-lookup'); // ⭐ ADD THIS
    let user = await User.findOne({ email });
    console.timeEnd('google-user-lookup'); // ⭐ ADD THIS

    if (!user) {
      console.time('google-user-creation'); // ⭐ ADD THIS
      user = new User({
        username: name,
        email,
        password: await bcrypt.hash(sub + email, 10),
        role: 'user',
        profilePicture: picture || null,
      });
      await user.save();
      console.timeEnd('google-user-creation'); // ⭐ ADD THIS
    } else if (!user.profilePicture && picture) {
      console.time('google-profile-update'); // ⭐ ADD THIS
      user.profilePicture = picture;
      await user.save();
      console.timeEnd('google-profile-update'); // ⭐ ADD THIS
    }

    const jwtToken = signUserToken(user);
    
    console.timeEnd('google-login-operation'); // ⭐ ADD THIS
    return res.json({ token: jwtToken, role: user.role });
  } catch (error) {
    console.timeEnd('google-login-operation'); // ⭐ ADD THIS
    console.error('Google auth error:', error);
    return res.status(400).json({ message: 'Google authentication failed.' });
  }
});

export default router;
