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
// ========== UPDATE USER PROFILE (PROTECTED) - FIXED FOR ATYANT ENGINE ==========
router.put('/me', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    
    // 🚀 1. Extraction:req.body se naye fields nikalna
    const { 
      username, 
      bio, 
      city, 
      interests,
      education, 
      expertise,
      domainExperience,
      linkedinProfile,
      skills,
      // 🔥 NAYE ENGINE FIELDS YAHAN ADD KIYE HAIN
      primaryDomain,
      topCompanies,
      milestones,
      specialTags 
    } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Basic fields update
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (city !== undefined) user.city = city;
    if (linkedinProfile !== undefined) user.linkedinProfile = linkedinProfile;
    
    // Arrays update with safety check
    if (interests !== undefined) user.interests = Array.isArray(interests) ? interests : [];
    if (expertise !== undefined) user.expertise = Array.isArray(expertise) ? expertise : [];
    if (domainExperience !== undefined) user.domainExperience = Array.isArray(domainExperience) ? domainExperience : [];
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
    if (education !== undefined) user.education = Array.isArray(education) ? education : [];

    // 🚀 2. Assignment: Naye Engine Fields ko Save karna (Mentor only)
    if (user.role === 'mentor') {
      if (primaryDomain !== undefined) user.primaryDomain = primaryDomain;
      if (topCompanies !== undefined) {
        user.topCompanies = Array.isArray(topCompanies) ? topCompanies : [];
      }
      if (milestones !== undefined) {
        user.milestones = Array.isArray(milestones) ? milestones : [];
      }
      if (specialTags !== undefined) {
        user.specialTags = Array.isArray(specialTags) ? specialTags : [];
      }
    }

    // Safety check for location
    if (user.location && typeof user.location === 'object') {
      if (!user.location.coordinates || user.location.coordinates.length !== 2) {
        user.location = undefined;
      }
    }
    
    // 💾 Database mein save karein
    const updatedUser = await user.save({ validateBeforeSave: true });
    
    console.log('✅ User updated with Engine tags successfully');
    
    // Return updated data
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
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
