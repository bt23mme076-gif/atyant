import express from 'express';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import User from '../models/User.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// GET: List all pending questions for admin
router.get('/pending-questions', protect, async (req, res) => {
  // Only allow admin
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
  try {
    const questions = await Question.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .lean();
    // Populate mentor info
    const mentorIds = questions.map(q => q.selectedMentorId).filter(Boolean);
    const mentors = await User.find({ _id: { $in: mentorIds } }).lean();
    const mentorMap = Object.fromEntries(mentors.map(m => [m._id.toString(), m]));
    const result = questions.map(q => ({
      id: q._id,
      text: q.questionText,
      userGoal: q.userGoal || '',
      matchedMentorId: q.selectedMentorId,
      matchedMentorName: mentorMap[q.selectedMentorId?.toString()]?.username || '',
      matchConfidence: q.matchConfidence || 90,
      createdAt: q.createdAt,
    }));
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
