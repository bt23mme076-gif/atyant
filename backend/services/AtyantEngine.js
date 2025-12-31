import User from '../models/User.js';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import { sendMentorNewQuestionNotification } from '../utils/emailNotifications.js';
import { getQuestionEmbedding } from './AIService.js';
import aiServiceInstance from './AIService.js';

const CONFIG = {
  SEMANTIC_FLOOR: 0.85,
  INSTANT_THRESHOLD: 0.88, // 🔥 88% target
  LOAD_PENALTY: 50,
  MAX_LOAD: 5
};

// Helper function: Mentor profiles se sab unique companies nikaalo
async function getAllTargetCompanies() {
  const mentors = await User.find({ role: 'mentor' }).select('topCompanies');
  // 🔥 Har element ko string check karke sanitize karein
  const allCompanies = mentors.flatMap(m =>
    Array.isArray(m.topCompanies) ? m.topCompanies.filter(c => typeof c === 'string') : []
  );
  return [...new Set(allCompanies.map(c => c.trim().toLowerCase()))].filter(Boolean);
}

class AtyantEngine {

  // Query details detection (intent, companies, tags)
  async detectQueryDetails(text) {
    const t = text.toLowerCase();
    let intent = null;
    if (t.includes('internship') || t.includes('intern')) intent = 'internship';
    if (t.includes('placement') || t.includes('job') || t.includes('role')) intent = 'placement';

    // 🔥 Dynamic companies list from mentor profiles
    const companies = await getAllTargetCompanies();
    const mentionedCompanies = companies.filter(comp => comp && t.includes(comp));

    const specialKeywords = [
      'foreign', 'iit', 'nit', 'faang', 'masters', 'research', 'iim', 'bits', 'startup',
      'ppo', 'off-campus', 'scholarship', 'on-campus'
    ];
    const foundTags = specialKeywords.filter(word => t.includes(word));

    return { intent, mentionedCompanies, foundTags };
  }

  /* =============================================
      PATH A: AI SEMANTIC (With Detailed Logs)
     ============================================= */
  async findBestSemanticMatch(studentId, vector, questionText) {
    try {
      const student = await User.findById(studentId).select('education');
      const sEdu = student?.education?.[0] || {};

      // 🔥 FIX: await zaroori hai
      const { intent, mentionedCompanies, foundTags } = await this.detectQueryDetails(questionText);
      
      console.log(`\n🔎 --- STAGE 1: AI SEMANTIC SEARCH ---`);
      console.log(`Detected Intent: ${intent || 'General'} | Companies: [${mentionedCompanies}]`);

      const candidates = await AnswerCard.aggregate([
        { "$vectorSearch": { "index": "vector_index", "path": "embedding", "queryVector": vector, "numCandidates": 40, "limit": 15 } },
        { "$project": { "answerContent": 1, "mentorId": 1, "score": { "$meta": "vectorSearchScore" } } }
      ]);

      console.log(`Found ${candidates.length} potential AI matches in Atlas.`);

      const uniqueMentorsMap = new Map();

      for (let match of candidates) {
        if (match.score < CONFIG.SEMANTIC_FLOOR) {
          // console.log(`Skipped: MentorID ${match.mentorId} score too low (${(match.score*100).toFixed(1)}%)`);
          continue;
        }

        const mentor = await User.findById(match.mentorId).select('username avatar bio education primaryDomain topCompanies milestones specialTags');
        if (!mentor) continue;

        let hybridScore = match.score;
        let bonusLogs = [];

        // 🚀 Scoring Logic
        if (mentor.primaryDomain === intent || mentor.primaryDomain === 'both') { hybridScore += 0.05; bonusLogs.push('Domain(+5%)'); }
        if (
          mentor.topCompanies?.some(
            c => typeof c === 'string' && mentionedCompanies.includes(c.toLowerCase())
          )
        ) {
          hybridScore += 0.08;
          bonusLogs.push('Company(+8%)');
        }
        if (mentor.milestones?.some(m => foundTags.some(ft => m.toLowerCase().includes(ft)))) { hybridScore += 0.05; bonusLogs.push('Milestone(+5%)'); }
        if (mentor.specialTags?.some(tag => foundTags.some(ft => tag.toLowerCase().includes(ft)))) { hybridScore += 0.07; bonusLogs.push('EliteTag(+7%)'); }

        const mEdu = mentor?.education?.[0] || {};
        if (sEdu.field?.toLowerCase() === mEdu.field?.toLowerCase()) { hybridScore += 0.03; bonusLogs.push('Branch(+3%)'); }

        if (!uniqueMentorsMap.has(match.mentorId.toString()) || hybridScore > uniqueMentorsMap.get(match.mentorId.toString()).finalScore) {
          uniqueMentorsMap.set(match.mentorId.toString(), {
            ...match,
            finalScore: hybridScore,
            mentorProfile: { username: mentor.username, avatar: mentor.avatar, bio: mentor.bio, education: mEdu },
            breakdown: bonusLogs.join(' | ') || 'No Bonuses'
          });
        }
      }

      const sorted = Array.from(uniqueMentorsMap.values()).sort((a, b) => b.finalScore - a.finalScore);
      
      // 🔥 LOGGING RANKINGS
      sorted.forEach((m, i) => {
        console.log(`Rank #${i + 1}: ${m.mentorProfile.username} | Total: ${(m.finalScore * 100).toFixed(2)}% | Logic: [AI Base: ${(m.score*100).toFixed(1)}% | ${m.breakdown}]`);
      });

      const best = sorted[0];
      if (best && best.finalScore > CONFIG.INSTANT_THRESHOLD) {
        console.log(`✅ INSTANT MATCH SUCCESS: ${best.mentorProfile.username} hit ${CONFIG.INSTANT_THRESHOLD*100}% threshold.`);
        return best;
      } else {
        console.log(`⚠️ INSTANT MATCH FAILED: No candidate reached ${CONFIG.INSTANT_THRESHOLD*100}% (Best was ${(best?.finalScore*100 || 0).toFixed(1)}%)`);
        return null;
      }
    } catch (e) { console.error("Semantic Error:", e); return null; }
  }

