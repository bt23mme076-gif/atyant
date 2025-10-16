import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ========== GET CURRENT USER PROFILE (PROTECTED) ==========
router.get('/me', protect, async (req, res) => {
  try {
    console.log('🔍 Fetching profile for user ID:', req.user.id || req.user.userId);
    
    // ✅ Try both possible user ID fields
    const userId = req.user.id || req.user.userId;
    
    const user = await User.findById(userId).select('-password -verificationToken -passwordResetToken');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', user.username);
    res.json(user);
    
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ========== UPDATE USER PROFILE (PROTECTED) - FIXED ==========
router.put('/me', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    
    console.log('📝 Update request for user:', userId);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      username, 
      bio, 
      city, 
      interests,        // ✅ Added
      education, 
      expertise,        // ✅ Added
      domainExperience, // ✅ Fixed spelling
      linkedinProfile,
      skills
    } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ User not found for update');
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ✅ Update fields properly (handle undefined vs empty arrays)
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (city !== undefined) user.city = city;
    if (linkedinProfile !== undefined) user.linkedinProfile = linkedinProfile;
    
    // ✅ Handle arrays correctly (check for undefined, not falsy)
    if (interests !== undefined) {
      user.interests = Array.isArray(interests) ? interests : [];
      console.log('✅ Interests updated:', user.interests);
    }
    
    if (expertise !== undefined) {
      user.expertise = Array.isArray(expertise) ? expertise : [];
      console.log('✅ Expertise updated:', user.expertise);
    }
    
    if (domainExperience !== undefined) {
      user.domainExperience = Array.isArray(domainExperience) ? domainExperience : [];
      console.log('✅ Domain Experience updated:', user.domainExperience);
    }
    
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : [];
    }
    
    if (education !== undefined) {
      user.education = Array.isArray(education) ? education : [];
      console.log('✅ Education updated:', user.education);
    }
    
    // ✅ Save with validation
    const updatedUser = await user.save();
    
    console.log('✅ User updated successfully');
    console.log('📤 Final interests:', updatedUser.interests);
    
    // ✅ Return updated user without password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.passwordResetToken;
    
    res.json(userResponse);
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Username already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
});

// ========== UPLOAD PROFILE PICTURE (PROTECTED) ==========
router.post('/upload-picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // ✅ Upload to Cloudinary using Promise
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'atyant_profiles' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;
    
    user.profilePicture = result.secure_url;
    await user.save();
    
    console.log('✅ Profile picture updated:', result.secure_url);
    
    res.json({ 
      message: 'Profile picture updated successfully', 
      profilePicture: user.profilePicture 
    });
    
  } catch (error) {
    console.error('❌ Error uploading picture:', error);
    res.status(500).json({ 
      message: 'Server error during upload',
      error: error.message 
    });
  }
});

// ========== GET PUBLIC PROFILE BY USERNAME ==========
router.get('/:username', async (req, res) => {
  try {
    console.log('🔍 Fetching public profile for:', req.params.username);
    
    const user = await User.findOne({ 
      username: new RegExp(`^${req.params.username}$`, 'i')
    }).select('-password -verificationToken -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      console.log('❌ User not found:', req.params.username);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ Public profile sent for:', user.username);
    res.json(user);
    
  } catch (error) {
    console.error('❌ Error fetching public profile:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
});

export default router;