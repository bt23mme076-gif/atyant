import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import path from 'path';

// ─── Routes ────────────────────────────────────────────────────────────────
import authRoutes          from './routes/auth.js';
import chatRoutes          from './routes/chatRoutes.js';
import profileRoutes       from './routes/profileRoutes.js';
import feedbackRoutes      from './routes/feedbackRoutes.js';
import searchRoutes        from './routes/searchRoutes.js';
import askRoutes           from './routes/askRoutes.js';
import mentorRoutes        from './routes/mentorRoutes.js';
import locationRoutes      from './routes/locationRoutes.js';
import communityChatRoutes from './routes/communityChatRoutes.js';
import ratingRoutes        from './routes/ratingRoutes.js';
import engineRoutes        from './routes/engineRoutes.js';
import iimRoutes           from './routes/iimRoutes.js';
import adminRoutes         from './routes/adminRoutes.js';
import questionRoutes      from './routes/questionRoutes.js';
import paymentRoutes       from './routes/paymentRoutes.js';
import resumeRoutes        from './routes/resumeRoutes.js';

// ─── Models / utils ────────────────────────────────────────────────────────
import Message      from './models/Message.js';
import User         from './models/User.js';
import { moderator } from './utils/ContentModerator.js';
import { globalRateLimit } from './middleware/globalRateLimiter.js';
import { sendAutoReply }   from './controllers/messageController.js';

// ─────────────────────────────────────────────
//  APP SETUP
// ─────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Gzip
app.use(compression({
  filter   : (req, res) => req.headers['x-no-compression'] ? false : compression.filter(req, res),
  level    : 6,
  threshold: 1024
}));

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_WWW,
  process.env.DEV_URL || 'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin        : allowedOrigins,
  credentials   : true,
  methods        : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders : ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Cache-control headers