  /* =============================================
      PATH B: LIVE ROUTING (With Detailed Logs)
     ============================================= */
  async findBestMentor(studentId, keywords) {
    try {
      const questionText = keywords.join(' ');
      const student = await User.findById(studentId).select('education');
      const sEdu = student?.education?.[0] || {};

      // 🔥 FIX: await zaroori hai
      const { intent, mentionedCompanies, foundTags } = await this.detectQueryDetails(questionText);

      console.log(`\n🤝 --- STAGE 2: LIVE MENTOR ALLOTMENT ---`);

      const mentors = await User.find({ role: 'mentor' }).select('username education primaryDomain topCompanies milestones specialTags activeQuestions');
      console.log(`Scanning ${mentors.length} mentors in DB...`);

      const scored = mentors.map(mentor => {
        let points = 0;
        let breakdown = [];

        // Points Logic
        if (mentor.topCompanies?.some(c => mentionedCompanies.includes(c.toLowerCase()))) { points += 500; breakdown.push('TargetCompany(+500)'); }
        if (mentor.specialTags?.some(tag => foundTags.includes(tag.toLowerCase()))) { points += 400; breakdown.push('SpecialTag(+400)'); }
        if (mentor.primaryDomain === intent || mentor.primaryDomain === 'both') { points += 200; breakdown.push('Domain(+200)'); }
        if (mentor.milestones?.some(m => foundTags.some(ft => m.toLowerCase().includes(ft)))) { points += 150; breakdown.push('Milestone(+150)'); }
        
        const mEdu = mentor.education?.[0] || {};
        if (sEdu.field?.toLowerCase() === mEdu.field?.toLowerCase()) { points += 50; breakdown.push('Branch(+50)'); }
        
        // Load Penalty
        const penalty = (mentor.activeQuestions || 0) * CONFIG.LOAD_PENALTY;
        points -= penalty;
        if (penalty > 0) breakdown.push(`BusyPenalty(-${penalty})`);

        return { mentor, points, logs: breakdown.join(' ') };
      });

      const sorted = scored.sort((a, b) => b.points - a.points);
      
      // 🔥 LOGGING MENTOR POINTS
      sorted.slice(0, 5).forEach((item, i) => {
        console.log(`Mentor Rank #${i+1}: ${item.mentor.username} | Total Pts: ${item.points} | Logic: [${item.logs || 'Generic'}]`);
      });

      const winner = sorted[0] && sorted[0].points > 100 ? sorted[0].mentor : null;
      if (winner) console.log(`🎯 WINNER CHOSEN: ${winner.username}`);
      return winner;
    } catch (e) { return null; }
  }

