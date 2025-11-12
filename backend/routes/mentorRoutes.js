import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users/mentors - List all mentors
router.get('/mentors', async (req, res) => {
  try {
    // ✅ Fetch ALL mentors (no limit)
    // ✅ Sort by createdAt ascending (oldest first, newest last)
    const mentors = await User.find({ role: 'mentor' })
      .select('-password -email')
      .sort({ createdAt: 1 })  // ✅ 1 = ascending order (oldest first)
      .lean();  // ✅ Returns plain JavaScript objects (faster)
    
    console.log(`✅ Fetched ${mentors.length} mentors (oldest first)`);
    res.json(mentors);
  } catch (error) {
    console.error('❌ Error fetching mentors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
