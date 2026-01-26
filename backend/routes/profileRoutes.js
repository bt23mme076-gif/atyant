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
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Basic Fields update
    const basicFields = ['username', 'bio', 'city', 'linkedinProfile', 'companyDomain', 'primaryDomain', 'strategy'];
    basicFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'strategy' && typeof req.body[field] === 'object') {
          user.strategy = { ...(user.strategy?.toObject?.() || user.strategy || {}), ...req.body[field] };
          user.markModified('strategy'); // 🔥 Ensure Mongoose saves nested changes
        } else {
          user[field] = req.body[field];
        }
      }
    });

    // 🔥 Handle Enums separately to prevent "" (empty string) errors
if (req.body.companyDomain === "" || req.body.companyDomain === null) {
  user.companyDomain = undefined; // This allows the 'default: null' to work
} else if (req.body.companyDomain) {
  user.companyDomain = req.body.companyDomain;
}
      // 🔥 Handle primaryDomain enum to prevent "" (empty string) errors
      if (req.body.primaryDomain === "" || req.body.primaryDomain === null) {
        user.primaryDomain = undefined; // This allows the 'default: null' to work
      } else if (req.body.primaryDomain) {
        const allowedDomains = ['placement', 'internship', 'both'];
        if (allowedDomains.includes(req.body.primaryDomain)) {
          user.primaryDomain = req.body.primaryDomain;
        }
      }

    // 2. Array Fields update
    const arrayFields = ['interests', 'expertise', 'domainExperience', 'skills', 'topCompanies', 'milestones', 'specialTags'];
    arrayFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = Array.isArray(updateData[field]) ? updateData[field] : [];
      }
    });

    // 3. Education Logic (Processed once)
    if (updateData.education !== undefined) {
      user.education = Array.isArray(updateData.education)
        ? updateData.education.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            year: edu.year,
            cgpa: edu.cgpa ? Number(edu.cgpa) : undefined
          }))
          .filter(edu => edu.institution && edu.degree)
        : [];
    }

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'Profile updated', user: userResponse });

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
