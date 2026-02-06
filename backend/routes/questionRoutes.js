import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { questionLimiter } from '../middleware/rateLimiters.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { sendMentorNewQuestionNotification } from '../utils/emailNotifications.js';
import atyantEngine from '../services/AtyantEngine.js';

const router = express.Router();

/**
 * STEP 2: Check Profile & Credits
 * GET /api/questions/check-eligibility
 */
router.get('/check-eligibility', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const profileStrength = user.calculateProfileStrength();
    const isProfileComplete = profileStrength >= 70; // Minimum 70% required
    
    const missingFields = [];
    if (!user.username) missingFields.push('Username');
    if (!user.bio) missingFields.push('Bio');
    if (!user.education || user.education.length === 0) missingFields.push('Education');
    if (!user.interests || user.interests.length === 0) missingFields.push('Interests');
    
    res.json({
      success: true,
      isProfileComplete,
      profileStrength,
      credits: user.credits || 0, // Question credits
      messageCredits: user.messageCredits || 0, // Chat credits
      missingFields,
      needsUpgrade: (user.credits || 0) === 0
    });
  } catch (error) {
    console.error('❌ Eligibility check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check eligibility' 
    });
  }
});

/**
 * STEP 3: Preview Mentor Match
 * POST /api/questions/preview-match
 */
router.post('/preview-match', questionLimiter, protect, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and description required' 
      });
    }
    
    // Extract keywords for matching
    const keywords = atyantEngine.extractBetterKeywords(description);
    
    // Find best mentor (don't assign yet, just preview)
    const bestMentor = await atyantEngine.findBestMentor(req.user.userId, keywords);
    
    if (!bestMentor) {
      return res.json({
        success: true,
        mentorFound: false,
        message: 'No mentor match found. We will find one after submission.'
      });
    }
    
    res.json({
      success: true,
      mentorFound: true,
      mentor: {
        id: bestMentor._id,
        name: bestMentor.name || bestMentor.username,
        bio: bestMentor.bio,
        expertise: bestMentor.expertise,
        profileImage: bestMentor.profilePicture,
        matchPercentage: bestMentor.matchScore || 85
      }
    });
  } catch (error) {
    console.error('❌ Mentor preview error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to find mentor match' 
    });
  }
});

/**
 * STEP 4: AI Quality Check
 * POST /api/questions/quality-check
 */
router.post('/quality-check', questionLimiter, protect, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    let qualityScore = 0;
    const issues = [];
    
    // Length check
    if (description.length < 50) {
      issues.push('Question is too short. Add more details.');
      qualityScore += 20;
    } else if (description.length < 100) {
      qualityScore += 50;
    } else {
      qualityScore += 70;
    }
    
    // Vague words detection
    const vagueWords = ['help', 'tips', 'advice', 'guidance', 'how', 'what'];
    const wordCount = description.split(/\s+/).length;
    const vagueCount = vagueWords.filter(word => 
      description.toLowerCase().includes(word)
    ).length;
    
    if (vagueCount / wordCount > 0.3) {
      issues.push('Question seems vague. Be more specific about your situation.');
      qualityScore -= 20;
    } else {
      qualityScore += 30;
    }
    
    // Question marks check
    if (!description.includes('?')) {
      issues.push('Add a clear question mark to improve clarity.');
      qualityScore -= 10;
    }
    
    // Context keywords
    const contextWords = ['currently', 'working on', 'struggling with', 'tried', 'background'];
    const hasContext = contextWords.some(word => description.toLowerCase().includes(word));
    
    if (hasContext) {
      qualityScore += 10;
    } else {
      issues.push('Add context about your current situation.');
    }
    
    qualityScore = Math.max(0, Math.min(100, qualityScore));
    
    res.json({
      success: true,
      qualityScore,
      issues,
      needsImprovement: qualityScore < 60
    });
  } catch (error) {
    console.error('❌ Quality check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check question quality' 
    });
  }
});

/**
 * STEP 8: Final Submission
 * POST /api/questions/submit
 */
router.post('/submit', questionLimiter, protect, async (req, res) => {
  try {
    const { title, description, category, reason, qualityScore, mentorId } = req.body;
    
    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title, description, and category are required' 
      });
    }
    
    // Check user credits
    const user = await User.findById(req.user.userId);
    if (user.credits <= 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient credits. Please upgrade.' 
      });
    }
    
    // Extract keywords
    const keywords = atyantEngine.extractBetterKeywords(description);
    
    // Create question
    const question = new Question({
      userId: req.user.userId,
      title,
      questionText: description, // Map to existing field
      category,
      reason: reason || '',
      qualityScore: qualityScore || 0,
      keywords,
      selectedMentorId: mentorId || null,
      status: 'submitted'
    });
    
    // If no mentor provided, find best match
    if (!mentorId) {
      const bestMentor = await atyantEngine.findBestMentor(req.user.userId, keywords);
      
      if (bestMentor) {
        question.selectedMentorId = bestMentor._id;
        question.matchPercentage = bestMentor.matchScore || 85;
        question.status = 'mentor_assigned';
        
        // Increment mentor's active questions if they have that field
        await User.findByIdAndUpdate(bestMentor._id, { 
          $inc: { activeQuestions: 1 } 
        });
      }
    } else {
      question.status = 'mentor_assigned';
      await User.findByIdAndUpdate(mentorId, { 
        $inc: { activeQuestions: 1 } 
      });
    }
    
    await question.save();
    
    // Deduct credit
    user.credits -= 1;
    await user.save();

    // Notify assigned mentor (if any)
    if (question.selectedMentorId) {
      try {
        const mentor = await User.findById(question.selectedMentorId).select('email username name');
        if (mentor && mentor.email) {
          await sendMentorNewQuestionNotification(
            mentor.email,
            mentor.username || mentor.name || 'Mentor',
            question.questionText,
            question.keywords || []
          );
        }
      } catch (notifyErr) {
        console.error('Error sending mentor new-question notification:', notifyErr);
      }
    }
    
    res.json({
      success: true,
      questionId: question._id,
      creditsRemaining: user.credits,
      message: 'Question submitted successfully'
    });
  } catch (error) {
    console.error('❌ Question submission error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit question' 
    });
  }
});

/**
 * Edit Question (within 5 minutes only)
 * PUT /api/questions/:id
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        error: 'Question not found' 
      });
    }
    
    if (!question.checkEditable()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Edit period expired (5 minutes limit)' 
      });
    }
    
    const { title, description, category, reason } = req.body;
    
    if (title) question.title = title;
    if (description) question.questionText = description;
    if (category) question.category = category;
    if (reason !== undefined) question.reason = reason;
    
    question.lastEditedAt = new Date();
    
    // Re-extract keywords if description changed
    if (description) {
      question.keywords = atyantEngine.extractBetterKeywords(description);
    }
    
    await question.save();
    
    res.json({
      success: true,
      question,
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('❌ Question edit error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update question' 
    });
  }
});

/**
 * Get User's Question List
 * GET /api/questions/my-questions
 */
router.get('/my-questions', protect, async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.user.userId })
      .populate('selectedMentorId', 'name username profilePicture expertise')
      .populate('answerCardId')
      .sort({ createdAt: -1 });
    
    const questionsWithEditability = questions.map(q => ({
      ...q.toObject(),
      isEditable: q.checkEditable()
    }));
    
    res.json({
      success: true,
      questions: questionsWithEditability
    });
  } catch (error) {
    console.error('❌ Questions fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch questions' 
    });
  }
});

export default router;
