// backend/routes/askRoutes.js
import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import { extractKeywords } from '../utils/keywordExtractor.js';
import protect from '../middleware/authMiddleware.js';
import AnswerCard from '../models/AnswerCard.js';
import { sendUserAnswerReadyNotification } from '../utils/emailNotifications.js';

import path from 'path';
import fs from 'fs';
import { uploadAudioToCloudinary } from '../utils/cloudinaryUpload.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Dummy speech-to-text (replace with real service if needed)
async function dummySpeechToText(audioPath) {
  // In production, integrate Google Speech-to-Text or similar
  return 'Transcript not implemented (add real speech-to-text integration)';
}

// Mentor submits answer with optional audio
// PATCH: Allow admin to submit answers as any mentor (admin-injected mentorId)
// If user is admin, allow any mentorId. If mentor, enforce mentorId === logged-in user.
router.post('/mentor/submit-audio-answer', protect, upload.single('audio'), async (req, res) => {
  try {
    const { questionId, mentorExperienceId, mentorId, answerContent } = req.body;
    // --- CRITICAL OVERRIDE FOR ADMIN ---
    // If not admin, enforce mentorId === logged-in user
    if (req.user.role !== 'admin') {
      if (!mentorId || mentorId !== String(req.user._id)) {
        return res.status(403).json({ success: false, error: 'Mentors can only submit as themselves.' });
      }
    }
    // Load Question to check if follow-up
    const Question = (await import('../models/Question.js')).default;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    if (question.isFollowUp && question.parentQuestionId) {
      // For both admin and mentor: always update the existing follow-up entry as a single text reply
      const parentQuestion = await Question.findById(question.parentQuestionId);
      if (!parentQuestion || !parentQuestion.answerCardId) {
        return res.status(404).json({ success: false, error: 'Parent AnswerCard not found' });
      }
      const AnswerCard = (await import('../models/AnswerCard.js')).default;
      const answerCard = await AnswerCard.findById(parentQuestion.answerCardId);
      if (!answerCard) return res.status(404).json({ success: false, error: 'Parent AnswerCard not found' });
      // Parse answerContent if sent as JSON string
      let parsedContent = answerContent;
      if (typeof answerContent === 'string') {
        try { parsedContent = JSON.parse(answerContent); } catch {}
      }
      // Always extract main text reply for follow-up
      let mainAnswer = '';
      if (parsedContent) {
        if (typeof parsedContent === 'object') {
          mainAnswer = parsedContent.situation || parsedContent.mainAnswer || '';
        } else if (typeof parsedContent === 'string') {
          mainAnswer = parsedContent;
        }
      }
      // Find and update the existing follow-up entry (robust string comparison, debug log)
      const incomingQid = question._id.toString();
      const allFollowupQids = answerCard.followUpAnswers.map(fu => fu.questionId?.toString());
      console.log('[FollowUp Debug] Incoming QID:', incomingQid, 'All followUpAnswers QIDs:', allFollowupQids);
      const followUpIndex = answerCard.followUpAnswers.findIndex(
        fu => fu.questionId && fu.questionId.toString() === incomingQid
      );
      if (followUpIndex !== -1) {
        answerCard.followUpAnswers[followUpIndex].answerContent = { mainAnswer };
        answerCard.followUpAnswers[followUpIndex].answeredAt = new Date();
      } else {
        // Do NOT push a new entry, return error for debugging
        console.error('[FollowUp Debug] No matching follow-up entry found for questionId:', incomingQid);
        return res.status(404).json({ success: false, error: 'Follow-up entry not found in parent card', debug: { incomingQid, allFollowupQids } });
      }
      // Optionally update followUpCount
      answerCard.followUpCount = answerCard.followUpAnswers.length;
      await answerCard.save();
      // Mark question as delivered
      question.status = 'delivered';
      await question.save();

      // Notify the original asker that their follow-up answer is ready
      try {
        const asker = await User.findById(question.userId).select('email username name');
        if (asker && asker.email) {
          await sendUserAnswerReadyNotification(asker.email, asker.username || asker.name || 'Student', question.questionText, true);
        }
      } catch (notifyErr) {
        console.error('Error sending follow-up answer notification:', notifyErr);
      }
      return res.json({ success: true, followUp: true, answerCard });
    }
    // Normal (not follow-up): create AnswerCard as before
    let audioUrl = null;
    let transcript = null;
    if (req.file) {
      audioUrl = await uploadAudioToCloudinary(req.file.path, 'mentor-voice-answers');
      transcript = await dummySpeechToText(req.file.path);
    }
    let parsedContent = answerContent;
    if (typeof answerContent === 'string') {
      try { parsedContent = JSON.parse(answerContent); } catch {}
    }
    if (parsedContent && typeof parsedContent === 'object' && parsedContent.actionableSteps) {
      if (Array.isArray(parsedContent.actionableSteps) && parsedContent.actionableSteps.length === 1 && typeof parsedContent.actionableSteps[0] === 'string') {
        parsedContent.actionableSteps = parsedContent.actionableSteps[0];
      }
    }
    const answerCardData = {
      questionId,
      mentorId,
      answerContent: parsedContent,
      audioUrl,
      transcript
    };
    if (mentorExperienceId && mentorExperienceId !== '') {
      answerCardData.mentorExperienceId = mentorExperienceId;
    }
    const answerCard = await AnswerCard.create(answerCardData);
    await Question.findByIdAndUpdate(questionId, {
      answerCardId: answerCard._id,
      status: 'delivered'
    });

    // Send notification to the student that their answer is ready
    try {
      const asker = await User.findById(question.userId).select('email username name');
      if (asker && asker.email) {
        // Non-follow-up answer
        await sendUserAnswerReadyNotification(asker.email, asker.username || asker.name || 'Student', question.questionText, false);
      }
    } catch (notifyErr) {
      console.error('Error sending user answer notification:', notifyErr);
    }
    res.json({ success: true, answerCard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ IMPROVED: Better keyword extraction for search
function extractBetterKeywords(text) {
  if (!text) return [];
  
  // Remove common words, clean text
  const stopWords = ['how', 'what', 'when', 'where', 'why', 'who', 'which', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'on', 'at', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'will', 'can', 'should'];
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special chars
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w));
  
  // Also try original extractKeywords if it exists
  const extracted = extractKeywords ? extractKeywords(text) : [];
  
  // Combine and deduplicate
  const combined = [...new Set([...words, ...extracted])];
  
  return combined.slice(0, 15); // Limit to top 15 keywords
}

// ✅ Generate AI-powered question suggestions
router.post('/generate-suggestions', protect, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('name bio preferences interests');
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const userInterests = user.interests || [];
    
    let matchedExpertise = [];
    
    if (userInterests.length > 0) {
      // ✅ FIX: Use User model instead of Mentor
      const matchingMentors = await User.aggregate([
        {
          $match: {
            role: 'mentor',
            expertise: { $in: userInterests }
          }
        },
        { $unwind: '$expertise' },
        {
          $match: {
            expertise: { $in: userInterests }
          }
        },
        {
          $group: {
            _id: '$expertise',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]);
      
      matchedExpertise = matchingMentors.map(m => m._id);
    }
    
    if (matchedExpertise.length === 0) {
      // ✅ FIX: Use User model instead of Mentor
      const topExpertise = await User.aggregate([
        { $match: { role: 'mentor' } },
        { $unwind: '$expertise' },
        { $group: { _id: '$expertise', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      matchedExpertise = topExpertise.map(e => e._id);
    }
    
    const suggestions = await generatePersonalizedQuestions(user, userInterests, matchedExpertise);
    
    res.json({ ok: true, suggestions, matchedExpertise });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ✅ AI Function - ENGLISH ONLY
async function generatePersonalizedQuestions(user, userInterests, matchedExpertise) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    const userContext = `
User Profile:
- Name: ${user?.name || 'Student'}
- Bio: ${user?.bio || 'Looking for career guidance'}
- User's Interests: ${userInterests.join(', ') || 'Not specified'}

Mentors Available with Matching Expertise:
${matchedExpertise.join(', ')}
`;

    const prompt = `You are an AI career advisor on Atyant mentorship platform.

${userContext}

Generate 10 HIGHLY PERSONALIZED questions that THIS SPECIFIC USER would ask mentors.

STRICT Requirements:
1. Questions MUST be based on user's interests: ${userInterests.join(', ')}
2. Questions MUST match available mentor expertise: ${matchedExpertise.join(', ')}
3. Use ONLY ENGLISH language - clear, professional, conversational tone
4. Be SPECIFIC to user's profile, not generic
5. Each question: 40-90 characters
6. Cover: Career roadmap, Projects, Skills, Placements, Interview prep, Learning path
7. Return ONLY a clean JSON array of 10 strings

Example (if user interested in "Web Development", "React"):
["How to build production-ready React projects?", "Will MERN stack help me get a job?"]

Generate NOW (JSON array only):`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 1200,
            topP: 0.9
          }
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('AI did not return valid JSON, using smart fallback');
      return getSmartFallback(userInterests, matchedExpertise);
    }
    
    const suggestions = JSON.parse(jsonMatch[0]);
    
    const cleaned = suggestions
      .filter(q => typeof q === 'string' && q.length >= 20 && q.length <= 120)
      .slice(0, 10);
    
    return cleaned.length >= 6 ? cleaned : getSmartFallback(userInterests, matchedExpertise);
    
  } catch (error) {
    console.error('AI generation failed:', error);
    return getSmartFallback(userInterests, matchedExpertise);
  }
}

// ✅ ENGLISH ONLY Fallback
function getSmartFallback(userInterests, matchedExpertise) {
  const questions = [];
  const interests = [...userInterests, ...matchedExpertise].filter(Boolean);
  
  const templates = [
    (topic) => `How to start a career in ${topic} step-by-step?`,
    (topic) => `Best free resources to learn ${topic}?`,
    (topic) => `How long does it take to get a job with ${topic} skills?`,
    (topic) => `${topic} project ideas for my portfolio`,
    (topic) => `${topic} interview preparation roadmap`,
    (topic) => `Daily study plan for learning ${topic}`,
    (topic) => `Practical steps to become an expert in ${topic}`,
    (topic) => `${topic} vs alternatives - what should I learn?`,
    (topic) => `How to earn money with ${topic} side projects?`,
    (topic) => `Common mistakes to avoid in ${topic}`
  ];
  
  interests.forEach((interest, idx) => {
    if (idx < 10 && templates[idx]) {
      questions.push(templates[idx](interest));
    }
  });
  
  const generic = [
    "How to build a perfect resume for placements?",
    "Where can I practice mock interviews?",
    "What skills are needed for my first job?",
    "Startup vs Job - need career guidance",
    "Best practices for building a strong portfolio"
  ];
  
  if (questions.length < 10) {
    questions.push(...generic);
  }
  
  return questions.slice(0, 10);
}

// ✅ FIXED: Better mentor search - Uses User model like original
router.post('/suggest-mentors', protect, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length < 5) {
      return res.status(400).json({ error: 'Question too short' });
    }
    
    // ✅ Extract keywords from question
    const keywords = extractBetterKeywords(question);
    
    console.log('Search keywords:', keywords); // Debug log
    
    if (keywords.length === 0) {
      return res.json([]);
    }
    
    // ✅ IMPROVED SEARCH QUERY - Multiple match strategies
    const searchQueries = [];
    
    // Strategy 1: Exact expertise match
    searchQueries.push({
      role: 'mentor',
      expertise: { 
        $in: keywords.map(k => new RegExp(k, 'i')) // Case-insensitive regex match
      }
    });
    
    // Strategy 2: Bio contains any keyword
    searchQueries.push({
      role: 'mentor',
      bio: { 
        $regex: keywords.join('|'), 
        $options: 'i' 
      }
    });
    
    // Strategy 3: Name contains keyword
    searchQueries.push({
      role: 'mentor',
      name: { 
        $regex: keywords.join('|'), 
        $options: 'i' 
      }
    });
    
    // Strategy 4: Username contains keyword
    searchQueries.push({
      role: 'mentor',
      username: { 
        $regex: keywords.join('|'), 
        $options: 'i' 
      }
    });
    
    // ✅ FIX: Use User model instead of Mentor
    const mentors = await User.find({
      $or: searchQueries
    })
    .select('username name profilePicture bio expertise location ratings')
    .limit(15);
    
    console.log(`Found ${mentors.length} mentors for keywords:`, keywords); // Debug
    
    // ✅ Score mentors by relevance
    const scoredMentors = mentors.map(mentor => {
      let score = 0;
      
      // Higher score if expertise matches
      if (mentor.expertise) {
        mentor.expertise.forEach(exp => {
          keywords.forEach(kw => {
            if (exp.toLowerCase().includes(kw.toLowerCase())) {
              score += 5;
            }
          });
        });
      }
      
      // Medium score for bio match
      if (mentor.bio) {
        keywords.forEach(kw => {
          if (mentor.bio.toLowerCase().includes(kw.toLowerCase())) {
            score += 2;
          }
        });
      }
      
      // Small score for name match
      if (mentor.name || mentor.username) {
        const name = (mentor.name || mentor.username).toLowerCase();
        keywords.forEach(kw => {
          if (name.includes(kw.toLowerCase())) {
            score += 1;
          }
        });
      }
      
      return { ...mentor.toObject(), relevanceScore: score };
    });
    
    // Sort by relevance score
    scoredMentors.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    res.json(scoredMentors.slice(0, 12));
  } catch (error) {
    console.error('Error finding mentors:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;