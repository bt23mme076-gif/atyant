import User from '../models/User.js';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import { sendMentorNewQuestionNotification } from '../utils/emailNotifications.js';
import { getQuestionEmbedding } from './AIService.js';

class AtyantEngine {

  detectIntent(text) {
    const t = text.toLowerCase();
    if (t.includes('internship') || t.includes('intern')) return 'internship';
    if (t.includes('placement') || t.includes('job') || t.includes('role')) return 'placement';
    return null;
  }

  async findBestSemanticMatch(studentId, vector, questionText) {
    try {
      const student = await User.findById(studentId).select('education');
      const sEdu = student?.education?.[0] || {};
      const intent = this.detectIntent(questionText);
      
      console.log(`\n🔎 --- AI SEMANTIC ANALYSIS (Unique Mentor Mode) ---`);
      
      const candidates = await AnswerCard.aggregate([
        {
          "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": vector,
            "numCandidates": 30, // candidates badha diye taaki variety mile
            "limit": 15
          }
        },
        { "$project": { "answerContent": 1, "mentorId": 1, "score": { "$meta": "vectorSearchScore" } } }
      ]);

      // 🛡️ Map to store the best answer per mentor
      const uniqueMentorsMap = new Map();

      for (let match of candidates) {
        // 🚀 1. STRICT AI FLOOR (85%)
        if (match.score < 0.85) continue;

        const mentor = await User.findById(match.mentorId).select('username education expertise bio');
        const mExpertiseStr = ((mentor?.expertise || []).join(' ') + ' ' + (mentor?.bio || '')).toLowerCase();
        
        // 🚀 2. AUTHORITY GATE (Min 120 points)
        let authority = 0;
        if (mExpertiseStr.includes('internship')) authority += 120;
        if (mExpertiseStr.includes('placement')) authority += 120;
        if (mExpertiseStr.includes('ppo')) authority += 50;
        if (mExpertiseStr.includes('job')) authority += 40;

        if (authority < 120) continue; 

        // 🚀 3. HYBRID SCORING (College/Branch Bonus)
        const mEdu = mentor?.education?.[0] || {};
        const isSameCollege = sEdu.institution?.toLowerCase() === mEdu.institution?.toLowerCase();
        const isSameBranch = sEdu.field?.toLowerCase() === mEdu.field?.toLowerCase();
        
        // Final Math: AI Score + Context Bonuses
        const hybridScore = match.score + (isSameBranch ? 0.05 : 0) + (isSameCollege ? 0.03 : 0);

        // 🚀 4. UNIQUE GROUPING LOGIC
        // Agar ye mentor pehle mil chuka hai, toh sirf tabhi update karein agar naya score zyada ho
        if (!uniqueMentorsMap.has(match.mentorId) || hybridScore > uniqueMentorsMap.get(match.mentorId).finalScore) {
          uniqueMentorsMap.set(match.mentorId, {
            ...match,
            finalScore: hybridScore,
            username: mentor?.username,
            authorityPts: authority,
            context: `${isSameCollege ? 'Same College ' : ''}${isSameBranch ? 'Same Branch' : ''}`
          });
        }
      }

      // Map ko array mein badlein aur Score ke hisaab se sort karein
      const finalRankings = Array.from(uniqueMentorsMap.values()).sort((a, b) => b.finalScore - a.finalScore);

      // --- TERMINAL LOGGING (Clean & Unique) ---
      finalRankings.forEach((m, i) => {
        console.log(`Rank #${i + 1}: ${m.username}`);
        console.log(`   ├─ 📊 Final Hybrid Score: ${(m.finalScore * 100).toFixed(2)}%`);
        console.log(`   ├─ 🏗️ Authority: ${m.authorityPts}`);
        console.log(`   └─ 🎓 Context: ${m.context || 'General Match'}`);
      });

      const best = finalRankings[0];
      return best && best.finalScore > 0.88 ? best : null; 
    } catch (e) { console.error("Engine Error:", e); return null; }
  }

  async findBestMentor(studentId, keywords) {
    try {
      const student = await User.findById(studentId).select('education');
      const sEdu = student?.education?.[0] || {};
      const intent = this.detectIntent(keywords.join(' '));

      console.log(`\n🤝 --- LIVE MENTOR ALLOTMENT ANALYSIS ---`);
      console.log(`Detected Intent: ${intent || 'General'}`);

      const mentors = await User.find({ role: 'mentor' }).select('username email education expertise bio');

      const eligibleMentors = mentors.filter(mentor => {
        const text = ((mentor.expertise || []).join(' ') + ' ' + (mentor.bio || '')).toLowerCase();
        if (intent === 'internship') return text.includes('intern');
        if (intent === 'placement') return text.includes('placement') || text.includes('job');
        return true; 
      });

      console.log(`Eligible Mentors Found: ${eligibleMentors.length}`);

      const scored = eligibleMentors.map(mentor => {
        let points = 0;
        const lowerBio = ((mentor.expertise || []).join(' ') + ' ' + (mentor.bio || '')).toLowerCase();
        const mEdu = mentor.education?.[0] || {};
        const collegeMatch = sEdu.institution?.toLowerCase() === mEdu.institution?.toLowerCase();
        const branchMatch = sEdu.field?.toLowerCase() === mEdu.field?.toLowerCase();
        
        let breakdown = [];
        if (lowerBio.includes('internship') || lowerBio.includes('placement')) { points += 200; breakdown.push('Exp: +200'); }
        if (lowerBio.includes('ppo')) { points += 60; breakdown.push('PPO: +60'); }
        if (branchMatch) { points += 40; breakdown.push('Branch: +40'); }
        if (collegeMatch) { points += 20; breakdown.push('College: +20'); }
        
        console.log(`Mentor: ${mentor.username} | Total Points: ${points} | Breakdown: [${breakdown.join(', ')}]`);
        return { mentor, points };
      });

      scored.sort((a, b) => b.points - a.points);
      const winner = scored[0]?.mentor || null;
      
      if (winner) console.log(`🎯 WINNER SELECTED: ${winner.username} (${winner.email})`);
      return winner;
    } catch (e) { return null; }
  }

  // ... (aiTransformExperience & transformToAnswerCard as they were)

  async processQuestion(userId, questionText, options = {}) {
    try {
      console.log('\n🚀 ========== ATYANT ENGINE START ==========');
      const vector = await getQuestionEmbedding(questionText);
      const keywords = this.extractBetterKeywords(questionText);

      console.log(`📡 AI Vector ready for: "${questionText.substring(0, 40)}..."`);

      if (vector && !options.isFollowUp) {
        const match = await this.findBestSemanticMatch(userId, vector, questionText);

        if (match) {
          const matchPercentage = (match.finalScore * 100).toFixed(2);
          console.log("\n✅ [RESULT] INSTANT AI MATCH SUCCESSFUL");
          console.log(`🏆 Best Mentor: ${match.name}`);
          console.log(`📊 Total Strength: ${matchPercentage}%`);
          console.log("-----------------------------------------");

          const q = new Question({
            userId, 
            questionText, 
            status: 'answered_instantly',
            answerCardId: match._id, 
            isInstant: true,
            matchScore: Math.round(match.finalScore * 100)
          });
          await q.save();
          return { success: true, instantAnswer: true, questionId: q._id, answer: match.answerContent };
        } else {
          console.log("\n⚠️ [RESULT] NO INSTANT MATCH. Moving to Live Mentor Allotment.");
        }
      }

      const bestMentor = await this.findBestMentor(userId, keywords);
      const question = new Question({ userId, questionText, keywords, status: 'pending' });
      
      if (bestMentor) {
        question.selectedMentorId = bestMentor._id;
        question.status = 'mentor_assigned';
        await question.save();
        
        // Final Confirmation Log
        console.log(`📬 NOTIFICATION: Question sent to Mentor Dashboard: ${bestMentor.username}`);
        console.log('🚀 ========== ATYANT ENGINE FINISHED ==========\n');
        
        return { success: true, questionId: question._id, message: `Matching with ${bestMentor.username}...` };
      }

      await question.save();
      console.log("❌ No Mentor Found. Question set to global pool.");
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