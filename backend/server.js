import dotenv from 'dotenv';
dotenv.config();
// backend/server.js - COMPLETE FIXED VERSION
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import paymentRoutes from './routes/paymentRoutes.js';

// Import routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chatRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import askRoutes from './routes/askRoutes.js';

// Import models
import Feedback from './models/Feedback.js';
import Message from './models/Message.js';
import User from './models/User.js';
// import Contact from './models/Contact.js'; 

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://www.atyant.in",
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
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ask', askRoutes);

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

// --- Validate mentor endpoint ---
app.post("/api/validate-mentor", async (req, res) => {
  try {
    const { mentorId, userId } = req.body;
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ valid: false, message: "Mentor not found" });
    }
    if (mentor.role !== 'mentor') {
      return res.status(400).json({ valid: false, message: "Selected user is not a mentor" });
    }
    if (mentor.chatDisabled) {
      return res.status(403).json({ valid: false, message: "This mentor is not accepting messages at this time" });
    }
    res.json({ valid: true, mentor: mentor });
  } catch (error) {
    console.error("Error validating mentor:", error);
    res.status(500).json({ valid: false, message: "Server error during validation" });
  }
});

// --- Create HTTP server for Socket.IO ---
const server = http.createServer(app);

// --- Socket.IO Configuration ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.IO handlers (single connection block)
io.on("connection", (socket) => {
  console.log(`✅ User connected via WebSocket: ${socket.id}`);

  // Join user to their private room
  socket.on("join_user_room", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${socket.id} joined room: ${userId}`);
  });

  // ONLY ONE private_message handler with Resend logic
  socket.on("private_message", async (data) => {
    try {
      console.log("📩 Received message data:", data);

      // Validate required fields
      if (!data.sender || !data.receiver || !data.text) {
        socket.emit("message_error", {
          error: "Missing required fields",
          message: "Sender, receiver, and text content are required"
        });
        return;
      }
      
      // Validate that both users exist
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
      if (receiver.role === 'mentor' && receiver.chatDisabled) {
        socket.emit("message_error", {
          error: "Mentor not available",
          message: "This mentor is not accepting messages at this time."
        });
        return;
      }

      // Create and save the message
      const newMessage = new Message({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
      });
      await newMessage.save();
      console.log(`💾 Message saved to MongoDB: ${newMessage._id}`);

      // Populate message with user data for frontend
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username name email')
        .populate('receiver', 'username name email');

      // Prepare message for frontend
      const messageForFrontend = {
        _id: populatedMessage._id,
        sender: populatedMessage.sender._id,
        senderName: populatedMessage.sender.username || populatedMessage.sender.name,
        receiver: populatedMessage.receiver._id,
        receiverName: populatedMessage.receiver.username || populatedMessage.receiver.name,
        text: populatedMessage.text,
        createdAt: populatedMessage.createdAt
      };
       // --- CREDIT CHECK LOGIC WITH NOTIFICATION ---
    if (sender.role === 'user') {
      if (sender.messageCredits <= 0) {
        // If credits are zero, send an error signal and stop
        return socket.emit("insufficient_credits", { 
          message: "Your free message limit is over. Please buy credits to continue." 
        });
      }
      // If credits are available, subtract one
      sender.messageCredits -= 1;
      await sender.save();
    }
    // Send the real-time message to the receiver
    io.to(data.receiver).emit("receive_private_message", newMessage);


      // --- Real-time notification signal to receiver ---
      io.to(data.receiver).emit("chat_notification", {
        from: messageForFrontend.sender,
        fromName: messageForFrontend.senderName,
        message: messageForFrontend.text,
        timestamp: messageForFrontend.createdAt
      });

      io.to(data.receiver).emit("receive_private_message", messageForFrontend);
      io.to(data.sender).emit("receive_private_message", messageForFrontend);

      io.to(data.sender).emit("chat_update", {
        type: 'new_message',
        chatId: `${data.sender}-${data.receiver}`,
        messageId: newMessage._id,
        timestamp: new Date().toISOString()
      });

      io.to(data.receiver).emit("chat_update", {
        type: 'new_message',
        chatId: `${data.sender}-${data.receiver}`,
        messageId: newMessage._id,
        timestamp: new Date().toISOString()
      });

      console.log(`💬 Message successfully sent from ${data.sender} to ${data.receiver}`);

      // --- EMAIL NOTIFICATION LOGIC WITH RESEND ---
      await resend.emails.send({
        from: 'notification@atyant.in',
        to: receiver.email,
        subject: `New Message from ${sender.username}`,
        text: `You have a new message from ${sender.username}.\n\nMessage: "${data.text}"\n\nPlease log in to your Atyant account to reply.`,
        html: `<p>You have a new message from <strong>${sender.username}</strong>.</p><p>Message: <em>"${data.text}"</em></p><p>Please log in to your Atyant account to reply [https://www.atyant.in].</p>`
      });
      console.log(`📧 Email notification sent via Resend to ${receiver.email}`);

    } catch (error) {
      console.error("❌ Error saving/sending private message:", error);
      socket.emit("message_error", {
        error: "Server error",
        message: "Failed to send message. Please try again."
      });
    }
  });

  // Handle message delivery status
  socket.on("message_delivered", (data) => {
    console.log(`✓ Message delivered: ${data.messageId}`);
    io.to(data.sender).emit("message_status", {
      messageId: data.messageId,
      status: 'delivered',
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// --- Message History Endpoint - FIXED ---
app.get('/api/messages/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
      .populate('sender', 'username name')
      .populate('receiver', 'username name')
      .sort({ createdAt: 1 })
      .exec();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Debug Endpoints ---
app.get('/api/debug/connections', (req, res) => {
  const rooms = io.sockets.adapter.rooms;
  const activeRooms = {};

  rooms.forEach((sockets, roomName) => {
    if (roomName.length === 24) {
      activeRooms[roomName] = {
        socketCount: sockets.size,
        sockets: Array.from(sockets)
      };
    }
  });

  res.json({
    activeConnections: io.engine.clientsCount,
    activeRooms: activeRooms,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug/user/:userId/connected', (req, res) => {
  const userId = req.params.userId;
  const room = io.sockets.adapter.rooms.get(userId);

  res.json({
    userId: userId,
    isConnected: !!room,
    connectionCount: room ? room.size : 0,
    timestamp: new Date().toISOString()
  });
});

// Check message history for debugging
app.get('/api/debug/messages', async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'username name')
      .populate('receiver', 'username name')
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    res.json({
      count: messages.length,
      messages: messages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching debug messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: io.engine.clientsCount
  });
});

// --- Profile endpoint by username ---
app.get('/api/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await User.findOne({ username });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// --- Start server ---
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled with CORS for: ${allowedOrigins.join(', ')}`);
});
