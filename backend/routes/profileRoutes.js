import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
// @desc    Get user profile
// @route   GET /api/profile/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/profile/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (user) {
      user.username = req.body.username || user.username;
      user.bio = req.body.bio || user.bio;
      user.linkedinProfile = req.body.linkedinProfile || user.linkedinProfile; // LinkedIn URL ko save karein
      if (user.role === 'mentor') {
          user.expertise = req.body.expertise || user.expertise;
      }
      const updatedUser = await user.save();
      res.json({
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          bio: updatedUser.bio,
          expertise: updatedUser.expertise,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
// --- NEW ROUTE FOR IMAGE UPLOAD ---
router.post('/upload-picture', protect, upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload_stream({
            folder: "atyant_profiles"
        }, async (error, result) => {
            if (error) throw new Error('Cloudinary upload failed');

            user.profilePicture = result.secure_url;
            await user.save();
            res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
        }).end(req.file.buffer);

    } catch (error) {
        res.status(500).json({ message: 'Server error during upload' });
    }
}); // Closing brace for the route handler

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;