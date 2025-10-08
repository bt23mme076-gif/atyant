// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

const signUserToken = (user) => {
  console.time('jwt-generation');
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
  console.timeEnd('jwt-generation');
  return token;
};

router.post('/signup', async (req, res) => {
  console.time('signup-operation');
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      console.timeEnd('signup-operation');
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    console.time('user-existence-check');
    const existingUser = await User.findOne({ email });
    console.timeEnd('user-existence-check');

    if (existingUser) {
      console.timeEnd('signup-operation');
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    console.time('password-hashing');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.timeEnd('password-hashing');

    console.time('user-creation');
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();
    console.timeEnd('user-creation');

    const token = signUserToken(newUser);
    console.timeEnd('signup-operation');
    return res.status(201).json({ token, role: newUser.role });
  } catch (error) {
    console.timeEnd('signup-operation');
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during user creation.' });
  }
});

router.post('/login', async (req, res) => {
  console.time('login-operation');
  try {
    const { email, password } = req.body;

    console.time('user-lookup');
    const user = await User.findOne({ email });
    console.timeEnd('user-lookup');

    if (!user) {
      console.timeEnd('login-operation');
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    console.time('password-comparison');
    const isMatch = await bcrypt.compare(password, user.password);
    console.timeEnd('password-comparison');

    if (!isMatch) {
      console.timeEnd('login-operation');
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = signUserToken(user);
    console.timeEnd('login-operation');
    return res.json({ token, role: user.role });
  } catch (error) {
    console.timeEnd('login-operation');
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

router.post('/google-login', async (req, res) => {
  console.time('google-login-operation');
  const { token } = req.body;
  try {
    console.time('google-token-verification');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.timeEnd('google-token-verification');

    const { name, email, sub, picture } = ticket.getPayload();

    console.time('google-user-lookup');
    let user = await User.findOne({ email });
    console.timeEnd('google-user-lookup');

    if (!user) {
      console.time('google-user-creation');
      user = new User({
        username: name,
        email,
        password: await bcrypt.hash(sub + email, 10),
        role: 'user',
        profilePicture: picture || null,
      });
      await user.save();
      console.timeEnd('google-user-creation');
    } else if (!user.profilePicture && picture) {
      console.time('google-profile-update');
      user.profilePicture = picture;
      await user.save();
      console.timeEnd('google-profile-update');
    }

    const jwtToken = signUserToken(user);
    console.timeEnd('google-login-operation');
    return res.json({ token: jwtToken, role: user.role });
  } catch (error) {
    console.timeEnd('google-login-operation');
    console.error('Google auth error:', error);
    return res.status(400).json({ message: 'Google authentication failed.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
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
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send password reset email.' });
      } else {
        console.log('Email sent:', info.response);
        return res.json({ message: 'Password reset link sent to your email address.' });
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request.' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

export default router;
