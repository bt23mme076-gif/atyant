import express from 'express';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import User from '../models/User.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// GET: List all published AnswerCards for admin selection
router.get('/answercards', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
  try {
    const answerCards = await AnswerCard.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .populate('mentorId', 'username')
      .lean();
    const result = answerCards.map(card => ({
      id: card._id,
      mainAnswer: card.answerContent?.mainAnswer || '',
      mentorName: card.mentorId?.username || '',
      createdAt: card.createdAt,
    }));
    res.json({ success: true, answerCards: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET: List all pending questions for admin
router.get('/pending-questions', protect, async (req, res) => {
  // Only allow admin
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
  try {
    // Include all relevant statuses
    const questions = await Question.find({ status: { $in: ['pending', 'mentor_assigned', 'answered_instantly'] } })
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    // Collect mentorIds from selectedMentorId and from answerCard.mentorId for instant answers
    const answerCardIds = questions.filter(q => !q.selectedMentorId && q.answerCardId).map(q => q.answerCardId);
    let answerCardMentorMap = {};
    if (answerCardIds.length > 0) {
      const answerCards = await AnswerCard.find({ _id: { $in: answerCardIds } }).lean();
      answerCardMentorMap = Object.fromEntries(answerCards.map(card => [card._id.toString(), card.mentorId?.toString()]));
    }

    const mentorIds = [
      ...questions.map(q => q.selectedMentorId).filter(Boolean).map(id => id.toString()),
      ...Object.values(answerCardMentorMap).filter(Boolean)
    ];
    const mentors = await User.find({ _id: { $in: mentorIds } }).lean();
    const mentorMap = Object.fromEntries(mentors.map(m => [m._id.toString(), m]));

    const result = questions.map(q => {
      let mentorId = q.selectedMentorId?.toString();
      if (!mentorId && q.answerCardId && answerCardMentorMap[q.answerCardId.toString()]) {
        mentorId = answerCardMentorMap[q.answerCardId.toString()];
      }
      return {
        id: q._id,
        text: q.questionText,
        userGoal: q.userGoal || '',
        matchedMentorId: mentorId,
        matchedMentorName: mentorId ? (mentorMap[mentorId]?.name || mentorMap[mentorId]?.username || '') : '',
        matchConfidence: q.matchConfidence || 90,
        createdAt: q.createdAt,
        isFollowUp: q.isFollowUp || false,
        parentQuestionId: q.parentQuestionId || null
      };
    });
    res.json({ success: true, questions: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST: Publish answer as AnswerCard (admin only)
router.post('/answer', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
  const { questionId, mentorId, answerContent } = req.body;
  if (!questionId || !mentorId || !answerContent) return res.status(400).json({ success: false, error: 'Missing fields' });
  try {
    // Create AnswerCard
    const answerCard = await AnswerCard.create({
      questionId,
      mentorId,
      answerContent,
      publishedBy: req.user._id,
      publishedAt: new Date(),
      status: 'published',
    });
    // Update question status
    await Question.findByIdAndUpdate(questionId, { status: 'answered', answerCardId: answerCard._id });
    res.json({ success: true, answerCard });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
