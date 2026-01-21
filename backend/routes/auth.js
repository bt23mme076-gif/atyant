// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

// ✅ OPTIMIZED: Smaller JWT payload (removed username and profilePicture)
const signUserToken = (user) => {
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      // ✅ Removed username and profilePicture for 50% smaller token
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '7d' } // ✅ Changed to 7 days for fewer logins
  );
  return token;
};

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // ✅ Add validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    
    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'student'
    });
    
    await newUser.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error); // ✅ Check this in terminal
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// ✅ UPDATE LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ✅ GENERATE TOKEN WITH PROFILE PICTURE
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        username: user.username,        // ✅ ADD
        name: user.name,                // ✅ ADD
        email: user.email,              // ✅ ADD
        profilePicture: user.profilePicture || null, // ✅ ADD
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login token generated with profilePicture:', user.profilePicture);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, // ✅ ADD THIS
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/google-login', async (req, res) => {
  console.time('google-login-operation');
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Generate a unique, sanitized username
      let baseUsername = name ? name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : 'user';
      let username = baseUsername;
      let tries = 0;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
        if (++tries > 10) {
          username = `${baseUsername}${Date.now()}`;
          break;
        }
      }
      user = new User({
        username,
        email,
        password: await bcrypt.hash(sub + email, 8),
        role: 'user',
        profilePicture: picture || null,
        // Do NOT set location unless valid GeoJSON
      });
      try {
        await user.save();
      } catch (err) {
        return res.status(400).json({ message: 'Signup required. Please sign up first.' });
      }
    } else if (!user.profilePicture && picture) {
      user.profilePicture = picture;
      await user.save();
    }

    const jwtToken = signUserToken(user);
    
    console.timeEnd('google-login-operation');
    
    return res.json({ 
      token: jwtToken, 
      role: user.role,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        credits: user.credits,
      }
    });
  } catch (error) {
    console.timeEnd('google-login-operation');
    console.error('Google auth error:', error);
    return res.status(400).json({ message: 'Google authentication failed.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  console.time('forgot-password-operation');
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.timeEnd('forgot-password-operation');
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: '"Atyant" <notification@atyant.in>',
      to: user.email,
      subject: 'Password Reset Request',
      text: `Please click on the following link to reset your password: ${resetLink}`,
      html: `<p>Please click on the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      console.timeEnd('forgot-password-operation');
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send password reset email.' });
      } else {
        console.log('Email sent:', info.response);
        return res.json({ message: 'Password reset link sent to your email address.' });
      }
    });
  } catch (error) {
    console.timeEnd('forgot-password-operation');
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request.' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  console.time('reset-password-operation');
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.timeEnd('reset-password-operation');
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // ✅ OPTIMIZED: Reduced bcrypt cost from 10 to 8
    const hashedPassword = await bcrypt.hash(password, 8);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    console.timeEnd('reset-password-operation');
    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.timeEnd('reset-password-operation');
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

export default router;
