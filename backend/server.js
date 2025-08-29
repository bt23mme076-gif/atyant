// backend/server.js (Production-Ready for Render & Private Chat)
// ES Module style

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chatRoutes.js';

// Import models (ESM default imports)
import Message from './models/Message.js';
import User from './models/User.js';
import Contact from './models/Contact.js';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
const FRONTEND_URL = process.env.FRONTEND_URL || "https://atyant.vercel.app";
const allowedOrigins = [FRONTEND_URL, "http://localhost:5173", "https://atyant.vercel.app"];

app.use(cors({
  origin: allowedOrigins,
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

// --- Create HTTP server for Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- Socket.IO Private Chat ---
io.on('connection', (socket) => {
  console.log('✅ User connected via WebSocket:', socket.id);

  // Join user to their private room
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room: ${userId}`);
  });

  // Handle private messages
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
      console.error('Error saving/sending private message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// --- Start server ---
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});