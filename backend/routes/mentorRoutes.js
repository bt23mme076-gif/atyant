import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Message from '../models/Message.js';
import protect from '../middleware/authMiddleware.js';

const isDev = process.env.NODE_ENV === 'development';

// ✅ PERFORMANCE: Cache mentor list
let mentorCache = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ========== GET ALL MENTORS (WITH CACHING) ==========
router.get('/mentors', async (req, res) => {
  try {
    // ✅ Return cached data if fresh
    if (mentorCache && cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
      if (isDev) console.log('✅ Returning cached mentors');
      return res.json(mentorCache);
    }

    // ✅ PERFORMANCE: Optimized query
    const mentors = await User.find({ role: 'mentor' })
      .select('username profilePicture bio city expertise skills isOnline lastActive yearsOfExperience price location')
      .lean() // ✅ Returns plain JS objects (30% faster)
      .sort({ _id: 1 }); // ✅ Oldest mentor first

    // ✅ Update cache
    mentorCache = mentors;
    cacheTime = Date.now();

    if (isDev) console.log(`✅ Fetched ${mentors.length} mentors from DB`);

    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== GET MENTOR BY ID ==========
router.get('/mentors/:id', async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id)
      .select('-password') // ✅ Don't send password
      .lean(); // ✅ Faster

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // ✅ Increment profile views asynchronously (don't wait)
    User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } }).catch(err => 
      console.error('Error updating profile views:', err)
    );

    res.json(mentor);
  } catch (error) {
    console.error('Error fetching mentor:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== SEARCH MENTORS ==========
router.get('/search', async (req, res) => {
  try {
    const { q, expertise, city } = req.query;
    
    let query = { role: 'mentor' };
    
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (expertise) {
      query.expertise = { $in: [expertise] };
    }
    
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const mentors = await User.find(query)
      .select('username profilePicture bio city expertise skills isOnline')
      .lean()
      .limit(50);

    res.json(mentors);
  } catch (error) {
    console.error('Error searching mentors:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== CLEAR CACHE ENDPOINT (Admin) ==========
router.post('/clear-cache', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  mentorCache = null;
  cacheTime = null;
  
  res.json({ message: 'Cache cleared successfully' });
});

// ========== GET MENTOR STATISTICS (Dashboard) ==========
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can access this' });
    }

    const mentorId = req.user.id || req.user.userId;
    const mentor = await User.findById(mentorId)
      .select('profileViews totalChats username')
      .lean();

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Get active chats (last 7 days) - count unique conversations
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Convert string ID to ObjectId for aggregation
    const mongoose = await import('mongoose');
    const mentorObjectId = new mongoose.default.Types.ObjectId(mentorId);

    const activeConversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mentorObjectId, createdAt: { $gte: sevenDaysAgo } },
            { receiver: mentorObjectId, createdAt: { $gte: sevenDaysAgo } }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', mentorObjectId] },
              '$receiver',
              '$sender'
            ]
          }
        }
      },
      { $count: 'total' }
    ]);

    const activeChats = activeConversations.length > 0 ? activeConversations[0].total : 0;

    console.log(`📊 Stats for ${mentor.username}:`, {
      mentorId: mentorId,
      profileViews: mentor.profileViews || 0,
      totalChats: mentor.totalChats || 0,
      activeChats
    });

    res.json({
      profileViews: mentor.profileViews || 0,
      totalChats: mentor.totalChats || 0,
      activeChats: activeChats || 0
    });

  } catch (error) {
    console.error('Error fetching mentor stats:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