  /* =============================================
      MAIN PROCESS
     ============================================= */
  async processQuestion(userId, questionText, options = {}) {
    try {
      console.log('\n🚀 ========== ATYANT ENGINE START ==========');
      console.log(`User Question: "${questionText.substring(0, 50)}..."`);

      const vector = await getQuestionEmbedding(questionText).catch(() => {
        console.log("❌ AI VECTOR ERROR: Service might be asleep.");
        return null;
      });
      const keywords = this.extractBetterKeywords(questionText);

      // Path A: AI Path
      if (vector && !options.isFollowUp) {
        const match = await this.findBestSemanticMatch(userId, vector, questionText);
        if (match) {
          const q = new Question({
            userId, questionText, status: 'answered_instantly',
            answerCardId: match._id, isInstant: true,
            matchScore: Math.round(match.finalScore * 100)
          });
          await q.save();
          console.log('🚀 ========== ATYANT ENGINE FINISHED (INSTANT) ==========');
          return { 
            success: true, 
            instantAnswer: true, 
            questionId: q._id, 
            answerContent: match.answerContent, // Space added after comma
            mentor: match.mentorProfile 
          };
        }
      }

      // Path B: Routing Path
      const bestMentor = await this.findBestMentor(userId, keywords);
      const question = new Question({ userId, questionText, keywords, status: 'pending' });
      
      if (bestMentor) {
        question.selectedMentorId = bestMentor._id;
        question.status = 'mentor_assigned';
        await question.save();
        await User.findByIdAndUpdate(bestMentor._id, { $inc: { activeQuestions: 1 } });
        
        try { await sendMentorNewQuestionNotification(bestMentor.email, bestMentor.username, questionText); } catch (e) {}
        console.log('🚀 ========== ATYANT ENGINE FINISHED (ROUTED) ==========');
        return { success: true, questionId: question._id, message: `Matching with ${bestMentor.username}...` };
      }

      await question.save();
      console.log("❌ NO MATCH: Question moved to global pool.");
      return { success: true, message: 'Looking for a senior...', questionId: question._id };
    } catch (error) { 
      console.error("ENGINE CRITICAL ERROR:", error);
      return { success: false, message: 'Failed to submit.' }; 
    }
  }

  extractBetterKeywords(text) {
    return [...new Set(text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3))].slice(0, 12);
  }

 async transformToAnswerCard(mentorExperience, question) {
  try {
    const mentorId = mentorExperience.mentorId;
    const questionId = question._id;
    const mentorExperienceId = mentorExperience._id;
    
    // 1. Mentor ka raw data uthaya
    const rawData = mentorExperience.rawExperience;

    console.log("✨ Atyant AI is refining the experience with Hinglish preservation...");

    // 🔥 CHANGE HERE: Purane placeholder ko asli function se badla
    let polishedContent;
    try {
      // Humne AIService mein 'refineExperience' naam rakha hai
      polishedContent = await aiServiceInstance.refineExperience(rawData);
    } catch (err) {
      console.log("⚠️ AI Service Sleep/Error, using Raw Data.");
      polishedContent = rawData;
    }

    // 🟢 Ensure keyMistakes and actionableSteps are always arrays
    if (polishedContent) {
      if (typeof polishedContent.keyMistakes === 'string') {
        polishedContent.keyMistakes = [polishedContent.keyMistakes];
      }
      if (
        polishedContent.actionableSteps &&
        typeof polishedContent.actionableSteps === 'string'
      ) {
        polishedContent.actionableSteps = [
          { step: "Next Step", description: polishedContent.actionableSteps }
        ];
      }
      // Agar null ya undefined hai toh bhi empty array set kar do
      if (!Array.isArray(polishedContent.keyMistakes)) {
        polishedContent.keyMistakes = [];
      }
      if (!Array.isArray(polishedContent.actionableSteps)) {
        polishedContent.actionableSteps = [];
      }
      // FIELD MAPPING FIX: Copy differentApproach to differentApproach if needed
      if (!polishedContent.differentApproach && polishedContent.differentApproach) {
        polishedContent.differentApproach = polishedContent.differentApproach;
      }
      // Also, if AI omits both, but rawData has it, use that
      if (!polishedContent.differentApproach && mentorExperience.rawExperience?.differentApproach) {
        polishedContent.differentApproach = mentorExperience.rawExperience.differentApproach;
      }
    }

    // 2. Generate Embedding (Search ke liye zaroori hai)
    const embedding = await getQuestionEmbedding(polishedContent.situation || '');

    // 3. Save Card (Ab isme Mistakes, Steps, Timeline sab polished aur full honge)
    const newCard = new AnswerCard({ 
      mentorId, 
      questionId, 
      mentorExperienceId, 
      answerContent: polishedContent, // Full AI refined object
      embedding 
    });

    await newCard.save();

    // 4. Update Mentor Load (-1 active question)
    await User.findByIdAndUpdate(mentorId, { $inc: { activeQuestions: -1 } });

    console.log("✅ Answer Card Created with FULL AI Fields and Personal Touch.");
    return newCard;
  } catch (error) {
    console.error("Transformation Error:", error);
    throw error;
  }
 }
}
export default new AtyantEngine();