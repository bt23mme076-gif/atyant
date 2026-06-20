import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Cache for 10 minutes — college list doesn't change per-request
let collegeCache = null;
let collegeCacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

/**
 * GET /api/stats/colleges
 * Public — no auth required.
 * Returns unique college names with student counts, sorted by count desc.
 */
router.get('/colleges', async (req, res) => {
  try {
    if (collegeCache && Date.now() - collegeCacheTime < CACHE_TTL) {
      return res.json(collegeCache);
    }

    const results = await User.aggregate([
      // Unwind education array so each entry is a separate document
      { $unwind: { path: '$education', preserveNullAndEmpty: false } },
      // Normalize: prefer institutionName, fall back to institution
      {
        $addFields: {
          collegeName: {
            $trim: {
              input: {
                $ifNull: ['$education.institutionName', '$education.institution'],
              },
            },
          },
        },
      },
      // Drop blank / null entries
      { $match: { collegeName: { $nin: [null, '', 'null', 'undefined'] } } },
      // One row per user per unique college
      { $group: { _id: { user: '$_id', college: '$collegeName' } } },
      // Count users per college
      { $group: { _id: '$_id.college', count: { $sum: 1 } } },
      // Only colleges with at least 1 user
      { $match: { count: { $gte: 1 } } },
      { $sort: { count: -1 } },
      // Cap at 100 colleges for the map
      { $limit: 100 },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]);

    const payload = { colleges: results, updatedAt: new Date() };
    collegeCache = payload;
    collegeCacheTime = Date.now();

    res.json(payload);
  } catch (err) {
    console.error('stats/colleges error:', err.message);
    res.status(500).json({ message: 'Failed to fetch college stats' });
  }
});

export default router;