app.use((req, res, next) => {
  if      (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
  else if (req.path.match(/\.(css|js)$/))                    res.set('Cache-Control', 'public, max-age=604800');
  else if (req.path.startsWith('/api/'))                     res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// ─────────────────────────────────────────────
//  DATABASE
//  🔴 FIX: No hardcoded URI — must come from .env
// ─────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in environment variables. Server will not start.');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  maxPoolSize            : 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS        : 45000,
  connectTimeoutMS       : 30000,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

if (process.env.NODE_ENV === 'production') mongoose.set('debug', false);

// ─── Rate limiter ──────────────────────────────────────────────────────────
app.use('/api/', (req, res, next) => {
  if (req.path.startsWith('/community-chat')) return next();
  globalRateLimit(req, res, next);
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api',                 chatRoutes);
app.use('/api/feedback',        feedbackRoutes);
app.use('/api/profile',         profileRoutes);
app.use('/api/search',          searchRoutes);
app.use('/api/payment',         paymentRoutes);
app.use('/api/payments',        paymentRoutes);
// app.use('/api/resume',          resumeRoutes); // Removed duplicate
app.use('/api/ask',             askRoutes);
app.use('/api/mentor',          mentorRoutes);
app.use('/api/users',           mentorRoutes);   // backward compat
app.use('/api/location',        locationRoutes);
app.use('/api/community-chat',  communityChatRoutes);
app.use('/api/ratings',         ratingRoutes);
app.use('/api/engine',          engineRoutes);
app.use('/api/iim',             iimRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/questions',       questionRoutes);
app.use('/api/resume',          resumeRoutes);

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status     : 'OK',
    timestamp  : new Date().toISOString(),
    uptime     : process.uptime(),
    memory     : process.memoryUsage(),
    connections: io?.engine?.clientsCount || 0
  });
});

// ─── Profile by username ───────────────────────────────────────────────────
app.get('/api/profile/:username', async (req, res) => {
  try {
    const profile = await User.findOne({ username: req.params.username })
      .select('-password -passwordResetToken -passwordResetExpires -verificationToken')
      .lean();
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// ─── Validate mentor ───────────────────────────────────────────────────────
app.post('/api/validate-mentor', async (req, res) => {
  try {
    const { mentorId } = req.body;
    const mentor = await User.findById(mentorId).select('role username chatDisabled').lean();
    if (!mentor)                 return res.status(404).json({ valid: false, message: 'Mentor not found' });
    if (mentor.role !== 'mentor') return res.status(400).json({ valid: false, message: 'Not a mentor' });
    if (mentor.chatDisabled)      return res.status(403).json({ valid: false, message: 'Mentor not accepting messages' });
    res.json({ valid: true, mentor });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Server error' });
  }
});

// ─── Contact form ──────────────────────────────────────────────────────────
// 🔴 FIX: Contact model was used but never imported — using simple email via Resend instead
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields required' });
    }
    if (resend) {
      await resend.emails.send({
        from   : 'Atyant <notification@atyant.in>',
        to     : ['support@atyant.in'],
        subject: `Contact: ${name}`,
        text   : `From: ${name} <${email}>\n\n${message}`
      });
    }
    res.json({ message: 'Message received. We\'ll get back to you soon!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Debug endpoints (dev only) ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/connections', (req, res) => {
    const rooms      = io.sockets.adapter.rooms;
    const activeRooms = {};
    rooms.forEach((sockets, roomName) => {
      if (roomName.length === 24) {
        activeRooms[roomName] = { socketCount: sockets.size };
      }
    });
    res.json({ activeConnections: io.engine.clientsCount, activeRooms });
  });

  app.get('/api/debug/messages', async (req, res) => {
    try {
      const messages = await Message.find()
        .populate('sender receiver', 'username name')
        .sort({ createdAt: -1 }).limit(10).lean();
      res.json({ count: messages.length, messages });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// ─────────────────────────────────────────────
//  SOCKET.IO
// ─────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
  transports      : ['websocket', 'polling'],
  pingTimeout     : 60000,
  pingInterval    : 25000,
  maxHttpBufferSize: 1e6,
  perMessageDeflate: { threshold: 1024 }
});

// In-memory maps (per process)
const activeUsers          = new Map();
const userSockets          = new Map();
const pendingNotifications = new Map();

io.on('connection', socket => {
  let currentUserId = null;

  socket.on('join_user_room', userId => {
    currentUserId = userId;
    socket.join(userId);
    userSockets.set(userId, socket.id);
    if (!activeUsers.has(userId)) activeUsers.set(userId, new Set());
  });

  socket.on('enter_chat', ({ partnerId }) => {
    if (!currentUserId) return;
    const userChats = activeUsers.get(currentUserId) || new Set();
    userChats.add(partnerId);
    activeUsers.set(currentUserId, userChats);
    pendingNotifications.delete(`${partnerId}-${currentUserId}`);
    pendingNotifications.delete(`email-${partnerId}-${currentUserId}`);
  });

  socket.on('leave_chat', ({ partnerId }) => {
    if (!currentUserId) return;
    activeUsers.get(currentUserId)?.delete(partnerId);
  });

  socket.on('disconnect', () => {
    if (!currentUserId) return;
    userSockets.delete(currentUserId);
    activeUsers.delete(currentUserId);
  });

  socket.on('private_message', async data => {
    try {
      if (!data?.text) {
        return socket.emit('message_error', { error: 'Message cannot be empty' });
      }

      const validationResult = moderator.validateMessage(data.text);
      if (!validationResult.isValid) {
        return socket.emit('message_error', { error: 'Message blocked: ' + validationResult.reason });
      }

      data.text = moderator.clean(data.text);

      if (!data.sender || !data.receiver) {
        return socket.emit('message_error', { error: 'Missing sender or receiver' });
      }

      const [sender, receiver] = await Promise.all([
        User.findById(data.sender).lean(),
        User.findById(data.receiver).lean()
      ]);

      if (!sender || !receiver) {
        return socket.emit('message_error', { error: 'Invalid contact selected' });
      }
      if (receiver.role === 'mentor' && receiver.chatDisabled) {
        return socket.emit('message_error', { error: 'Mentor not accepting messages' });
      }
      if (sender.role === 'user' && (sender.messageCredits || 0) <= 0) {
        return socket.emit('insufficient_credits', { message: 'Your free message limit is over.' });
      }

      // Save message
      const newMessage = await Message.create({
        sender  : data.sender,
        receiver: data.receiver,
        text    : data.text,
        status  : 'sent',
        seen    : false
      });

      // Deduct credit (non-blocking)
      if (sender.role === 'user') {
        User.findByIdAndUpdate(sender._id, { $inc: { messageCredits: -1 } })
          .catch(err => console.error('Credit deduct failed:', err.message));
      }

      // First-message totalChats increment
      const msgCount = await Message.countDocuments({
        $or: [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender }
        ]
      });
      if (msgCount === 1) {
        const mentorId = receiver.role === 'mentor' ? receiver._id : sender.role === 'mentor' ? sender._id : null;
        if (mentorId) {
          User.findByIdAndUpdate(mentorId, { $inc: { totalChats: 1 } })
            .catch(err => console.error('totalChats increment failed:', err.message));
        }
      }

      const populated = await Message.findById(newMessage._id)
        .populate('sender receiver', 'username name email profilePicture')
        .lean();

      const msgForFrontend = {
        _id          : populated._id,
        sender       : populated.sender._id,
        senderName   : populated.sender.username || populated.sender.name,
        senderAvatar : populated.sender.profilePicture,
        receiver     : populated.receiver._id,
        receiverName : populated.receiver.username || populated.receiver.name,
        receiverAvatar: populated.receiver.profilePicture,
        text         : populated.text,
        createdAt    : populated.createdAt,
        status       : populated.status || 'sent',
        seen         : populated.seen || false,
        isAutoReply  : false
      };

      io.to(data.receiver).emit('receive_private_message', msgForFrontend);
      io.to(data.sender).emit('receive_private_message', msgForFrontend);

      // Delivery status
      if (userSockets.has(data.receiver)) {
        Message.findByIdAndUpdate(newMessage._id, { status: 'delivered', deliveredAt: new Date() })
          .catch(() => {});
        io.to(data.sender).emit('message_status_update', {
          messageId  : newMessage._id,
          status     : 'delivered',
          deliveredAt: new Date().toISOString()
        });
      }

      // Socket notification (once per conversation)
      const notifKey = `${data.sender}-${data.receiver}`;
      if (!pendingNotifications.has(notifKey)) {
        io.to(data.receiver).emit('chat_notification', {
          from     : msgForFrontend.sender,
          fromName : msgForFrontend.senderName,
          message  : msgForFrontend.text,
          timestamp: msgForFrontend.createdAt
        });
        pendingNotifications.set(notifKey, true);
      }

      io.to(data.sender).emit('chat_update', { type: 'new_message', messageId: newMessage._id });
      io.to(data.receiver).emit('chat_update', { type: 'new_message', messageId: newMessage._id });

      // Auto-reply for user → mentor
      if (sender.role === 'user' && receiver.role === 'mentor') {
        setTimeout(async () => {
          try {
            await sendAutoReply(io, data.sender, data.receiver, {
              username      : receiver.username,
              profilePicture: receiver.profilePicture
            });
          } catch (err) {
            console.error('Auto-reply error:', err.message);
          }
        }, 1500);
      }

      // Email notification (once, only if offline)
      const emailKey     = `email-${data.sender}-${data.receiver}`;
      const isActive     = activeUsers.get(data.receiver)?.has(data.sender);
      const isOnline     = userSockets.has(data.receiver);

      if (!isActive && !isOnline && !pendingNotifications.has(emailKey) && resend) {
        resend.emails.send({
          from   : 'notification@atyant.in',
          to     : receiver.email,
          subject: `New Message from ${sender.username}`,
          text   : `${sender.username}: "${data.text}"\n\nReply at ${allowedOrigins[0]}`
        })
          .then(() => pendingNotifications.set(emailKey, true))
          .catch(err => console.error('Email notification failed:', err.message));
      }

    } catch (error) {
      console.error('private_message error:', error);
      socket.emit('message_error', { error: 'Server error. Please try again.' });
    }
  });

  socket.on('delete_message', async ({ messageId, userId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (msg && msg.sender.toString() === userId) {
        await Message.deleteOne({ _id: messageId });
        io.to(msg.sender.toString()).emit('message_deleted', { messageId });
        io.to(msg.receiver.toString()).emit('message_deleted', { messageId });
      }
    } catch (err) {
      console.error('delete_message error:', err);
    }
  });

  socket.on('message_read', async ({ messageId, sender }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: 'read', seen: true, readAt: new Date() });
      io.to(sender).emit('message_status_update', {
        messageId,
        status : 'read',
        seen   : true,
        readAt : new Date().toISOString()
      });
    } catch (err) {
      console.error('message_read error:', err);
    }
  });

  socket.on('message_delivered', ({ messageId, sender }) => {
    io.to(sender).emit('message_status', { messageId, status: 'delivered', timestamp: new Date().toISOString() });
  });
});

// ─── Message history ───────────────────────────────────────────────────────
app.get('/api/messages/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
      .populate('sender receiver', 'username name')
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
//  GRACEFUL SHUTDOWN
//  🔴 FIX: Added — without this, PM2 restart leaves DB connections hanging
// ─────────────────────────────────────────────
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected. Server closed.');
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => { console.error('⚠️ Forced shutdown'); process.exit(1); }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// ─────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 CORS: ${allowedOrigins.join(', ')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default server;
