import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';

const router = express.Router();

// This route remains unchanged
// It's used for the "Find Mentors" page
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('username email _id');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentors.' });
  }
});

// This route remains unchanged
// It's for a MENTOR to get their list of chats
router.get('/conversations/mentor/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const messages = await Message.find({ $or: [{ sender: mentorId }, { receiver: mentorId }] })
      .populate('sender', 'username _id role')
      .populate('receiver', 'username _id role');

    const conversations = {};
    messages.forEach(msg => {
      const otherUser = String(msg.sender._id) === mentorId ? msg.receiver : msg.sender;
      if (otherUser && otherUser._id) {
        conversations[otherUser._id] = otherUser;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentor conversations.' });
  }
});

// --- NEW ROUTE ADDED HERE ---
// This new route is for a USER to get their list of chats
router.get('/conversations/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Find all messages involving this user
        const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
            .populate('sender', 'username _id role')
            .populate('receiver', 'username _id role');

        const conversations = {};
        messages.forEach(msg => {
            // Find the other person in the chat
            const otherUser = String(msg.sender._id) === userId ? msg.receiver : msg.sender;
            // Add them to the list only if they are a mentor
            if (otherUser && otherUser.role === 'mentor') {
              conversations[otherUser._id] = otherUser;
            }
        });
        
        res.json(Object.values(conversations));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user conversations.' });
    }
});


// This route remains unchanged
// It's for getting the actual messages for a specific chat
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