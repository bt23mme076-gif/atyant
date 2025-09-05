// backend/server.js - Updated with chat fixes
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chatRoutes.js';

// Import models
import Contact from './models/Contact.js';
import Message from './models/Message.js';
import User from './models/User.js'; // Make sure you have a User model

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
const allowedOrigins = [
    process.env.FRONTEND_URL || "https://atyant.vercel.app",
    "http://localhost:5173"
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI || 
  "mongodb+srv://atyantuser:qf5CWLbdoKKzQlpL@cluster0.vutlgpa.mongodb.net/atyant?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

// --- Contact form route ---
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    console.log("📩 Contact form data saved:", newContact);
    res.status(200).json({ message: "Form data saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving contact data:", error);
    res.status(500).json({ message: "Server error while saving contact data." });
  }
});

// --- NEW: Add endpoint to validate mentor ---
app.post("/api/validate-mentor", async (req, res) => {
  try {
    const { mentorId, userId } = req.body;
    
    // Check if mentor exists and is actually a mentor
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ 
        valid: false, 
        message: "Mentor not found" 
      });
    }
    
    if (mentor.role !== 'mentor') {
      return res.status(400).json({ 
        valid: false, 
        message: "Selected user is not a mentor" 
      });
    }
    
    // Check if mentor accepts messages
    if (mentor.chatDisabled) {
      return res.status(403).json({ 
        valid: false, 
        message: "This mentor is not accepting messages at this time" 
      });
    }
    
    res.json({ valid: true, mentor: mentor });
  } catch (error) {
    console.error("Error validating mentor:", error);
    res.status(500).json({ 
      valid: false, 
      message: "Server error during validation" 
    });
  }
});

// --- Create HTTP server for Socket.IO ---
const server = http.createServer(app);
// In your server.js, update Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Add this line
});

// --- Socket.IO Private Chat - ENHANCED ---
io.on("connection", (socket) => {
  console.log(`✅ User connected via WebSocket: ${socket.id}`);

  // Join user to their private room
  socket.on("join_user_room", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${socket.id} joined room: ${userId}`);
  });

  // Handle private messages with validation
  socket.on("private_message", async (data) => {
    try {
      // Validate that both sender and receiver exist
      const [sender, receiver] = await Promise.all([
        User.findById(data.sender),
        User.findById(data.receiver)
      ]);
      
      if (!sender || !receiver) {
        socket.emit("message_error", {
          error: "Invalid contact selected!",
          message: "The user you're trying to message doesn't exist."
        });
        return;
      }
      
      // Check if receiver is a mentor and accepts messages
      if (receiver.role === 'mentor' && receiver.chatDisabled) {
        socket.emit("message_error", {
          error: "Mentor not available",
          message: "This mentor is not accepting messages at this time."
        });
        return;
      }

      const newMessage = new Message({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
      });
      await newMessage.save();

      io.to(data.receiver).emit("receive_private_message", newMessage);
      console.log(`💬 Message sent from ${data.sender} to ${data.receiver}`);
    } catch (error) {
      console.error("❌ Error saving/sending private message:", error);
      socket.emit("message_error", {
        error: "Server error",
        message: "Failed to send message. Please try again."
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});
app.get('/api/messages/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 }).exec();
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// --- Start server ---
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// Add these debug endpoints to your server.js

// Check active Socket.IO connections
app.get('/api/debug/connections', (req, res) => {
  const rooms = io.sockets.adapter.rooms;
  const activeRooms = {};
  
  rooms.forEach((sockets, roomName) => {
    activeRooms[roomName] = Array.from(sockets);
  });
  
  res.json({
    activeConnections: io.engine.clientsCount,
    activeRooms: activeRooms
  });
});

// Check if a specific user is connected
app.get('/api/debug/user/:userId/connected', (req, res) => {
  const userId = req.params.userId;
  const room = io.sockets.adapter.rooms.get(userId);
  
  res.json({
    userId: userId,
    isConnected: !!room,
    connectionCount: room ? room.size : 0
  });
});