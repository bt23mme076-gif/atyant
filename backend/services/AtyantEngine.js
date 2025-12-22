// Atyant Engine - Core logic for selecting best-fit mentor
import User from '../models/User.js';
import Question from '../models/Question.js';
import MentorExperience from '../models/MentorExperience.js';
import AnswerCard from '../models/AnswerCard.js';
import { extractKeywords } from '../utils/keywordExtractor.js';
import { sendMentorNewQuestionNotification } from '../utils/emailNotifications.js';

class AtyantEngine {
  
  /**
   * Extract better keywords from question text
   */
  extractBetterKeywords(text) {
    if (!text) return [];
    
    const stopWords = ['how', 'what', 'when', 'where', 'why', 'who', 'which', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'on', 'at', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'will', 'can', 'should', 'kaise', 'kya', 'kab', 'kahan', 'kyun'];
    
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));
    
    const extracted = extractKeywords ? extractKeywords(text) : [];
    const combined = [...new Set([...words, ...extracted])];
    
    return combined.slice(0, 15);
  }

  /**
   * Find best-fit mentor for a question
   * This is INTERNAL - user never sees this
   */
  async findBestMentor(questionText, keywords) {
    try {
      console.log('🔍 Atyant Engine: Finding best mentor for keywords:', keywords);
      
      // Build search strategies
      const searchQueries = [];
      
      // Strategy 1: Expertise match (highest priority)
      searchQueries.push({
        role: 'mentor',
        expertise: { 
          $in: keywords.map(k => new RegExp(k, 'i'))
        }
      });
      
      // Strategy 2: Bio contains keywords
      searchQueries.push({
        role: 'mentor',
        bio: { 
          $regex: keywords.join('|'), 
          $options: 'i' 
        }
      });
      
      // Find matching mentors
      const mentors = await User.find({
        $or: searchQueries
      })
      .select('username name expertise bio ratings location')
      .limit(20);
      
      if (mentors.length === 0) {
        console.log('⚠️ No mentors found, using fallback');
        // Fallback: Get any experienced mentor
        const fallbackMentors = await User.find({ role: 'mentor' })
          .sort({ 'ratings.average': -1 })
          .limit(5);
        
        if (fallbackMentors.length > 0) {
          return {
            mentor: fallbackMentors[0],
            reason: 'Fallback: Top-rated mentor',
            score: 1
          };
        }
        
        return null;
      }
      
      // Score each mentor
      const scoredMentors = mentors.map(mentor => {
        let score = 0;
        let reasons = [];
        
        // Expertise match (5 points per match)
        if (mentor.expertise) {
          mentor.expertise.forEach(exp => {
            keywords.forEach(kw => {
              if (exp.toLowerCase().includes(kw.toLowerCase())) {
                score += 5;
                reasons.push(`Expertise: ${exp}`);
              }
            });
          });
        }
        
        // Bio match (2 points per match)
        if (mentor.bio) {
          keywords.forEach(kw => {
            if (mentor.bio.toLowerCase().includes(kw.toLowerCase())) {
              score += 2;
              reasons.push(`Bio mentions: ${kw}`);
            }
          });
        }
        
        // Rating boost (up to 3 points)
        if (mentor.ratings && mentor.ratings.average) {
          score += (mentor.ratings.average / 5) * 3;
          reasons.push(`Rating: ${mentor.ratings.average.toFixed(1)}/5`);
        }
        
        // Check if mentor has solved similar questions before
        // TODO: Implement experience history check
        
        return { 
          mentor, 
          score, 
          reason: reasons.join(', ')
        };
      });
      
      // Sort by score (highest first)
      scoredMentors.sort((a, b) => b.score - a.score);
      
      console.log('✅ Atyant Engine: Selected mentor:', scoredMentors[0].mentor.username, 'Score:', scoredMentors[0].score);
      
      return scoredMentors[0];
    } catch (error) {
      console.error('❌ Atyant Engine error:', error);
      throw error;
    }
  }

  /**
   * Process a new question submission
   */
  async processQuestion(userId, questionText, options = {}) {
    try {
      const { isFollowUp = false, originalMentorId = null, parentQuestionId = null, parentAnswerCardId = null } = options;
      
      console.log('\n🚀 ========== PROCESSING QUESTION ==========');
      console.log('👤 User ID:', userId);
      console.log('📝 Question:', questionText);
      console.log('🔄 Is Follow-up:', isFollowUp);
      if (isFollowUp) {
        console.log('👨‍🏫 Original Mentor ID (should be used):', originalMentorId);
        console.log('🔗 Parent Question ID:', parentQuestionId);
        console.log('📋 Parent Answer Card ID:', parentAnswerCardId);
        console.log('⚠️ Will NOT create new answer card - will append to existing');
      }
      
      // Extract keywords
      const keywords = this.extractBetterKeywords(questionText);
      console.log('🔍 Extracted keywords:', keywords);
      
      // Create question record
      const question = new Question({
        userId,
        questionText,
        keywords,
        status: 'pending',
        isFollowUp: isFollowUp,
        parentQuestionId: parentQuestionId
      });
      
      await question.save();
      console.log('✅ Question saved with ID:', question._id);
      
      // For follow-up questions, use the original mentor (bypass mentor selection)
      if (isFollowUp && originalMentorId) {
        console.log('\n🔁 FOLLOW-UP MODE ACTIVATED');
        console.log('⚠️ BYPASSING MENTOR SELECTION');
        console.log('✅ Using original mentor:', originalMentorId);
        
        question.selectedMentorId = originalMentorId;
        question.selectionReason = 'Follow-up question - same mentor as original';
        question.status = 'mentor_assigned';
        
        // ⚠️ IMPORTANT: Set answer card ID to parent's answer card for continuity
        if (parentAnswerCardId) {
          question.answerCardId = parentAnswerCardId;
          console.log('📋 Linked to parent answer card:', parentAnswerCardId);
        }
        
        await question.save();
        
        console.log('✅ Follow-up assigned to original mentor');
        console.log('📝 Question ID:', question._id);
        console.log('📝 Mentor ID:', originalMentorId);
        console.log('🔗 Parent Question ID:', parentQuestionId);
        console.log('📋 Answer Card ID:', parentAnswerCardId);
        console.log('==========================================\n');
        
        return {
          success: true,
          questionId: question._id,
          message: 'Follow-up question submitted to your mentor...',
        };
      }
      
      // For new questions, find best mentor
      console.log('\n🆕 NEW QUESTION MODE');
      console.log('🔍 Finding best mentor...');
      const bestMatch = await this.findBestMentor(questionText, keywords);
      
      if (!bestMatch) {
        question.status = 'pending';
        await question.save();
        return {
          success: false,
          message: 'No suitable mentor found at this moment. We will assign one soon.',
          questionId: question._id
        };
      }
      
      // Assign mentor (internally)
      question.selectedMentorId = bestMatch.mentor._id;
      question.selectionReason = bestMatch.reason;
      question.status = 'mentor_assigned';
      await question.save();
      
      console.log('✅ Question assigned to mentor:', bestMatch.mentor.username);
      console.log('📝 Question ID:', question._id);
      console.log('📝 Mentor ID:', bestMatch.mentor._id);
      console.log('📝 Status:', question.status);
      
      // Send notification to mentor
      try {
        await sendMentorNewQuestionNotification(
          bestMatch.mentor.email,
          bestMatch.mentor.name || bestMatch.mentor.username,
          questionText,
          keywords
        );
        console.log('📧 Notification email sent to mentor');
      } catch (emailError) {
        console.error('❌ Failed to send mentor notification:', emailError);
        // Don't fail the whole process if email fails
      }
      
      return {
        success: true,
        questionId: question._id,
        message: 'Atyant Engine is processing your question...',
        // DO NOT return mentor details to user
      };
    } catch (error) {
      console.error('Error processing question:', error);
      throw error;
    }
  }

  /**
   * Transform raw mentor experience into Answer Card
   * Uses AI to convert mentor's voice into Atyant's voice
   */
  async transformToAnswerCard(mentorExperience, question) {
    try {
      const rawExp = mentorExperience.rawExperience;
      
      // Use AI to transform
      const transformed = await this.aiTransformExperience(rawExp, question.questionText);
      
      // Create Answer Card
      const answerCard = new AnswerCard({
        questionId: question._id,
        mentorExperienceId: mentorExperience._id,
        mentorId: mentorExperience.mentorId,
        answerContent: transformed
      });
      
      await answerCard.save();
      
      // Update question status
      question.answerCardId = answerCard._id;
      question.status = 'answer_generated';
      await question.save();
      
      return answerCard;
    } catch (error) {
      console.error('Error transforming to answer card:', error);
      throw error;
    }
  }

  /**
   * AI transformation of raw experience to Answer Card
   */
  async aiTransformExperience(rawExperience, questionText) {
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        // Fallback: Manual transformation
        return this.manualTransform(rawExperience);
      }
      
      const prompt = `You are Atyant's AI transformer. Convert this mentor's raw experience into a structured Answer Card.

ORIGINAL QUESTION: ${questionText}

MENTOR'S RAW EXPERIENCE:
Situation: ${rawExperience.situation}
First Attempt: ${rawExperience.firstAttempt}
What Failed: ${rawExperience.failures}
What Worked: ${rawExperience.whatWorked}
Step-by-Step: ${rawExperience.stepByStep}
Timeline: ${rawExperience.timeline}
Would Do Differently: ${rawExperience.wouldDoDifferently}

TRANSFORM THIS INTO:
1. Main Answer (conversational, practical, opinionated - NOT generic AI tone)
2. Key Mistakes (3-5 clear mistakes from failures)
3. Actionable Steps (5-7 specific steps with descriptions)
4. Timeline (realistic expectations)
5. Real Context (what makes this answer credible)

RULES:
- Use Atyant's voice (confident, direct, practical)
- NO motivational fluff
- NO generic advice
- Include REAL mistakes
- Be SPECIFIC and ACTIONABLE
- Avoid "you should", use "Here's what works"

Return ONLY valid JSON:
{
  "mainAnswer": "...",
  "keyMistakes": ["...", "..."],
  "actionableSteps": [{"step": "...", "description": "..."}, ...],
  "timeline": "...",
  "realContext": "..."
}`;

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
              temperature: 0.7,
              maxOutputTokens: 2000,
              topP: 0.9
            }
          })
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('AI transformation failed, using manual fallback');
        return this.manualTransform(rawExperience);
      }
      
      const transformed = JSON.parse(jsonMatch[0]);
      return transformed;
      
    } catch (error) {
      console.error('AI transformation error:', error);
      return this.manualTransform(rawExperience);
    }
  }

  /**
   * Manual transformation fallback
   */
  manualTransform(rawExperience) {
    return {
      mainAnswer: `Here's what worked based on real experience:\n\n${rawExperience.whatWorked}\n\nThe key was: ${rawExperience.stepByStep}`,
      keyMistakes: rawExperience.failures.split('.').filter(s => s.trim()).slice(0, 5),
      actionableSteps: rawExperience.stepByStep.split('\n').filter(s => s.trim()).map((step, idx) => ({
        step: `Step ${idx + 1}`,
        description: step.trim()
      })).slice(0, 7),
      timeline: rawExperience.timeline,
      realContext: `Based on direct experience with: ${rawExperience.situation}`
    };
  }
}

// Export singleton instance
const atyantEngine = new AtyantEngine();
export default atyantEngine;
