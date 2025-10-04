import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';

const router = express.Router();

// Route to get all mentors
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('username email _id profilePicture');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentors.' });
  }
});

// Mentor -> get their list of chats
router.get('/conversations/mentor/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const messages = await Message.find({ $or: [{ sender: mentorId }, { receiver: mentorId }] })
      .populate('sender', 'username _id role profilePicture')  // ADDED profilePicture
      .populate('receiver', 'username _id role profilePicture'); // ADDED profilePicture

    const conversations = {};
    messages.forEach(msg => {
      if (!msg.sender || !msg.receiver) return; // skip broken refs

      const otherUser = String(msg.sender._id) === mentorId ? msg.receiver : msg.sender;
      if (otherUser && otherUser._id) {
        conversations[otherUser._id] = otherUser;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    console.error('Error fetching mentor conversations:', error);
    res.status(500).json({ message: 'Error fetching mentor conversations.' });
  }
});

// User -> get their "My Chats" list
router.get('/conversations/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
      .populate('sender', 'username _id role profilePicture')  // ADDED profilePicture
      .populate('receiver', 'username _id role profilePicture'); // ADDED profilePicture

    const conversations = {};
    messages.forEach(msg => {
      if (!msg.sender || !msg.receiver) return; // skip broken refs

      const otherUser = String(msg.sender._id) === userId ? msg.receiver : msg.sender;
      if (otherUser && otherUser.role === 'mentor') {
        conversations[otherUser._id] = otherUser;
      }
    });
    
    res.json(Object.values(conversations));
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({ message: 'Error fetching user conversations.' });
  }
});

// Get actual messages for a specific chat
router.get('/messages/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const { skip = 0, limit = 20 } = req.query;
    
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
    .populate('sender', 'username _id profilePicture')    // ADDED profilePicture
    .populate('receiver', 'username _id profilePicture')  // ADDED profilePicture
    .sort({ createdAt: -1 })  // Latest first for pagination
    .skip(parseInt(skip))
    .limit(parseInt(limit));

    // Reverse to show oldest first in UI
    const reversedMessages = messages.reverse();
    res.json(reversedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages.' });
  }
});

export default router;
