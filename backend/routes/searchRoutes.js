import express from 'express';
import User from '../models/User.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ─────────────────────────────────────────────
//  SEARCH MENTORS
// ─────────────────────────────────────────────
router.get('/mentors', optionalAuth, async (req, res) => {
  try {
    const { q, category, mentorBackground, sort } = req.query;

    const filter      = { role: 'mentor' };
    let   sortOptions = { lastActive: -1 };   // 🔴 FIX: default = most recently active

    // ── Text search ──────────────────────────
    if (q?.trim()) {
      const re = { $regex: q.trim(), $options: 'i' };
      filter.$or = [
        { username : re },
        { bio      : re },
        { expertise: re },
        { skills   : re },
        { 'education.institution': re }
      ];
    }

    // ── Category filter ───────────────────────
    if (category && category !== 'All') {
      switch (category) {
        case 'Roadmap & Guidance':
          filter.expertise = { $elemMatch: { $regex: /roadmap|guidance|career/i } };
          break;
        case 'Internships':
          filter.expertise = { $elemMatch: { $regex: /internship|intern/i } };
          break;
        case 'Placements':
          filter.expertise = { $elemMatch: { $regex: /placement|job|interview/i } };
          break;
        case 'Higher Studies':
          filter.expertise = { $elemMatch: { $regex: /higher studies|ms|mba/i } };
          break;
        case 'Startups / Entrepreneurship':
          filter.expertise = { $elemMatch: { $regex: /startup|entrepreneur/i } };
          break;
        case 'Top Rated Mentors':
          filter.rating = { $gte: 4.5 };
          break;
        case 'Active Now':
          filter.isOnline = true;
          break;
      }
    }

    // ── Mentor background filter ──────────────
    if (mentorBackground && mentorBackground !== 'All') {
      const userCollege = req.user?.education?.[0]?.institution ||
                          req.user?.education?.[0]?.institutionName;

      if (
        (mentorBackground === 'Senior from My College' ||
         mentorBackground === 'Alumni from My College') && userCollege
      ) {
        filter['education.institution'] = userCollege;
      } else if (mentorBackground === 'Industry Professional') {
        filter.expertise = { $elemMatch: { $regex: /engineer|developer|manager|professional/i } };
      } else if (mentorBackground === 'Founder / Entrepreneur') {
        filter.expertise = { $elemMatch: { $regex: /founder|ceo|entrepreneur/i } };
      } else if (mentorBackground === 'Exam / Subject Expert') {
        filter.expertise = { $elemMatch: { $regex: /exam|gate|gre|cat/i } };
      }
    }

    // ── Sort ──────────────────────────────────
    switch (sort) {
      case 'Most Helpful':
      case 'Highest Rated':
        sortOptions = { rating: -1 };
        break;
      case 'Most Active':
        sortOptions = { lastActive: -1 };
        break;
      case 'Lowest Price':
        sortOptions = { price: 1 };
        break;
      case 'Most Experienced':
        sortOptions = { yearsOfExperience: -1 };
        break;
      case 'Newest Mentors':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { lastActive: -1 };
    }

    // Respect client-provided `limit` with a safe upper bound to avoid huge responses
    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 1000) : 100;

    const mentors = await User.find(filter)
      .sort(sortOptions)
      .limit(limit)
      .select('username name profilePicture bio rating expertise skills education location isOnline lastActive price yearsOfExperience topCompanies specialTags primaryDomain')
      .lean();

    res.json(mentors);
  } catch (error) {
    console.error('search/mentors error:', error);
    res.status(500).json({ message: 'Error searching mentors', error: error.message });
  }
});

export default router;
