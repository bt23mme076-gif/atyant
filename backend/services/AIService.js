import fetch from 'node-fetch';
import User from '../models/User.js';
import AIConversation from '../models/AIConversation.js';
import { ATYANT_KNOWLEDGE, findRelevantInfo } from './AtyantKnowledge.js';

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'models/gemini-2.5-flash';
    
    if (!this.apiKey) {
      console.error('❌ GEMINI_API_KEY not found!');
      return;
    }
    
    console.log('✅ Gemini AI initialized successfully');
    console.log('🤖 Using model:', this.model);
    console.log('🔑 API Key:', this.apiKey.substring(0, 15) + '...');
  }

  getSystemPrompt() {
    return `You are Atyant AI Assistant - an expert on the Atyant student mentorship platform.

ABOUT ATYANT:
${ATYANT_KNOWLEDGE.platform.description}

KEY FEATURES:
${ATYANT_KNOWLEDGE.platform.features.map(f => `${f.icon} ${f.name}: ${f.description}`).join('\n')}

CATEGORIES WE SERVE:
${ATYANT_KNOWLEDGE.platform.categories.map(c => `- ${c.name}: ${c.description}`).join('\n')}

YOUR ROLE:
1. Help students find the right mentors
2. Answer questions about Atyant platform
3. Provide academic and career guidance
4. Be friendly, supportive, and concise (2-3 sentences)

IMPORTANT:
- Always mention you're part of Atyant when introducing yourself
- Recommend mentors when users need help
- Use emojis occasionally 😊
- Keep responses SHORT and helpful`;
  }

  async chat(userId, userMessage, conversationId = null) {
    try {
      console.log('\n========================================');
      console.log('🤖 AI Chat Request');
      console.log('   User ID:', userId);
      console.log('   Message:', userMessage);
      console.log('========================================\n');

      if (!this.apiKey) {
        throw new Error('API key not configured');
      }

      if (!userMessage?.trim()) {
        throw new Error('Message cannot be empty');
      }

      // Check for platform-specific queries first
      const platformInfo = findRelevantInfo(userMessage);
      console.log('🔍 Platform info check:', platformInfo?.type || 'none');

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await AIConversation.findOne({
          _id: conversationId,
          userId: userId
        });
        
        if (!conversation) {
          conversation = await AIConversation.create({
            userId,
            messages: [],
            context: { currentTopic: 'general', suggestedMentors: [] }
          });
        }
      } else {
        conversation = await AIConversation.create({
          userId,
          messages: [],
          context: { currentTopic: 'general', suggestedMentors: [] }
        });
        console.log('✅ New conversation created');
      }

      // Add user message
      conversation.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      let aiResponse;

      // If platform-specific query, provide direct answer
      if (platformInfo) {
        console.log('📋 Using platform knowledge for response');
        
        if (platformInfo.type === 'faq') {
          aiResponse = `${platformInfo.content.answer}\n\nNeed more help? I'm here! 😊`;
        } else if (platformInfo.type === 'task') {
          aiResponse = platformInfo.content;
        } else if (platformInfo.type === 'category') {
          const cat = platformInfo.content;
          aiResponse = `${cat.name} 🎯\n\n${cat.description}\n\nWe can help with: ${cat.subcategories.slice(0, 3).join(', ')}, and more! Want me to find mentors in this area?`;
        } else if (platformInfo.type === 'feature') {
          const feat = platformInfo.content;
          aiResponse = `${feat.icon} ${feat.name}\n\n${feat.description}\n\nWant to try this feature?`;
        }
      } else {
        // Use AI for general queries with platform context
        const recentMessages = conversation.messages.slice(-4);
        let conversationHistory = '';
        
        recentMessages.forEach(msg => {
          conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });

        const promptText = `${this.getSystemPrompt()}

CONVERSATION:
${conversationHistory}
Assistant:`;

        console.log('🔄 Calling Gemini API');

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/${this.model}:generateContent?key=${this.apiKey}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: promptText
                }]
              }],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 400,
                topK: 40,
                topP: 0.95,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_NONE"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_NONE"
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_NONE"
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_NONE"
                }
              ]
            })
          });

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }

          const data = await response.json();
          
          let foundText = false;
          
          if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            if (candidate.content?.parts && candidate.content.parts.length > 0) {
              for (const part of candidate.content.parts) {
                if (part.text && part.text.trim()) {
                  aiResponse = part.text.trim();
                  foundText = true;
                  console.log('✅ Gemini Response:', aiResponse.substring(0, 100) + '...');
                  break;
                }
              }
            }
            
            if (candidate.finishReason === 'SAFETY') {
              aiResponse = "I can't respond to that. Let's talk about how Atyant can help you! 😊";
              foundText = true;
            }
          }
          
          if (!foundText) {
            throw new Error('Empty response from API');
          }
          
        } catch (apiError) {
          console.error('❌ Gemini API Error:', apiError.message);
          aiResponse = "I'm having trouble right now 🤖. But I can still help you explore Atyant! What would you like to know?";
        }
      }

      // Detect intent
      const intent = this.detectIntent(userMessage);
      console.log('🎯 Intent detected:', intent.category);

      // Find mentors if needed
      let suggestedMentors = [];
      if (intent.needsMentor) {
        suggestedMentors = await this.findRelevantMentors(intent.category, userId);
        if (suggestedMentors.length > 0) {
          conversation.context.suggestedMentors = suggestedMentors.map(m => m._id);
          console.log(`📍 Found ${suggestedMentors.length} relevant mentors`);
        }
      }

      // Save AI response
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      conversation.metadata.totalMessages = conversation.messages.length;
      conversation.metadata.lastActive = new Date();
      conversation.context.currentTopic = intent.category;

      await conversation.save();

      console.log('✅ Conversation saved - Total messages:', conversation.metadata.totalMessages);
      console.log('========================================\n');

      return {
        success: true,
        response: aiResponse,
        conversationId: conversation._id,
        suggestedMentors: suggestedMentors,
        intent: intent,
        messageCount: conversation.metadata.totalMessages
      };

    } catch (error) {
      console.error('❌ Service Error:', error.message);
      
      return {
        success: false,
        response: "Sorry, I'm having trouble right now. But I'm here to help you with Atyant! 🙏",
        error: error.message
      };
    }
  }

  detectIntent(message) {
    const lower = message.toLowerCase();

    // Platform-specific queries
    if (/what is atyant|about atyant|tell me about|platform|feature|how does.*work/i.test(lower)) {
      return { category: 'platform-info', needsMentor: false };
    }

    // Academic & College Life
    if (/study|exam|preparation|notes|material|lab|project|guidance|internship|college|event|time management|branch|club|society/i.test(lower)) {
      return { 
        category: 'academic', 
        needsMentor: /help|guidance|mentor|need/i.test(lower)
      };
    }

    // Technical & Skill-Based
    if (/web|app|development|machine learning|artificial intelligence|ai|data science|ui|ux|design|cybersecurity|cloud|computing|programming|embedded|cad|cae|solidworks|autocad/i.test(lower)) {
      return { 
        category: 'technical', 
        needsMentor: /learn|help|mentor|teach/i.test(lower)
      };
    }

    // Career & Growth
    if (/resume|linkedin|interview|internship search|job|placement|startup|freelancing|public speaking|networking|career/i.test(lower)) {
      return { 
        category: 'career', 
        needsMentor: true 
      };
    }

    // Personal & Lifestyle
    if (/productivity|motivation|fitness|health|mental|well-being|communication|english speaking/i.test(lower)) {
      return { 
        category: 'personal', 
        needsMentor: true 
      };
    }

    // Entrepreneurship
    if (/idea validation|mvp|fundraising|pitch deck|marketing strategy|growth hacking|startup registration|founding team|entrepreneur/i.test(lower)) {
      return { 
        category: 'entrepreneurship', 
        needsMentor: true 
      };
    }

    return { category: 'general', needsMentor: false };
  }

  async findRelevantMentors(category, excludeUserId) {
    try {
      const expertiseMap = {
        'academic': ['Teaching', 'Education', 'Academic', 'Exam Preparation', 'Study Material', 'Lab Work', 'Project Guidance'],
        'technical': ['Web Development', 'App Development', 'Machine Learning', 'AI', 'Data Science', 'UI/UX', 'Cybersecurity', 'Cloud Computing', 'Programming'],
        'career': ['Career Counseling', 'Resume Building', 'Interview Prep', 'Networking', 'Public Speaking', 'Freelancing'],
        'personal': ['Life Coach', 'Counseling', 'Productivity', 'Motivation', 'Fitness', 'Mental Health'],
        'entrepreneurship': ['Startup', 'Entrepreneurship', 'Fundraising', 'Marketing', 'Pitch Deck', 'MVP']
      };

      const keywords = expertiseMap[category] || [];
      
      const query = {
        role: 'mentor',
        _id: { $ne: excludeUserId }
      };

      if (keywords.length > 0) {
        query.$or = [
          { expertise: { $in: keywords } },
          { skills: { $in: keywords } }
        ];
      }

      return await User.find(query)
        .select('username profilePicture bio expertise skills')
        .limit(3);

    } catch (error) {
      console.error('❌ Error finding mentors:', error);
      return [];
    }
  }

  async getConversation(userId, conversationId) {
    try {
      return await AIConversation.findOne({
        _id: conversationId,
        userId: userId
      }).populate('context.suggestedMentors', 'username profilePicture bio expertise');
    } catch (error) {
      return null;
    }
  }

  async getAllConversations(userId) {
    try {
      const conversations = await AIConversation.find({ userId })
        .select('messages context.currentTopic metadata')
        .sort({ 'metadata.lastActive': -1 })
        .limit(20);
      
      return conversations.map(conv => ({
        _id: conv._id,
        preview: conv.messages[conv.messages.length - 1]?.content.substring(0, 50) + '...',
        topic: conv.context.currentTopic,
        messageCount: conv.metadata.totalMessages,
        lastActive: conv.metadata.lastActive
      }));
    } catch (error) {
      return [];
    }
  }

  async deleteConversation(userId, conversationId) {
    try {
      const result = await AIConversation.findOneAndDelete({
        _id: conversationId,
        userId: userId
      });
      return { success: !!result };
    } catch (error) {
      return { success: false };
    }
  }
}

export default new AIService();
