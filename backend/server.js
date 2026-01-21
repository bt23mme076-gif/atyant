import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression'; // ✅ ADDED
import mongoose from 'mongoose';
import { Resend } from 'resend';
import paymentRoutes from './routes/paymentRoutes.js';
import { sendAutoReply } from './controllers/messageController.js';

// Import routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chatRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import askRoutes from './routes/askRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import aiChatRoutes from './routes/aiChatRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import engineRoutes from './routes/engineRoutes.js'; // ✅ ATYANT ENGINE

// Import models
import Feedback from './models/Feedback.js';
import Message from './models/Message.js';
import User from './models/User.js';
import { moderator } from './utils/ContentModerator.js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
import path from 'path';
const PORT = process.env.PORT || 3000;

// Serve uploads directory for audio answers
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ PERFORMANCE: Enable Gzip Compression (70% size reduction)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balance between speed and compression
  threshold: 1024 // Only compress responses > 1KB
}));

// --- Middleware ---
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://www.atyant.in",
  "https://atyant.in",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ PERFORMANCE: Limit JSON payload size
app.use(express.json({ limit: '10mb' }));

// Cache control headers
app.use((req, res, next) => {
  // Cache images for 1 year
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Cache CSS/JS for 1 week
  else if (req.path.match(/\.(css|js)$/)) {
    res.set('Cache-Control', 'public, max-age=604800');
  }
  
  // Don't cache API responses
  else if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  next();
});

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI ||
  "mongodb+srv://atyantuser:qf5CWLbdoKKzQlpL@cluster0.vutlgpa.mongodb.net/atyant?retryWrites=true&w=majority";

// ✅ PERFORMANCE: Optimize MongoDB connection
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
})
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    // Don't exit, let app run without DB for debugging
  });

// ✅ PERFORMANCE: Disable mongoose debug in production
if (process.env.NODE_ENV === 'production') {
  mongoose.set('debug', false);
}

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payments', paymentRoutes); // Also register under /api/payments for payment status checks
app.use('/api/ask', askRoutes);
app.use('/api/mentor', mentorRoutes); // New route
app.use('/api/users', mentorRoutes); // Old route for backward compatibility
app.use('/api/location', locationRoutes);
app.use('/api/ai', aiChatRoutes);
app.use('/api/ratings', ratingRoutes);app.use('/api/engine', engineRoutes); // ✅ ATYANT ENGINE
console.log('✅ AI Chat routes registered at /api/ai/*');

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
const activeUsers = new Map();
const userSockets = new Map();
const pendingNotifications = new Map(); // ✅ Track sent notifications to prevent duplicates

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  // ✅ PERFORMANCE: Optimize Socket.IO settings
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
  perMessageDeflate: {
    threshold: 1024 // Compress messages > 1KB
  }
});

