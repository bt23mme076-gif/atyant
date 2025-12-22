// Atyant Engine Routes - New question flow
import express from 'express';
import protect from '../middleware/authMiddleware.js';
import atyantEngine from '../services/AtyantEngine.js';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import MentorExperience from '../models/MentorExperience.js';
import User from '../models/User.js';
import { sendMentorNewQuestionNotification, sendUserAnswerReadyNotification } from '../utils/emailNotifications.js';

const router = express.Router();

/**
 * POST /api/engine/submit-question
 * User submits a question → Atyant Engine processes it
 */
router.post('/submit-question', protect, async (req, res) => {
  try {
    const { questionText } = req.body;
    const userId = req.user.userId;
    
    if (!questionText || questionText.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Question must be at least 10 characters' 
      });
    }
    
    // Process through Atyant Engine
    const result = await atyantEngine.processQuestion(userId, questionText);
    
    res.json(result);
  } catch (error) {
    console.error('Error submitting question:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit question' 
    });
  }
});

/**
 * GET /api/engine/question-status/:questionId
 * Check status of a question
 */
router.get('/question-status/:questionId', protect, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.userId;
    
    const question = await Question.findOne({ 
      _id: questionId,
      userId // Ensure user owns this question
    });
    
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        error: 'Question not found' 
      });
    }
    
    // ⚠️ IMPORTANT: If this is a follow-up question, redirect to parent question
    // This maintains thread continuity - user should always see the original question
    if (question.isFollowUp && question.parentQuestionId) {
      console.log('🔁 Follow-up question accessed directly');
      console.log('📝 Follow-up ID:', questionId);
      console.log('📝 Parent ID:', question.parentQuestionId);
      console.log('🔀 Redirecting to parent question for continuity');
      
      return res.json({
        success: true,
        redirect: true,
        parentQuestionId: question.parentQuestionId,
        message: 'This is a follow-up question. Showing original thread.'
      });
    }
    
    // Get answer card if available, with mentor data populated
    let answerCard = null;
    let mentorData = null;
    
    if (question.answerCardId) {
      answerCard = await AnswerCard.findById(question.answerCardId).populate('mentorId', 'name username bio expertise location ratings profileImage');
      
      // Extract mentor data for easier access
      if (answerCard && answerCard.mentorId) {
        mentorData = {
          id: answerCard.mentorId._id.toString(),
          name: answerCard.mentorId.name,
          username: answerCard.mentorId.username,
          bio: answerCard.mentorId.bio,
          expertise: answerCard.mentorId.expertise,
          location: answerCard.mentorId.location,
          ratings: answerCard.mentorId.ratings,
          profileImage: answerCard.mentorId.profileImage
        };
      }
    }
    
    res.json({
      success: true,
      question: {
        id: question._id,
        text: question.questionText,
        status: question.status,
        createdAt: question.createdAt
      },
      answerCard: answerCard ? {
        id: answerCard._id,
        _id: answerCard._id,
        questionId: answerCard.questionId,
        mentorId: answerCard.mentorId ? answerCard.mentorId._id.toString() : null, // ✅ Convert ObjectId to string
        selectedMentorId: answerCard.mentorId ? answerCard.mentorId._id.toString() : null, // ✅ Fallback field
        answerContent: answerCard.answerContent, // ✅ Correct field name
        content: answerCard.answerContent, // ✅ Backward compatibility
        trustMessage: answerCard.trustMessage,
        signature: answerCard.signature,
        followUpCount: answerCard.followUpCount,
        followUpAnswers: answerCard.followUpAnswers || [],
        createdAt: answerCard.createdAt, // ✅ For prep time calculation
        updatedAt: answerCard.updatedAt, // ✅ For prep time calculation
        deliveredAt: answerCard.deliveredAt,
        mentor: mentorData // ✅ Include mentor data directly
      } : null
    });
  } catch (error) {
    console.error('Error fetching question status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch status' 
    });
  }
});

/**
 * GET /api/engine/my-questions
 * Get all questions asked by the user
 */
router.get('/my-questions', protect, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // ⚠️ IMPORTANT: Only return PARENT questions, not follow-ups
    // Follow-ups are shown inside their parent answer card
    const questions = await Question.find({ 
      userId,
      isFollowUp: { $ne: true } // Exclude follow-up questions
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('answerCardId');
    
    res.json({
      success: true,
      questions: questions.map(q => ({
        id: q._id,
        text: q.questionText,
        status: q.status,
        createdAt: q.createdAt,
        hasAnswer: !!q.answerCardId,
        followUpCount: q.followUpQuestions ? q.followUpQuestions.length : 0
      }))
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch questions' 
    });
  }
});

/**
 * POST /api/engine/submit-follow-up
 * Submit a follow-up question (max 2 per answer card)
 */
