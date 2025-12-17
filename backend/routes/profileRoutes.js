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
    
    const userId = req.user.id || req.user.userId;
    
    const user = await User.findById(userId).select('-password -verificationToken -passwordResetToken');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ✅ Add location status to response
    const hasLocation = !!(user.location?.coordinates && user.location.coordinates.length === 2);
    
    console.log('✅ User found:', user.username);
    console.log(hasLocation ? '✅ Location set' : '⚠️ Location not set');
    
    res.json({
      ...user.toObject(),
      hasLocation // ✅ Frontend can use this
    });
    
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
    
    // ✅ FIX CORRUPTED DATA: Fetch user with lean to avoid validation on corrupted data
    const userDoc = await User.findById(userId).lean();
    
    if (!userDoc) {
      console.log('❌ User not found for update');
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ✅ Clean corrupted data before updating
    const cleanData = { ...userDoc };
    
    // Fix city field if it's an object instead of string
    if (cleanData.city && typeof cleanData.city === 'object') {
      console.log('⚠️ Fixing corrupted city field');
      if (cleanData.city.city && typeof cleanData.city.city === 'string') {
        cleanData.city = cleanData.city.city;
      } else {
        cleanData.city = '';
      }
    }
    
    // Fix location.city field if it's an object
    if (cleanData.location && cleanData.location.city && typeof cleanData.location.city === 'object') {
      console.log('⚠️ Fixing corrupted location.city field');
      if (cleanData.location.city.city && typeof cleanData.location.city.city === 'string') {
        cleanData.location.city = cleanData.location.city.city;
      } else {
        cleanData.location.city = null;
      }
    }
    
    // ✅ Now get the actual Mongoose document and update it
    const user = await User.findById(userId);
    
    // Apply cleaned data
    if (cleanData.city !== userDoc.city) {
      user.city = cleanData.city;
      console.log('✅ Cleaned city:', user.city);
    }
    
    if (cleanData.location && cleanData.location.city !== userDoc.location?.city) {
      if (!user.location) user.location = {};
      user.location.city = cleanData.location.city;
      console.log('✅ Cleaned location.city:', user.location.city);
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
    
    // ✅ Ensure location object is valid before saving
    if (user.location && typeof user.location === 'object') {
      // If location exists but coordinates are invalid, set to undefined
      if (!user.location.coordinates || !Array.isArray(user.location.coordinates) || user.location.coordinates.length !== 2) {
        user.location = undefined;
        console.log('⚠️ Invalid location removed');
      }
    }
    
    // ✅ Save with validation
    const updatedUser = await user.save({ validateBeforeSave: true });
    
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
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Username already exists' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    
    // ✅ Increment profile views for mentors ONLY if viewer is different user
    // Get viewer's ID from Authorization header if present
    const authHeader = req.headers.authorization;
    let viewerId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        viewerId = decoded.id || decoded.userId;
      } catch (err) {
        // Token invalid or expired, continue without viewer ID
      }
    }
    
    // Only count if: 1) user is mentor, 2) viewer is not the mentor themselves
    if (user.role === 'mentor' && viewerId && viewerId !== user._id.toString()) {
      User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } }).catch(err => 
        console.error('Error updating profile views:', err)
      );
      console.log(`📊 Profile view counted for mentor: ${user.username} (viewer: ${viewerId})`);
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
