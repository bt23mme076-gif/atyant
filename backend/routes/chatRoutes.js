import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';

const router = express.Router();

// Route to get all mentors
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('username email _id');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentors.' });
  }
});

// NEW: Route for a mentor to get a list of users they have conversations with
router.get('/conversations/mentor/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const messages = await Message.find({ $or: [{ sender: mentorId }, { receiver: mentorId }] })
      .populate('sender', 'username _id')
      .populate('receiver', 'username _id');

    const conversations = {};
    messages.forEach(msg => {
      const otherUser = String(msg.sender._id) === mentorId ? msg.receiver : msg.sender;
      if (otherUser && otherUser._id) {
        conversations[otherUser._id] = otherUser;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations.' });
  }
});

// Route to get messages between two users
router.get('/messages/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort({ createdAt: 'asc' });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages.' });
  }
});

export default router;