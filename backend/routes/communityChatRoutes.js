import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { chatMessageLimiter, chatInfoLimiter } from '../middleware/rateLimiters.js';
import { moderator } from '../utils/ContentModerator.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Middleware to check message content
const messageContentMiddleware = (req, res, next) => {
    const messageText = req.body.text || req.body.content || req.body.message;
    
    if (messageText) {
        const validationResult = moderator.validateMessage(messageText);
        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                message: validationResult.reason
            });
        }
        // Clean the message text
        req.body.text = moderator.clean(messageText);
    }
    next();
};

// Apply content moderation to all routes
router.use(messageContentMiddleware);

// Get community chat messages (last 100 or specified limit)
router.get('/messages', chatInfoLimiter, async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit) || 100;

    const messages = await Message.find({ 
      conversationId: 'community-chat' // Special ID for community chat
    })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100)) // Cap at 100 max
      .select('+isAnonymous') // Explicitly include isAnonymous field
      .populate('sender', 'name username email profilePicture role')
      .lean();

    // Reverse to show oldest first
    res.json(messages.reverse());
  } catch (error) {
    console.error('❌ Error fetching community messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message to community chat
router.post('/send', chatMessageLimiter, async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { text, isAnonymous } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const newMessage = new Message({
      conversationId: 'community-chat',
      sender: req.user._id,
      text: text.trim(),
      isAnonymous: Boolean(isAnonymous),
      createdAt: new Date()
    });

    await newMessage.save();

    // Populate sender details
    await newMessage.populate('sender', 'name username email profilePicture role');
    
    // Convert to plain object to ensure all fields are included
    const messageObj = newMessage.toObject();
    
    res.json({ success: true, message: messageObj });
  } catch (error) {
    console.error('❌ Error sending community message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get online users (users who sent messages in last 10 minutes)
router.get('/online-users', chatInfoLimiter, async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Find unique users who sent messages recently
    const recentSenders = await Message.find({
      conversationId: 'community-chat',
      createdAt: { $gte: tenMinutesAgo }
    })
      .distinct('sender');

    // Get user details
    const onlineUsers = await User.find({
      _id: { $in: recentSenders }
    })
      .select('name username email profilePicture role')
      .lean();

    // Add current user if not in the list (they're online by viewing the chat)
    const currentUserInList = onlineUsers.some(u => u._id.toString() === req.user._id.toString());
    if (!currentUserInList) {
      const currentUser = await User.findById(req.user._id)
        .select('name username email profilePicture role')
        .lean();
      if (currentUser) {
        onlineUsers.unshift(currentUser);
      }
    }
    res.json(onlineUsers);
  } catch (error) {
    console.error('❌ Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

export default router;
