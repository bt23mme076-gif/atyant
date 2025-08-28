// backend/server.js (Fully Updated for Render & Private Chat)
// ES Module style

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

// Import your route files
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chatRoutes.js';

// Import your model files
import Contact from './models/Contact.js';
import Message from './models/Message.js';

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "https://atyant-43hmatjrd-nitins-projects-a657b35d.vercel.app", // Frontend URL
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({
  origin: [
    "https://atyant-43hmatjrd-nitins-projects-a657b35d.vercel.app", 
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://atyantuser:qf5CWLbdoKKzQlpL@cluster0.vutlgpa.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

// --- Contact form route ---
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    console.log('Contact form data saved:', newContact);
    res.status(200).json({ message: 'Form data saved successfully!' });
  } catch (error) {
    console.error('Error saving contact data:', error);
    res.status(500).json({ message: 'Server error while saving contact data.' });
  }
});

// --- Socket.IO Private Chat ---
io.on('connection', (socket) => {
  console.log('✅ A user connected via WebSocket:', socket.id);

  // User joins their private room
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined private room: ${userId}`);
  });

  // Private message handling
  socket.on('private_message', async (data) => {
    try {
      const newMessage = new Message({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text
      });
      await newMessage.save();

      io.to(data.receiver).emit('receive_private_message', newMessage);
      console.log(`Message sent from ${data.sender} to ${data.receiver}`);
    } catch (error) {
      console.error("Error saving/sending private message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// --- Start server ---
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
