import User from '../models/User.js';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import { sendMentorNewQuestionNotification } from '../utils/emailNotifications.js';
import { getQuestionEmbedding } from './AIService.js';

class AtyantEngine {

  /**
   * 🎯 Helper: Intent Detection
   * Centralized logic to classify placement vs internship.
   */
  detectIntent(text) {
    const t = text.toLowerCase();
    if (t.includes('internship') || t.includes('intern')) return 'internship';
    if (t.includes('placement') || t.includes('job') || t.includes('role')) return 'placement';
    return null;
  }

  /**
   * 🏆 Semantic Match with Authority Gate
   * Best-of-K selection ensures highest quality recall.
   */
  async findBestSemanticMatch(studentId, vector, questionText) {
    try {
      const student = await User.findById(studentId).select('education');
      const sEdu = student?.education?.[0] || {};
      const intent = this.detectIntent(questionText);
      
      const candidates = await AnswerCard.aggregate([
        {
          "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": vector,
            "numCandidates": 20,
            "limit": 10
          }
        },
        { "$project": { "answerContent": 1, "mentorId": 1, "score": { "$meta": "vectorSearchScore" } } }
      ]);

      let bestMatch = null;

      for (let match of candidates) {
        // 🚀 1. STRICT AI FLOOR (Min 85%)
        if (match.score < 0.85) continue;

        const mentor = await User.findById(match.mentorId).select('education expertise bio');
        const mExpertise = ((mentor?.expertise || []).join(' ') + ' ' + (mentor?.bio || '')).toLowerCase();
        
        // 🚀 2. AUTHORITY GATE: Good writing ≠ Authority. 
        // Experience must be battle-tested for instant delivery.
        let authority = 0;
        if (mExpertise.includes('internship')) authority += 120;
        if (mExpertise.includes('placement')) authority += 120;
        if (mExpertise.includes('ppo')) authority += 50;
        if (mExpertise.includes('job')) authority += 40;

        if (authority < 120) continue; // Hard Gate

        // 🚀 3. INTENT ALIGNMENT
        if (intent === 'internship' && !mExpertise.includes('intern')) continue;
        if (intent === 'placement' && !(mExpertise.includes('placement') || mExpertise.includes('job'))) continue;

        const mEdu = mentor?.education?.[0] || {};
        const isSameCollege = sEdu.institution?.toLowerCase() === mEdu.institution?.toLowerCase();
        const isSameBranch = sEdu.field?.toLowerCase() === mEdu.field?.toLowerCase();

        // Background = Tie-breaker Only
        const hybridScore = match.score + (isSameBranch ? 0.05 : 0) + (isSameCollege ? 0.03 : 0);

        // Best-of-K Selection logic
        if (!bestMatch || hybridScore > bestMatch.finalScore) {
          bestMatch = { ...match, finalScore: hybridScore };
        }
      }
      
      return bestMatch && bestMatch.finalScore > 0.88 ? bestMatch : null; 
    } catch (e) { return null; }
  }

  /**
   * 🤝 Live Mentor Allotment: Experience-First Scoring
   * Experience is the entry ticket. College is secondary context.
   */
  async findBestMentor(studentId, keywords) {
    try {
      const student = await User.findById(studentId).select('education');
      const sEdu = student?.education?.[0] || {};
      const intent = this.detectIntent(keywords.join(' '));

      console.log(`🤝 Intent Detected: ${intent || 'General'}. Searching eligible mentors...`);

      const mentors = await User.find({ role: 'mentor' }).select('username email education expertise bio');

      // 🚀 HARD ELIGIBILITY: No domain experience = Mentor doesn't exist for this query.
      const eligibleMentors = mentors.filter(mentor => {
        const text = ((mentor.expertise || []).join(' ') + ' ' + (mentor.bio || '')).toLowerCase();
        if (intent === 'internship') return text.includes('intern');
        if (intent === 'placement') return text.includes('placement') || text.includes('job');
        return true; 
      });

      if (eligibleMentors.length === 0) return null;

      const scored = eligibleMentors.map(mentor => {
        let points = 0;
        const lowerBio = ((mentor.expertise || []).join(' ') + ' ' + (mentor.bio || '')).toLowerCase();
        const mEdu = mentor.education?.[0] || {};
        const collegeMatch = sEdu.institution?.toLowerCase() === mEdu.institution?.toLowerCase();
        const branchMatch = sEdu.field?.toLowerCase() === mEdu.field?.toLowerCase();
        
        // 🔥 CORE AUTHORITY (Experience Points)
        if (lowerBio.includes('internship') || lowerBio.includes('placement')) points += 200;
        if (lowerBio.includes('ppo')) points += 60;
        
        // 🎓 CONTEXT (Secondary Points)
        if (branchMatch) points += 40;
        if (collegeMatch) points += 20;
        
        return { mentor, points };
      });

      scored.sort((a, b) => b.points - a.points);
      return scored[0]?.mentor || null;
    } catch (e) { return null; }
  }

  /**
   * ✨ Brand Transformation: AI Structured Format
   */
  async aiTransformExperience(raw, questionText) {
    const fallbackText = typeof raw === 'string' ? raw : (raw.situation || raw.mainAnswer || questionText || "Guidance shared.");
    return {
      mainAnswer: fallbackText,
      situation: raw.situation || fallbackText,
      firstAttempt: raw.firstAttempt || "Started with basics.",
      keyMistakes: raw.failures ? [{ description: raw.failures }] : [],
      whatWorked: raw.whatWorked || "Persistence.",
      actionableSteps: (raw.stepByStep || "").split('\n').filter(l => l.trim()).map((l, i) => ({
        step: `Step ${i+1}`,
        description: l.trim()
      })),
      timeline: raw.timeline || "A few months.",
      differentApproach: raw.wouldDoDifferently || "If I were doing this today, I would focus more on learning from mistakes and adapting quickly.",
      additionalNotes: raw.additionalNotes || "No extra notes provided.",
      mentorVoice: raw.situation || fallbackText
    };
  }

  /**
   * 🚀 New Answer Submission Logic
   */
  async transformToAnswerCard(mentorExperience, question) {
    try {
      const transformed = await this.aiTransformExperience(mentorExperience.rawExperience, question.questionText);
      const embedding = await getQuestionEmbedding(question.questionText);
      const answerCard = new AnswerCard({
        questionId: question._id,
        mentorExperienceId: mentorExperience._id,
        mentorId: mentorExperience.mentorId,
        answerContent: transformed,
        embedding: embedding 
      });
      return await answerCard.save();
    } catch (error) { throw error; }
  }

  /**
   * 🛠️ Main Process Orchestrator
   */
  async processQuestion(userId, questionText, options = {}) {
    try {
      console.log('\n🚀 ========== ATYANT ENGINE START ==========');
      const vector = await getQuestionEmbedding(questionText);
      const keywords = this.extractBetterKeywords(questionText);

      // 1. Instant Connection Gate
      if (vector && !options.isFollowUp) {
        // Updated Signature: passing questionText for intent check
        const match = await this.findBestSemanticMatch(userId, vector, questionText);
          if (match) {
            const q = new Question({
              userId, 
              questionText, 
              status: 'answered_instantly',
              answerCardId: match._id, 
              isInstant: true,
              // 🚀 THE FIX: Hybrid score ko percentage mein badal kar save karein
              matchScore: Math.round((match.finalScore || match.score || 0.94) * 100) // fallback to 94 if missing
            });
            await q.save();
  
            return { 
              success: true, 
              instantAnswer: true, 
              questionId: q._id, 
              // 🔥 Pura object bhej rahe hain taaki student ko roadmap/mistakes sab dikhe
              answer: match.answerContent 
            };
          }
      }

      // 2. Forced Live Mentor Search
      const bestMentor = await this.findBestMentor(userId, keywords);
      const question = new Question({ userId, questionText, keywords, status: 'pending' });
      
      if (bestMentor) {
        question.selectedMentorId = bestMentor._id;
        question.status = 'mentor_assigned';
        await question.save();
        return { success: true, questionId: question._id, message: `Matching with ${bestMentor.username}...` };
      }
      await question.save();
      return { success: false, message: 'Looking for a senior...' };
    } catch (error) { throw error; }
  }

  extractBetterKeywords(text) {
    const intentWords = ['internship','intern','placement','job','offcampus','oncampus','referral','resume'];
    const base = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    return [...new Set([...intentWords.filter(w => base.includes(w)), ...base])].slice(0, 15);
  }
}

const atyantEngine = new AtyantEngine();
export default atyantEngine;