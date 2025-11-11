// backend/routes/searchRoutes.js
import express from 'express';
import User from '../models/User.js';
import { optionalAuth } from '../middleware/auth.js'; // ✅ Import optionalAuth

const router = express.Router();

// ✅ Use optionalAuth instead of auth - allows both logged-in and guest users
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ✅ Base filter - always show mentors
    let filter = { role: 'mentor' };

    // Text search
    if (q && q.trim()) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { specialties: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      switch (category) {
        case 'Roadmap & Guidance':
          filter.specialties = { $in: [/roadmap/i, /guidance/i, /career/i] };
          break;
        case 'Internships':
          filter.specialties = { $in: [/internship/i] };
          break;
        case 'Placements':
          filter.specialties = { $in: [/placement/i, /job/i] };
          break;
        case 'Higher Studies':
          filter.specialties = { $in: [/higher studies/i, /ms/i, /mba/i] };
          break;
        case 'Startups / Entrepreneurship':
          filter.specialties = { $in: [/startup/i, /entrepreneur/i] };
          break;
        case 'Top Rated Mentors':
          filter.rating = { $gte: 4.5 };
          break;
        case 'Active Now':
          filter.isOnline = true;
          break;
      }
    }

    // Mentor Background
    if (mentorBackground && mentorBackground !== 'All') {
      const userCollege = req.user?.education?.[0]?.institution;

      if (mentorBackground === 'Senior from My College' || 
          mentorBackground === 'Alumni from My College') {
        
        if (userCollege) {
          filter['education.institution'] = userCollege;
          console.log('🎓 Filtering by college:', userCollege);
        } else {
          console.log('⚠️ College filter requires login - showing all mentors');
          // Don't filter by college if user not logged in
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
            specialties: { $in: [/exam/i, /gate/i, /gre/i, /cat/i] } 
          }
        };
        if (backgroundMap[mentorBackground]) {
          filter = { ...filter, ...backgroundMap[mentorBackground] };
        }
      }
    }

    // Availability
    if (availability && availability !== 'All') {
      switch (availability) {
        case 'Available Now':
          filter.isOnline = true;
          break;
        case 'This Week':
        case 'By Appointment':
          filter.hasScheduling = true;
          break;
      }
    }

    // Price
    if (price && price !== 'All') {
      const priceMap = {
        'Free': { price: 0 },
        '₹0–200': { price: { $gte: 0, $lte: 200 } },
        '₹200–500': { price: { $gte: 200, $lte: 500 } },
        '₹500–1000': { price: { $gte: 500, $lte: 1000 } },
        '₹1000+': { price: { $gte: 1000 } }
      };
      if (priceMap[price]) {
        filter = { ...filter, ...priceMap[price] };
      }
    }

    console.log('🔍 Filter:', JSON.stringify(filter, null, 2));

    // Sort
    let sortOptions = {};
    switch (sort) {
      case 'Highest Rated':
        sortOptions = { rating: -1 };
        break;
      case 'Most Active':
        sortOptions = { lastActive: -1 };
        break;
      case 'Lowest Price':
        sortOptions = { price: 1 };
        break;
      case 'Newest Mentors':
        sortOptions = { createdAt: -1 };
        break;
      case 'Recommended':
      default:
        sortOptions = { rating: -1, createdAt: -1 };
        break;
    }

    // Execute query
    const mentors = await User.find(filter)
      .sort(sortOptions)
      .limit(50)
      .select('-password -email')
      .lean();

    console.log('✅ Found mentors:', mentors.length);
    
    if (mentors.length === 0) {
      const totalMentors = await User.countDocuments({ role: 'mentor' });
      console.log('📊 Total mentors in DB:', totalMentors);
    }

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