router.post('/submit-follow-up', protect, async (req, res) => {
  try {
    const { answerCardId, followUpText } = req.body;
    const userId = req.user.userId;
    
    console.log('\n========== FOLLOW-UP QUESTION SUBMISSION ==========');
    console.log('👤 User ID:', userId);
    console.log('🎴 Answer Card ID:', answerCardId);
    console.log('📝 Follow-up text:', followUpText);
    
    if (!followUpText || followUpText.trim().length < 5) {
      console.log('❌ Follow-up text too short');
      return res.status(400).json({ 
        success: false, 
        error: 'Follow-up question too short' 
      });
    }
    
    // Get answer card
    const answerCard = await AnswerCard.findById(answerCardId);
    if (!answerCard) {
      console.log('❌ Answer card not found:', answerCardId);
      return res.status(404).json({ 
        success: false, 
        error: 'Answer card not found' 
      });
    }
    
    console.log('✅ Answer card found');
    console.log('📝 Question ID from answer card:', answerCard.questionId);
    console.log('📊 Current follow-up count:', answerCard.followUpCount);
    
    // Check if follow-up limit reached
    if (answerCard.followUpCount >= 2) {
      console.log('❌ Follow-up limit reached');
      return res.status(400).json({ 
        success: false, 
        error: 'Maximum 2 follow-up questions allowed per answer' 
      });
    }
    
    // Get original question to retrieve mentor ID
    const originalQuestion = await Question.findOne({ 
      _id: answerCard.questionId,
      userId // Verify ownership
    });
    
    if (!originalQuestion) {
      console.log('❌ Original question not found or unauthorized');
      console.log('🔍 Looking for question:', answerCard.questionId);
      console.log('🔍 With user:', userId);
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized or question not found' 
      });
    }
    
    console.log('✅ Original question found:', originalQuestion._id);
    console.log('📝 Original question text:', originalQuestion.questionText);
    console.log('👨‍🏫 Selected Mentor ID:', originalQuestion.selectedMentorId);
    console.log('📅 Question created at:', originalQuestion.createdAt);
    
    // Get the original mentor ID
    const originalMentorId = originalQuestion.selectedMentorId;
    
    if (!originalMentorId) {
      console.log('❌ No mentor assigned to original question!');
      return res.status(400).json({
        success: false,
        error: 'Original question has no mentor assigned'
      });
    }
    
    console.log('\n🔁 FOLLOW-UP PROCESSING:');
    console.log('📝 Parent Question ID:', originalQuestion._id);
    console.log('👨‍🏫 Original Mentor ID:', originalMentorId);
    console.log('📋 Original Answer Card ID:', answerCardId);
    console.log('✅ Will bypass mentor selection and use original mentor');
    console.log('✅ Will append answer to SAME answer card (no new card)');
    console.log('==================================================\n');
    
    // Process follow-up with original mentor (bypass mentor selection)
    const result = await atyantEngine.processQuestion(userId, followUpText, {
      isFollowUp: true,
      originalMentorId: originalMentorId,
      parentQuestionId: originalQuestion._id,
      parentAnswerCardId: answerCardId // Pass answer card to append to
    });
    
    // Add follow-up entry to answer card (same card, not new)
    answerCard.followUpAnswers.push({
      questionText: followUpText,
      questionId: result.questionId,
      askedAt: new Date(),
      answeredAt: null, // Will be set when mentor answers
      answerContent: null // Will be filled when mentor submits experience
    });
    
    // Add to original question's follow-up list with new question ID
    originalQuestion.followUpQuestions.push({
      questionText: followUpText,
      questionId: result.questionId,
      askedAt: new Date(),
      answerCardId: null // Will be filled when answer is generated
    });
    await originalQuestion.save();
    
    // Increment follow-up count
    answerCard.followUpCount += 1;
    await answerCard.save();
    
    console.log('✅ Follow-up submitted successfully');
    console.log('📝 New follow-up question ID:', result.questionId);
    console.log('📝 Returning ORIGINAL question ID for continuity:', originalQuestion._id);
    
    // Send notification to mentor about follow-up question
    try {
      const mentor = await User.findById(originalMentorId);
      if (mentor) {
        const followUpQuestion = await Question.findById(result.questionId);
        await sendMentorNewQuestionNotification(
          mentor.email,
          mentor.name || mentor.username,
          followUpText,
          followUpQuestion.keywords
        );
        console.log('📧 Follow-up notification sent to mentor');
      }
    } catch (emailError) {
      console.error('❌ Failed to send mentor follow-up notification:', emailError);
    }
    
    console.log('==================================================\n');
    
    // ⚠️ IMPORTANT: Return ORIGINAL question ID, not the new follow-up ID
    // This keeps the user on the same thread/page
    res.json({
      success: true,
      message: 'Follow-up question submitted',
      originalQuestionId: originalQuestion._id, // Original question ID for navigation
      followUpQuestionId: result.questionId,     // New follow-up question ID for tracking
      answerCardId: answerCardId                 // Same answer card ID
    });
  } catch (error) {
    console.error('Error submitting follow-up:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit follow-up' 
    });
  }
});

