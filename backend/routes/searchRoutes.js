// backend/routes/searchRoutes.js
import express from 'express';
import User from '../models/User.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/mentors', optionalAuth, async (req, res) => {
  try {
    const {
      q,
      category,
      mentorBackground,
      availability,
      price,
      sort
    } = req.query;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 Search Request:');
    console.log('  User:', req.user ? req.user.username : 'Guest');
    console.log('  Query params:', req.query);

    let filter = { role: 'mentor' };
    let sortOptions = {};

    // Text search
    if (q && q.trim()) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } },
        { expertise: { $regex: q, $options: 'i' } },
        { 'education.institution': { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      const categoryMap = {
        'Roadmap & Guidance': { expertise: { $in: [/roadmap/i, /guidance/i, /career/i] } },
        'Internships': { expertise: { $in: [/internship/i, /intern/i] } },
        'Placements': { expertise: { $in: [/placement/i, /job/i, /interview/i] } },
        'Higher Studies': { expertise: { $in: [/higher studies/i, /ms/i, /mba/i] } },
        'Startups / Entrepreneurship': { expertise: { $in: [/startup/i, /entrepreneur/i] } },
        'Top Rated Mentors': { rating: { $gte: 4.5 } },
        'Active Now': { isOnline: true }
      };
      if (categoryMap[category]) {
        filter = { ...filter, ...categoryMap[category] };
      }
    }

    // Mentor Background
    if (mentorBackground && mentorBackground !== 'All') {
      const userCollege = req.user?.education?.[0]?.institution;

      if (mentorBackground === 'Senior from My College' || 
          mentorBackground === 'Alumni from My College') {
        if (userCollege) {
          filter['education.institution'] = userCollege;
        }
      } else {
        const backgroundMap = {
          'Industry Professional': { 
            title: { $regex: /engineer|developer|manager|professional/i } 
          },
          'Founder / Entrepreneur': { 
            title: { $regex: /founder|ceo|entrepreneur/i } 
          },
          'Exam / Subject Expert': { 
            expertise: { $in: [/exam/i, /gate/i, /gre/i, /cat/i] } 
          }
        };
        if (backgroundMap[mentorBackground]) {
          filter = { ...filter, ...backgroundMap[mentorBackground] };
        }
      }
    }

    // Sort
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
      case 'Recommended':
      default:
        sortOptions = { rating: -1, createdAt: -1 };
        break;
    }

    // Execute query with all necessary fields
    const mentors = await User.find(filter)
      .sort(sortOptions)
      .limit(50)
      .select('username name email profilePicture bio title company rating reviewsCount tags specialties badges expertise skills education location createdAt')
      .lean();

    console.log('✅ Found mentors:', mentors.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json(mentors);

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      message: 'Error searching mentors', 
      error: error.message 
    });
  }
});

export default router;
