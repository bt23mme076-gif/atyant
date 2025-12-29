import User from '../models/User.js';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import { sendMentorNewQuestionNotification } from '../utils/emailNotifications.js';
import { getQuestionEmbedding } from './AIService.js';

/* ===============================
   CONFIG — PRECISION WEIGHTS
================================ */
const CONFIG = {
  SEMANTIC_FLOOR: 0.85,
  INSTANT_THRESHOLD: 0.88,
  LOAD_PENALTY: 50,
  MAX_LOAD: 5
};

class AtyantEngine {

  // 1. Student ki query se details nikalna
  detectQueryDetails(text) {
    const t = text.toLowerCase();
    
    // Intent detection
    let intent = null;
    if (t.includes('internship') || t.includes('intern')) intent = 'internship';
    if (t.includes('placement') || t.includes('job') || t.includes('role')) intent = 'placement';

    // Company detection
    const commonCompanies = ['meta', 'google', 'amazon', 'microsoft', 'netflix', 'tcs', 'infosys', 'zomato', 'uber', 'goldman', 'startup'];
    const mentionedCompanies = commonCompanies.filter(comp => t.includes(comp));

    // Tag/Specialty detection
    const specialKeywords = ['foreign', 'iit', 'nit', 'faang', 'masters', 'research', 'iim', 'bits', 'startup', 'ppo'];
    const foundTags = specialKeywords.filter(word => t.includes(word));

    return { intent, mentionedCompanies, foundTags };
  }