/**
 * POST /api/engine/answer-feedback
 * Submit feedback for an answer card
 */
router.post('/answer-feedback', protect, async (req, res) => {
  try {
    const { answerCardId, helpful, rating, comment } = req.body;
    const userId = req.user.userId;
    
    const answerCard = await AnswerCard.findById(answerCardId);
    if (!answerCard) {
      return res.status(404).json({ 
        success: false, 
        error: 'Answer card not found' 
      });
    }
    
    // Verify ownership
    const question = await Question.findOne({ 
      _id: answerCard.questionId,
      userId
    });
    
    if (!question) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }
    
    // Update feedback
    answerCard.userFeedback.helpful = helpful;
    if (rating) answerCard.userFeedback.rating = rating;
    if (comment) answerCard.userFeedback.comment = comment;
    
    await answerCard.save();
    
    res.json({
      success: true,
      message: 'Feedback submitted'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit feedback' 
    });
  }
});

// ========== MENTOR ROUTES (Internal - not visible to users) ==========

/**
 * GET /api/engine/mentor/pending-questions
 * Get questions assigned to this mentor
 */
router.get('/mentor/pending-questions', protect, async (req, res) => {
  try {
    const mentorId = req.user.userId;
    
    console.log('🔍 API Call: /mentor/pending-questions from user:', mentorId);
    
    // Verify user is a mentor - fetch from DB
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      console.log('❌ Access denied - not a mentor. Role:', mentor?.role);
      return res.status(403).json({ 
        success: false, 
        error: 'Only mentors can access this' 
      });
    }
    
    console.log('✅ Verified mentor:', mentor.username);
    console.log('🔍 Mentor ObjectId:', mentor._id);
    
    // 🔥 FIX: Convert string to ObjectId for proper MongoDB comparison
    const mentorObjectId = mentor._id; // This is already an ObjectId from User.findById
    
    const questions = await Question.find({
      selectedMentorId: mentorObjectId,
      status: { $in: ['mentor_assigned', 'awaiting_experience'] }
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    console.log('✅ Found', questions.length, 'pending questions for', mentor.username);
    
    res.json({
      success: true,
      questions: questions.map(q => ({
        id: q._id,
        text: q.questionText,
        keywords: q.keywords,
        status: q.status,
        createdAt: q.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching pending questions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch questions' 
    });
  }
});

/**
 * GET /api/engine/mentor/answered-questions
 * Get questions this mentor has already answered
 */
router.get('/mentor/answered-questions', protect, async (req, res) => {
  try {
    const mentorId = req.user.userId;
    
    // Verify user is a mentor
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only mentors can access this' 
      });
    }
    
    const mentorObjectId = mentor._id;
    
    console.log('\n🔍 FETCHING ANSWERED QUESTIONS');
    console.log('Mentor ID:', mentorObjectId);
    console.log('Mentor username:', mentor.username);
    console.log('Searching for statuses:', ['experience_submitted', 'answer_generated', 'delivered']);
    
    // First, let's see ALL questions assigned to this mentor
    const allQuestions = await Question.find({
      selectedMentorId: mentorObjectId
    });
    
    console.log('📊 All questions assigned to mentor:', allQuestions.length);
    allQuestions.forEach(q => {
      console.log(`  - Question: "${q.questionText.substring(0, 50)}..." | Status: ${q.status} | ID: ${q._id}`);
    });
    
    // Get questions that have been answered (experience submitted or delivered)
    const questions = await Question.find({
      selectedMentorId: mentorObjectId,
      status: { $in: ['experience_submitted', 'answer_generated', 'delivered'] }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('answerCardId');
    
    console.log('✅ Found', questions.length, 'answered questions matching filter');
    if (questions.length > 0) {
      console.log('📝 Answered questions:');
      questions.forEach(q => {
        console.log(`  - "${q.questionText.substring(0, 50)}..." | Status: ${q.status}`);
      });
    }
    console.log('==================================================\n');
    
    res.json({
      success: true,
      questions: questions.map(q => ({
        id: q._id,
        text: q.questionText,
        keywords: q.keywords,
        status: q.status,
        createdAt: q.createdAt,
        hasAnswerCard: !!q.answerCardId,
        isFollowUp: q.isFollowUp || false
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching answered questions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch answered questions' 
    });
  }
});

/**
 * POST /api/engine/mentor/submit-experience
 * Mentor submits raw experience for a question
 */
router.post('/mentor/submit-experience', protect, async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { questionId, rawExperience } = req.body;
    
    // Verify user is a mentor - fetch from DB
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only mentors can submit experience' 
      });
    }
    
    // Validate raw experience structure
    const required = ['situation', 'firstAttempt', 'failures', 'whatWorked', 'stepByStep', 'timeline', 'wouldDoDifferently'];
    for (const field of required) {
      if (!rawExperience[field]) {
        return res.status(400).json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        });
      }
    }
    
    // 🔥 FIX: Use mentor._id ObjectId for proper MongoDB comparison
    const mentorObjectId = mentor._id;
    
    // Get question and verify assignment
    const question = await Question.findOne({
      _id: questionId,
      selectedMentorId: mentorObjectId
    });
    
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        error: 'Question not found or not assigned to you' 
      });
    }
    
    console.log('\n📝 MENTOR EXPERIENCE SUBMISSION');
    console.log('Question ID:', questionId);
    console.log('Is Follow-up:', question.isFollowUp);
    console.log('Parent Question:', question.parentQuestionId);
    
    // Create mentor experience record
    const mentorExperience = new MentorExperience({
      questionId,
      mentorId,
      rawExperience,
      status: 'submitted'
    });
    
    await mentorExperience.save();
    
    // Update question status
    question.status = 'experience_submitted';
    await question.save();
    
    // Check if this is a follow-up question
    if (question.isFollowUp && question.parentQuestionId) {
      console.log('🔁 FOLLOW-UP ANSWER - Appending to existing answer card');
      
      // Find the parent question's answer card
      const parentQuestion = await Question.findById(question.parentQuestionId);
      if (!parentQuestion || !parentQuestion.answerCardId) {
        return res.status(404).json({
          success: false,
          error: 'Parent question or answer card not found'
        });
      }
      
      const parentAnswerCard = await AnswerCard.findById(parentQuestion.answerCardId);
      if (!parentAnswerCard) {
        return res.status(404).json({
          success: false,
          error: 'Parent answer card not found'
        });
      }
      
      // Transform experience to answer content
      const transformedAnswer = await atyantEngine.aiTransformExperience(rawExperience, question.questionText);
      
      // Find the follow-up entry in parent answer card and update it
      const followUpIndex = parentAnswerCard.followUpAnswers.findIndex(
        fu => fu.questionId && fu.questionId.toString() === questionId.toString()
      );
      
      if (followUpIndex !== -1) {
        parentAnswerCard.followUpAnswers[followUpIndex].answerContent = transformedAnswer;
        parentAnswerCard.followUpAnswers[followUpIndex].answeredAt = new Date();
        parentAnswerCard.followUpAnswers[followUpIndex].mentorExperienceId = mentorExperience._id;
      } else {
        // Add if not found (backup)
        parentAnswerCard.followUpAnswers.push({
          questionText: question.questionText,
          questionId: question._id,
          answerContent: transformedAnswer,
          mentorExperienceId: mentorExperience._id,
          askedAt: question.createdAt,
          answeredAt: new Date()
        });
      }
      
      await parentAnswerCard.save();
      
      // Update question to reference the parent answer card
      question.answerCardId = parentAnswerCard._id;
      question.status = 'delivered';
      await question.save();
      
      console.log('✅ Follow-up answer appended to parent answer card:', parentAnswerCard._id);
      
      // Send notification to user
      try {
        const user = await User.findById(question.userId);
        if (user) {
          await sendUserAnswerReadyNotification(
            user.email,
            user.name || user.username,
            question.questionText,
            true // isFollowUp
          );
          console.log('📧 Follow-up answer notification sent to user');
        }
      } catch (emailError) {
        console.error('❌ Failed to send user notification:', emailError);
      }
      
      res.json({
        success: true,
        message: 'Follow-up answer submitted successfully',
        answerCardId: parentAnswerCard._id
      });
      
    } else {
      // Original question - create new answer card
      console.log('🆕 NEW ANSWER - Creating new answer card');
      
      // Transform to Answer Card
      const answerCard = await atyantEngine.transformToAnswerCard(mentorExperience, question);
      
      // Mark as delivered
      answerCard.deliveredAt = new Date();
      question.status = 'delivered';
      await answerCard.save();
      await question.save();
      
      // Send notification to user
      try {
        const user = await User.findById(question.userId);
        if (user) {
          await sendUserAnswerReadyNotification(
            user.email,
            user.name || user.username,
            question.questionText,
            false // not a follow-up
          );
          console.log('📧 Answer notification sent to user');
        }
      } catch (emailError) {
        console.error('❌ Failed to send user notification:', emailError);
      }
      
      res.json({
        success: true,
        message: 'Experience submitted and answer card generated',
        answerCardId: answerCard._id
      });
    }
  } catch (error) {
    console.error('Error submitting experience:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit experience' 
    });
  }
});

export default router;
