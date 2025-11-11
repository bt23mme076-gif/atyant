// backend/routes/searchRoutes.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ✅ Search mentors endpoint with college matching using user profile
router.get('/mentors', async (req, res) => {
  try {
    const {
      q,
      category,
      mentorBackground,
      availability,
      price,
      sort
    } = req.query;

    // ✅ Get user college from authenticated user's education
    const userCollege = req.user?.education?.[0]?.institution;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 Incoming Request:');
    console.log('  Query params:', req.query);
    console.log('  User College (from profile):', userCollege);
    console.log('  Mentor Background:', mentorBackground);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ✅ Build filter object
    let filter = { role: 'mentor' };

    // Text search across multiple fields
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { specialties: { $in: [new RegExp(q, 'i')] } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    // ✅ Category filter (Main buttons)
    if (category && category !== 'All') {
      switch (category) {
        case 'Help for Roadmap & Guidance':
          filter.specialties = { $in: [/roadmap/i, /guidance/i, /career/i] };
          break;
        case 'Help for Internships':
          filter.specialties = { $in: [/internship/i] };
          break;
        case 'Help for Placements':
          filter.specialties = { $in: [/placement/i, /job/i] };
          break;
        case 'Help for Higher Studies':
          filter.specialties = { $in: [/higher studies/i, /ms/i, /mba/i, /abroad/i] };
          break;
        case 'Help for Startups / Entrepreneurship':
          filter.specialties = { $in: [/startup/i, /entrepreneur/i, /business/i] };
          break;
        case 'Top Rated Mentors':
          filter.rating = { $gte: 4.5 };
          break;
        case 'Active Now':
          filter.isOnline = true;
          break;
      }
    }

    // ✅ Mentor Background filter with COLLEGE MATCHING
    if (mentorBackground && mentorBackground !== 'All') {
      if (
        mentorBackground === 'Senior from My College' ||
        mentorBackground === 'Alumni from My College'
      ) {
        // ✅ Match mentor's education[].institution with user's institution
        if (userCollege) {
          filter['education.institution'] = userCollege;
          console.log('🎓 Filtering by institution:', userCollege);
        } else {
          console.log('⚠️ No userCollege found in profile');
          return res.json([]);
        }
      } else {
        // ✅ Other mentor backgrounds (existing logic)
        const backgroundMap = {
          'Industry Professional': {
            title: { $regex: /engineer|developer|manager|professional|analyst|consultant/i }
          },
          'Founder / Entrepreneur': {
            title: { $regex: /founder|ceo|entrepreneur|co-founder|startup/i }
          },
          'Exam / Subject Expert': {
            specialties: { $in: [/exam/i, /gate/i, /gre/i, /cat/i, /jee/i, /neet/i] }
          }
        };

        if (backgroundMap[mentorBackground]) {
          filter = { ...filter, ...backgroundMap[mentorBackground] };
        }
      }
    }

    // ✅ Availability filter
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

    // ✅ Price filter
    if (price && price !== 'All') {
      const priceRanges = {
        'Free': { price: 0 },
        '₹0–200': { price: { $gte: 0, $lte: 200 } },
        '₹200–500': { price: { $gte: 200, $lte: 500 } },
        '₹500–1000': { price: { $gte: 500, $lte: 1000 } },
        '₹1000+': { price: { $gte: 1000 } },
        'Use Atyant Credits': { acceptsCredits: true }
      };

      if (priceRanges[price]) {
        filter = { ...filter, ...priceRanges[price] };
      }
    }

    // ✅ Sort options
    let sortOptions = {};
    switch (sort) {
      case 'Most Helpful':
      case 'Highest Rated':
        sortOptions = { rating: -1, reviewsCount: -1 };
        break;
      case 'Most Active':
        sortOptions = { lastActive: -1, isOnline: -1 };
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
        sortOptions = { rating: -1, reviewsCount: -1, isOnline: -1 };
        break;
    }

    // ✅ Execute query
    const mentors = await User.find(filter)
      .sort(sortOptions)
      .limit(50)
      .select('-password -email')
      .lean();

    console.log('✅ Found mentors:', mentors.length);

    // ✅ Log each mentor's education
    mentors.forEach(m => {
      console.log(`  - ${m.name}: ${m.education?.[0]?.institution || 'No institution'}`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json(mentors);

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ message: 'Error', error: error.message });
  }
});

export default router;
