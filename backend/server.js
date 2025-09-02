// backend/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chatRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "https://atyant.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);
app.use('/api/contact', contactRoutes);

// --- Socket.IO Setup ---
const io = new Server(server, { cors: { origin: allowedOrigins } });

const userSocketMap = {}; // Maps userId to socket.id

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Listen for a 'sendMessage' event from a client
  socket.on('sendMessage', async (messageData) => {
    console.log('Message received on server:', messageData);

    try {
      const { senderId, receiverId, message } = messageData;

      const newMessage = new Message({
        senderId,
        receiverId,
        message,
      });

      await newMessage.save();
      console.log('✅ Message saved to MongoDB!');

      // Send the message to the receiver in real-time if they are online
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage);
        console.log(`✅ Message sent to receiver: ${receiverId}`);
      }
    } catch (error) {
      console.error('❌ Error saving message to MongoDB:', error);
    }
  });

  socket.on('disconnect', () => {
    // Remove user from the map on disconnect
    for (const [key, value] of Object.entries(userSocketMap)) {
      if (value === socket.id) {
        delete userSocketMap[key];
        break;
      }
    }
    console.log('A user disconnected:', socket.id);
  });
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});