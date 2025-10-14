// backend/routes/searchRoutes.js
import express from 'express';
import User from '../models/User.js';
const router = express.Router();

// @desc    Search for mentors by skill or name
// @route   GET /api/search/mentors?q=query
router.get('/mentors', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]); // Return empty array if no query
        }
        // Search for mentors whose username or skills match the query
        const mentors = await User.find({
            role: 'mentor',
            $or: [
                { username: { $regex: query, $options: 'i' } }, // Case-insensitive username search
                { expertise: { $regex: query, $options: 'i' } }   // Case-insensitive skills search
            ]
        })
        .select('username profilePicture _id') // Select only needed fields
        .limit(10);  // Limit results to 10

        res.json(mentors);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
});

export default router;