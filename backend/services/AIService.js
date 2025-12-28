import fetch from 'node-fetch';
import axios from 'axios'; 
import User from '../models/User.js';
import AIConversation from '../models/AIConversation.js';
import { ATYANT_KNOWLEDGE, findRelevantInfo } from './AtyantKnowledge.js';

/**
 * 🚀 FEATURE: Question Text ko Vector mein badalna
 * Ye function Python Service se baat karke searchable numbers lata hai.
 */
export const getQuestionEmbedding = async (text) => {
  try {
    const PYTHON_SERVICE_URL = process.env.PYTHON_AI_URL || "http://127.0.0.1:8000";
    const response = await axios.post(`${PYTHON_SERVICE_URL}/embed`, { text });

    // Debugging: Check karo Python actually kya bhej raha hai
    if (response.data.error) {
      console.error("⚠️ Python Service Error:", response.data.details || response.data.error);
      return null;
    }

    let vector = response.data.embedding;

    if (!Array.isArray(vector)) {
      console.error("⚠️ Expected embedding array but got:", typeof vector);
      return null;
    }

    return vector;
  } catch (error) {
    console.error("❌ Python AI Service Call Failed:", error.message);
    return null; 
  }
};

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-1.5-flash'; // Sabse stable aur fast model
    
    if (!this.apiKey) {
      console.error('❌ GEMINI_API_KEY not found in .env!');
      return;
    }
    console.log('✅ Gemini AI initialized successfully');
  }

  // Aapka Platform Knowledge Prompt
  getSystemPrompt() {
    return `You are Atyant AI Assistant - an expert on the Atyant student mentorship platform.
    ABOUT ATYANT: ${ATYANT_KNOWLEDGE.platform.description}
    KEY FEATURES: ${ATYANT_KNOWLEDGE.platform.features.map(f => `${f.icon} ${f.name}`).join(', ')}
    YOUR ROLE: Help students find mentors and answer Atyant related queries concisely. 😊`;
  }

  /**
   * 🤖 CHAT FLOW: Gemini Conversation Logic
   */
  async chat(userId, userMessage, conversationId = null) {
    try {
      console.log('🤖 AI Chat Request for User:', userId);

      if (!this.apiKey) throw new Error('API key not configured');
      if (!userMessage?.trim()) throw new Error('Message cannot be empty');

      const platformInfo = findRelevantInfo(userMessage);

      let conversation = conversationId 
        ? await AIConversation.findOne({ _id: conversationId, userId }) 
        : await AIConversation.create({ userId, messages: [] });

      if (!conversation) conversation = await AIConversation.create({ userId, messages: [] });

      conversation.messages.push({ role: 'user', content: userMessage, timestamp: new Date() });

      let aiResponse;
      if (platformInfo) {
        aiResponse = platformInfo.type === 'faq' ? platformInfo.content.answer : "I can help with that Atyant feature!";
      } else {
        // Gemini API logic
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${this.getSystemPrompt()}\nUser: ${userMessage}` }] }]
          })
        });
        const data = await response.json();
        aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help! 😊";
      }

      conversation.messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });
      await conversation.save();

      return { success: true, response: aiResponse, conversationId: conversation._id };
    } catch (error) {
      console.error('❌ Chat Error:', error.message);
      return { success: false, response: "Sorry, I'm having trouble! 🙏" };
    }
  }

  // Intent Detection Logic
  detectIntent(message) {
    const lower = message.toLowerCase();
    if (/internship|exam|study/i.test(lower)) return { category: 'academic', needsMentor: true };
    return { category: 'general', needsMentor: false };
  }

  // Mentor Search Logic
  async findRelevantMentors(category, excludeUserId) {
    try {
      return await User.find({ role: 'mentor', _id: { $ne: excludeUserId } }).limit(3);
    } catch (error) { return []; }
  }
}

// Dono exports set hain: Instance (default) aur Function (named)
const aiServiceInstance = new AIService();
export default aiServiceInstance;