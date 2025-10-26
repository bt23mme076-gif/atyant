import AIService from '../services/AIService.js';

// Send message to AI
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message too long (max 500 characters)'
      });
    }

    const result = await AIService.chat(userId, message, conversationId);

    res.json(result);

  } catch (error) {
    console.error('❌ AI Chat Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
};

// Get specific conversation
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id || req.user?.userId;

    const conversation = await AIService.getConversation(userId, conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation: conversation
    });

  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
};

// Get all conversations
export const getAllConversations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;

    const conversations = await AIService.getAllConversations(userId);

    res.json({
      success: true,
      conversations: conversations
    });

  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id || req.user?.userId;

    const result = await AIService.deleteConversation(userId, conversationId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
};