  /* ===============================
      PATH A: AI SEMANTIC (Unique Mode)
  =============================== */
  async findBestSemanticMatch(studentId, vector, questionText) {
    try {
      const student = await User.findById(studentId).select('education');
      const sEdu = student?.education?.[0] || {};
      const { intent, mentionedCompanies, foundTags } = this.detectQueryDetails(questionText);
      
      console.log(`\n🔎 --- AI SEMANTIC ANALYSIS (Precision Mode) ---`);

      const candidates = await AnswerCard.aggregate([
        {
          "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": vector,
            "numCandidates": 40,
            "limit": 20
          }
        },
        { "$project": { "answerContent": 1, "mentorId": 1, "score": { "$meta": "vectorSearchScore" } } }
      ]);

      const uniqueMentorsMap = new Map();

      for (let match of candidates) {
        if (match.score < CONFIG.SEMANTIC_FLOOR) continue;

        // Fetch Mentor with all 4 NEW FIELDS 🚀
        const mentor = await User.findById(match.mentorId).select('username education expertise bio primaryDomain topCompanies milestones specialTags activeQuestions');
        if (!mentor) continue;

        let hybridScore = match.score;
        let bonusLogs = [];

        // 🚀 Bonus 1: primaryDomain Match (+0.05)
        if (mentor.primaryDomain === intent || mentor.primaryDomain === 'both') {
            hybridScore += 0.05; bonusLogs.push('Domain Match');
        }

        // 🚀 Bonus 2: topCompanies Match (+0.08)
        const hasCompanyExp = (mentor.topCompanies || []).some(c => 
          mentionedCompanies.some(mc => mc.toLowerCase() === c.toLowerCase())
        );
        if (hasCompanyExp) { hybridScore += 0.08; bonusLogs.push('Target Company'); }

        // 🚀 Bonus 3: Milestones/PPO Match (+0.05)
        const hasMilestone = (mentor.milestones || []).some(m => 
            foundTags.some(ft => m.toLowerCase().includes(ft))
        );
        if (hasMilestone) { hybridScore += 0.05; bonusLogs.push('Milestone Match'); }

        // 🚀 Bonus 4: specialTags (FAANG/IIT) Match (+0.07)
        const hasSpecialTag = (mentor.specialTags || []).some(tag => 
            foundTags.some(ft => tag.toLowerCase().includes(ft))
        );
        if (hasSpecialTag) { hybridScore += 0.07; bonusLogs.push('Special Achievement'); }

        // College/Branch Logic
        const mEdu = mentor?.education?.[0] || {};
        const isSameCollege = sEdu.institution?.toLowerCase() === mEdu.institution?.toLowerCase();
        const isSameBranch = sEdu.field?.toLowerCase() === mEdu.field?.toLowerCase();
        if (isSameBranch) hybridScore += 0.03;
        if (isSameCollege) hybridScore += 0.02;

        if (!uniqueMentorsMap.has(match.mentorId.toString()) || hybridScore > uniqueMentorsMap.get(match.mentorId.toString()).finalScore) {
          uniqueMentorsMap.set(match.mentorId.toString(), {
            ...match,
            finalScore: hybridScore,
            username: mentor.username,
            context: bonusLogs.join(', ') || 'General Match'
          });
        }
      }

      const finalRankings = Array.from(uniqueMentorsMap.values()).sort((a, b) => b.finalScore - a.finalScore);
      
      finalRankings.forEach((m, i) => {
        console.log(`Rank #${i + 1}: ${m.username} | Score: ${(m.finalScore * 100).toFixed(2)}% | Bonus: ${m.context}`);
      });

      const best = finalRankings[0];
      return best && best.finalScore > CONFIG.INSTANT_THRESHOLD ? best : null; 
    } catch (e) { console.error("Engine Error:", e); return null; }
  }

  /* ===============================
      PATH B: LIVE MENTOR ROUTING
  =============================== */
  async findBestMentor(studentId, keywords) {
    try {
      const questionText = keywords.join(' ');
      const student = await User.findById(studentId).select('education');
      const sEdu = student?.education?.[0] || {};
      const { intent, mentionedCompanies, foundTags } = this.detectQueryDetails(questionText);

      console.log(`\n🤝 --- LIVE MENTOR ALLOTMENT ANALYSIS ---`);

      const mentors = await User.find({ role: 'mentor' }).select('username education primaryDomain topCompanies milestones specialTags activeQuestions');

      const scored = mentors.map(mentor => {
        let points = 0;
        let breakdown = [];

        // 🔥 1. Company Match (+500)
        const compMatch = (mentor.topCompanies || []).some(c => mentionedCompanies.includes(c.toLowerCase()));
        if (compMatch) { points += 500; breakdown.push('Target Company'); }

        // 🔥 2. Special Tags Match (+400)
        const tagMatch = (mentor.specialTags || []).some(tag => foundTags.some(ft => tag.toLowerCase().includes(ft)));
        if (tagMatch) { points += 400; breakdown.push('Special Tag'); }

        // 🔥 3. Domain Match (+200)
        if (mentor.primaryDomain === intent || mentor.primaryDomain === 'both') {
            points += 200; breakdown.push('Domain Match');
        }

        // 🔥 4. Milestones Match (+150)
        const mileMatch = (mentor.milestones || []).some(m => foundTags.some(ft => m.toLowerCase().includes(ft)));
        if (mileMatch) { points += 150; breakdown.push('Milestone Match'); }

        // Context Match
        const mEdu = mentor.education?.[0] || {};
        if (sEdu.field?.toLowerCase() === mEdu.field?.toLowerCase()) points += 50;
        
        // Load Penalty
        points -= (mentor.activeQuestions || 0) * CONFIG.LOAD_PENALTY;

        return { mentor, points, breakdown };
      });

      scored.sort((a, b) => b.points - a.points);
      const winner = scored[0] && scored[0].points > 100 ? scored[0].mentor : null;
      
      if (winner) console.log(`🎯 WINNER SELECTED: ${winner.username} (Score: ${scored[0].points})`);
      return winner;
    } catch (e) { return null; }
  }

  /* ===============================
      MAIN ENGINE FLOW
  =============================== */
  async processQuestion(userId, questionText, options = {}) {
    try {
      console.log('\n🚀 ========== ATYANT ENGINE START ==========');
      const vector = await getQuestionEmbedding(questionText);
      const keywords = this.extractBetterKeywords(questionText);

      // Path A: Check for Instant AI Answer
      if (vector && !options.isFollowUp) {
        const match = await this.findBestSemanticMatch(userId, vector, questionText);

        if (match) {
          const q = new Question({
            userId, questionText, status: 'answered_instantly',
            answerCardId: match._id, isInstant: true,
            matchScore: Math.round(match.finalScore * 100)
          });
          await q.save();
          return { success: true, instantAnswer: true, questionId: q._id, answer: match.answerContent };
        }
      }

      // Path B: Route to Best Human Mentor
      const bestMentor = await this.findBestMentor(userId, keywords);
      const question = new Question({ userId, questionText, keywords, status: 'pending' });
      
      if (bestMentor) {
        question.selectedMentorId = bestMentor._id;
        question.status = 'mentor_assigned';
        await question.save();
        
        // Notification
        try {
          await sendMentorNewQuestionNotification(bestMentor.email, bestMentor.username, questionText);
        } catch (mailErr) { console.log("Mail Err ignored"); }
        
        return { success: true, questionId: question._id, message: `Matching with ${bestMentor.username}...` };
      }

      await question.save();
      return { success: false, message: 'Looking for a senior...' };
    } catch (error) { throw error; }
  }

  extractBetterKeywords(text) {
    const base = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    return [...new Set(base)].slice(0, 15);
  }

  // Submission logic with load update
  async transformToAnswerCard(mentorExperience, question) {
    // mentorExperience: MentorExperience mongoose doc
    // question: Question mongoose doc
    const mentorId = mentorExperience.mentorId;
    const questionId = question._id;
    const mentorExperienceId = mentorExperience._id;
    const answerContent = mentorExperience.rawExperience;
    // 1. Generate Embedding
    const embedding = await getQuestionEmbedding(answerContent.situation || '');
    // 2. Save Card (include mentorExperienceId)
    const newCard = new AnswerCard({ mentorId, questionId, mentorExperienceId, answerContent, embedding });
    await newCard.save();
    // 3. Update Load
    await User.findByIdAndUpdate(mentorId, { $inc: { activeQuestions: -1 } });
    return newCard;
  }
}

export default new AtyantEngine();