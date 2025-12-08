const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken'); // ✅ ADD THIS

// Multer config
const upload = multer({
  dest: 'uploads/profiles/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ✅ NEW: Get user by ID (for fetching profile picture in chat)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ UPDATE THIS ROUTE
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePictureUrl = `http://localhost:5000/uploads/profiles/${req.file.filename}`;

    // Update user in database
    await User.findByIdAndUpdate(req.user.userId, {
      profilePicture: profilePictureUrl,
    });

    console.log('✅ Profile picture updated:', profilePictureUrl);

    // ✅ GENERATE NEW TOKEN WITH PROFILE PICTURE
    const updatedUser = await User.findById(req.user.userId);
    
    const newToken = jwt.sign(
      {
        userId: updatedUser._id,
        role: updatedUser.role,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture, // ✅ ADD THIS
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: profilePictureUrl,
      token: newToken, // ✅ SEND NEW TOKEN
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

module.exports = router;