import express from 'express';
import {
  sendMessage,
  getConversation,
  getAllConversations,
  deleteConversation
} from '../controllers/aiChatController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Send message to AI chatbot
router.post('/chat', sendMessage);

// Get specific conversation history
router.get('/conversation/:conversationId', getConversation);

// Get all user conversations
router.get('/conversations', getAllConversations);

// Delete conversation
router.delete('/conversation/:conversationId', deleteConversation);

export default router;