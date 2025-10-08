// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
<<<<<<< HEAD
import nodemailer from 'nodemailer'; // Import nodemailer
=======
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from '../utils/emailService.js';
>>>>>>> aed01af7cf144901ba8e386c23308f8e17e78b3c

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
      console.timeEnd('signup-operation'); // ⭐ ADD THIS - error case में end करें
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

<<<<<<< HEAD
// --- Forgot Password Route ---
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    // Generate a unique password reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Store the token in the database
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send an email to the user with a link to reset their password
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`; // Replace with your frontend URL
    
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Define the email options
    const mailOptions = {
      from: '"Atyant" <notification@atyant.in>',
      to: user.email,
      subject: 'Password Reset Request',
      text: `Please click on the following link to reset your password: ${resetLink}`,
      html: `<p>Please click on the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
    };

    // Send the email
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

// --- Reset Password Route ---
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Check if the token exists in the database and is not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
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
=======
// --- FORGOT PASSWORD ROUTE ---
router.post('/forgot-password', async (req, res) => {
  console.time('forgot-password-operation');
  
  try {
    const { email } = req.body;
    
    // Validate email input
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    console.time('user-lookup');
    const user = await User.findOne({ email });
    console.timeEnd('user-lookup');
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set reset token and expiration (1 hour from now)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    console.time('user-save');
    await user.save();
    console.timeEnd('user-save');
    
    // Send email with reset link
    try {
      console.time('email-send');
      await sendPasswordResetEmail(email, resetToken);
      console.timeEnd('email-send');
      
      console.timeEnd('forgot-password-operation');
      return res.status(200).json({ 
        message: 'Password reset link has been sent to your email.' 
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      
      // Clear the reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      console.timeEnd('forgot-password-operation');
      return res.status(500).json({ 
        message: 'Failed to send password reset email. Please try again later.' 
      });
    }
    
  } catch (error) {
    console.timeEnd('forgot-password-operation');
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      message: 'Server error. Please try again later.' 
    });
  }
});

// --- RESET PASSWORD ROUTE ---
router.post('/reset-password', async (req, res) => {
  console.time('reset-password-operation');
  
  try {
    const { token, password } = req.body;
    
    // Validate input
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // Hash the token to compare with stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    console.time('user-lookup');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });
    console.timeEnd('user-lookup');
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired password reset token.' 
      });
    }

    // Hash new password
    console.time('password-hashing');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.timeEnd('password-hashing');
    
    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    console.time('user-save');
    await user.save();
    console.timeEnd('user-save');
    
    // Send confirmation email
    try {
      console.time('confirmation-email-send');
      await sendPasswordResetConfirmation(user.email, user.username);
      console.timeEnd('confirmation-email-send');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if confirmation email fails
    }
    
    console.timeEnd('reset-password-operation');
    return res.status(200).json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
    
  } catch (error) {
    console.timeEnd('reset-password-operation');
    console.error('Reset password error:', error);
    return res.status(500).json({ 
      message: 'Server error. Please try again later.' 
    });
  }
});

export default router;
>>>>>>> aed01af7cf144901ba8e386c23308f8e17e78b3c
