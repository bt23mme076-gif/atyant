import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users/mentors - List all mentors
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('-password');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