// Socket.IO handlers (existing logic)
io.on("connection", (socket) => {
  let currentUserId = null;

  socket.on("join_user_room", (userId) => {
    currentUserId = userId;
    socket.join(userId);
    userSockets.set(userId, socket.id);
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
  });

  socket.on("enter_chat", ({ partnerId }) => {
    if (currentUserId) {
      const userChats = activeUsers.get(currentUserId) || new Set();
      userChats.add(partnerId);
      activeUsers.set(currentUserId, userChats);
      
      // ✅ Clear notification flags when user opens chat
      const notifKey = `${partnerId}-${currentUserId}`;
      const emailNotifKey = `email-${partnerId}-${currentUserId}`;
      if (pendingNotifications.has(notifKey)) {
        pendingNotifications.delete(notifKey);
        console.log(`🔔 Cleared notification flag: ${notifKey}`);
      }
      if (pendingNotifications.has(emailNotifKey)) {
        pendingNotifications.delete(emailNotifKey);
        console.log(`📧 Cleared email notification flag: ${emailNotifKey}`);
      }
    }
  });

  socket.on("leave_chat", ({ partnerId }) => {
    if (currentUserId) {
      const userChats = activeUsers.get(currentUserId);
      if (userChats) {
        userChats.delete(partnerId);
      }
    }
  });

  // Single disconnect handler
  socket.on("disconnect", (reason) => {
    if (currentUserId) {
      userSockets.delete(currentUserId);
      activeUsers.delete(currentUserId);
    }
  });

  socket.on("private_message", async (data) => {
    try {
      if (!data.text) {
        socket.emit('message_error', {
          error: 'Message cannot be empty',
          timestamp: new Date()
        });
        return;
      }

      const validationResult = moderator.validateMessage(data.text);
      if (!validationResult.isValid) {
        socket.emit('message_error', {
          error: 'Message blocked: ' + validationResult.reason,
          timestamp: new Date()
        });
        return;
      }
      
      const cleanedText = moderator.clean(data.text);
      data.text = cleanedText;

      console.log("📩 Received message data:", data);

      if (!data.sender || !data.receiver || !data.text) {
        socket.emit("message_error", {
          error: "Missing required fields",
          message: "Sender, receiver, and text content are required"
        });
        return;
      }
      
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

      const newMessage = new Message({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
        status: 'sent',
        seen: false
      });
      await newMessage.save();
      console.log(`💾 Message saved to MongoDB: ${newMessage._id}`);

      // ✅ Check if this is first message and update totalChats for mentor
      const previousMessages = await Message.countDocuments({
        $or: [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender }
        ]
      });

      if (previousMessages === 1) {
        // This is the first message, increment totalChats for mentor
        if (receiver.role === 'mentor') {
          await User.findByIdAndUpdate(receiver._id, { $inc: { totalChats: 1 } });
          console.log(`📊 Incremented totalChats for mentor: ${receiver.username}`);
        } else if (sender.role === 'mentor') {
          await User.findByIdAndUpdate(sender._id, { $inc: { totalChats: 1 } });
          console.log(`📊 Incremented totalChats for mentor: ${sender.username}`);
        }
      }

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username name email profilePicture')
        .populate('receiver', 'username name email profilePicture');

      const messageForFrontend = {
        _id: populatedMessage._id,
        sender: populatedMessage.sender._id,
        senderName: populatedMessage.sender.username || populatedMessage.sender.name,
        senderAvatar: populatedMessage.sender.profilePicture,
        receiver: populatedMessage.receiver._id,
        receiverName: populatedMessage.receiver.username || populatedMessage.receiver.name,
        receiverAvatar: populatedMessage.receiver.profilePicture,
        text: populatedMessage.text,
        createdAt: populatedMessage.createdAt,
        status: populatedMessage.status || 'sent',
        seen: populatedMessage.seen || false,
        deliveredAt: populatedMessage.deliveredAt,
        readAt: populatedMessage.readAt,
        isAutoReply: false
      };

      if (sender.role === 'user') {
        if (sender.messageCredits <= 0) {
          return socket.emit("insufficient_credits", { 
            message: "Your free message limit is over. Please buy credits to continue." 
          });
        }
        sender.messageCredits -= 1;
        await sender.save();
        console.log(`💳 User ${sender.username} credits remaining: ${sender.messageCredits}`);
      }

      io.to(data.receiver).emit("receive_private_message", messageForFrontend);
      io.to(data.sender).emit("receive_private_message", messageForFrontend);

      // Check if receiver is online and mark as delivered
      const receiverSocketId = userSockets.get(data.receiver);
      if (receiverSocketId) {
        await Message.findByIdAndUpdate(newMessage._id, {
          status: 'delivered',
          deliveredAt: new Date()
        });
        
        // Emit delivery status to sender
        io.to(data.sender).emit("message_status_update", {
          messageId: newMessage._id,
          status: 'delivered',
          deliveredAt: new Date().toISOString()
        });
      }

      // ✅ Only send notification if user hasn't been notified yet for this conversation
      const notifKey = `${data.sender}-${data.receiver}`;
      if (!pendingNotifications.has(notifKey)) {
        io.to(data.receiver).emit("chat_notification", {
          from: messageForFrontend.sender,
          fromName: messageForFrontend.senderName,
          message: messageForFrontend.text,
          timestamp: messageForFrontend.createdAt
        });
        pendingNotifications.set(notifKey, true);
        console.log(`🔔 Socket notification sent (${notifKey})`);
      } else {
        console.log(`🔔 Socket notification skipped (already notified: ${notifKey})`);
      }

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

      if (sender.role === 'user' && receiver.role === 'mentor') {
        console.log('🤖 User messaged mentor, checking auto-reply conditions...');
        
        setTimeout(async () => {
          try {
            console.log('🤖 Attempting to send auto-reply...');
            
            const autoReplyMessage = await sendAutoReply(
              io, 
              data.sender, 
              data.receiver, 
              {
                username: receiver.username,
                profilePicture: receiver.profilePicture
              }
            );

            if (autoReplyMessage) {
              console.log('✅ Auto-reply sent successfully');
            } else {
              console.log('⚠️ Auto-reply not sent (not first message or already sent)');
            }
          } catch (autoReplyError) {
            console.error('❌ Error sending auto-reply:', autoReplyError);
          }
        }, 1500);
      }

      // ✅ Send email notification only once per conversation
      try {
        const receiverChats = activeUsers.get(data.receiver);
        const isReceiverActive = receiverChats && receiverChats.has(data.sender);
        const receiverSocketId = userSockets.get(data.receiver);
        const isReceiverOnline = !!receiverSocketId;
        
        const emailNotifKey = `email-${data.sender}-${data.receiver}`;
        
        if (!isReceiverActive && !isReceiverOnline && !pendingNotifications.has(emailNotifKey)) {
          await resend.emails.send({
            from: 'notification@atyant.in',
            to: receiver.email,
            subject: `New Message from ${sender.username}`,
            text: `You have a new message from ${sender.username}.\n\nMessage: "${data.text}"\n\nPlease log in to your Atyant account to reply.`,
            html: `<p>You have a new message from <strong>${sender.username}</strong>.</p><p>Message: <em>"${data.text}"</em></p><p>Please log in to your Atyant account to reply [https://www.atyant.in].</p>`
          });
          pendingNotifications.set(emailNotifKey, true);
          console.log(`📧 Email notification sent (${emailNotifKey})`);
        } else {
          const reason = isReceiverActive ? 'actively chatting' : isReceiverOnline ? 'online' : 'already notified';
          console.log(`📧 Email notification skipped - receiver is ${reason}`);
        }
      } catch (error) {
        console.error("❌ Error sending email notification:", error);
      }
    } catch (error) {
      console.error("❌ Error saving/sending private message:", error);
      socket.emit("message_error", {
        error: "Server error",
        message: "Failed to send message. Please try again."
      });
    }
  });

  socket.on("delete_message", async (data) => {
    try {
      const { messageId, userId } = data;
      const message = await Message.findById(messageId);

      if (message && message.sender.toString() === userId) {
        await Message.deleteOne({ _id: messageId });
        io.to(message.sender.toString()).emit("message_deleted", { messageId });
        io.to(message.receiver.toString()).emit("message_deleted", { messageId });
        console.log(`🗑️ Message ${messageId} deleted by user ${userId}`);
      }
    } catch (error) {
      console.error("❌ Error deleting message:", error);
    }
  });

  // Handle when user reads a message
  socket.on("message_read", async (data) => {
    try {
      const { messageId, sender, receiver } = data;
      
      // Update message status to read
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          status: 'read',
          seen: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (updatedMessage) {
        console.log(`✓✓ Message read: ${messageId}`);
        
        // Notify sender that message was read
        io.to(sender).emit("message_status_update", {
          messageId: messageId,
          status: 'read',
          seen: true,
          readAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
    }
  });

  socket.on("message_delivered", (data) => {
    io.to(data.sender).emit("message_status", {
      messageId: data.messageId,
      status: 'delivered',
      timestamp: new Date().toISOString()
    });
  });
});

// --- Message History Endpoint ---
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

// ✅ PERFORMANCE: Health Check Endpoint
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

export default server;

