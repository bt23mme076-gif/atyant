import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, feedback } = req.body;

    if (!rating || !feedback) {
      return res.status(400).json({ message: 'Rating and feedback are required.' });
    }

    const newFeedback = new Feedback({ name, email, rating, feedback });
    await newFeedback.save();

    res.status(201).json({ message: '✅ Feedback submitted successfully!' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: '❌ Server error. Try again later.' });
  }
});

export default router;
