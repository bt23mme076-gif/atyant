// backend/routes/askRoutes.js
import express from 'express';
import User from '../models/User.js';
import { extractKeywords } from '../utils/keywordExtractor.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/suggest-mentors', protect, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ message: 'Question is required.' });
        }

        const keywords = extractKeywords(question);
        if (keywords.length === 0) {
            return res.json([]); // Return empty if no useful keywords
        }

        // Find mentors where their 'expertise' array contains ANY of the keywords
        const mentors = await User.find({
            role: 'mentor',
            expertise: { $in: keywords.map(kw => new RegExp(kw, 'i')) } // Case-insensitive regex match
        }).select('username _id profilePicture expertise');

        res.json(mentors);
    } catch (error) {
        res.status(500).json({ message: 'Error suggesting mentors' });
    }
});
export default router;