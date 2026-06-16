import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import path from 'path';
import passport from 'passport';

// ─── Routes ────────────────────────────────────────────────────────────────
import authRoutes          from './routes/auth.js';
import profileRoutes       from './routes/profileRoutes.js';
import feedbackRoutes      from './routes/feedbackRoutes.js';
import communityChatRoutes from './routes/communityChatRoutes.js';
import pushRoutes          from './routes/pushRoutes.js';
import notificationRoutes  from './routes/notificationRoutes.js';
import webinarRoutes       from './routes/webinar.js';

// ─── Models / utils ────────────────────────────────────────────────────────
import User from './models/User.js';
import { globalRateLimit } from './middleware/globalRateLimiter.js';

// ─── Passport Configuration ────────────────────────────────────────────────
import './config/passport.js';

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
const allowedOrigins = Array.from(new Set([
  'https://atyant.in',
  'https://www.atyant.in',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_WWW,
  process.env.DEV_URL
].filter(Boolean)));

console.log('🔒 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

app.options('*', cors());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https:', ...allowedOrigins.map(o => { try { return new URL(o).origin; } catch { return o; } })],
      styleSrc  : ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc   : ["'self'", 'https://fonts.gstatic.com'],
      imgSrc    : ["'self'", 'data:', 'https://res.cloudinary.com'],
      objectSrc : ["'none'"],
    }
  }
}));

app.use(cookieParser());
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
  .catch(err => { console.error('❌ MongoDB connection error:', err.message); process.exit(1); });

if (process.env.NODE_ENV === 'production') mongoose.set('debug', false);

// ─── Rate limiter ──────────────────────────────────────────────────────────
app.use('/api/', (req, res, next) => {
  if (req.path.startsWith('/community-chat')) return next();
  globalRateLimit(req, res, next);
});

// ─── Session & Passport (for Google OAuth) ─────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, touchAfter: 24 * 3600 }),
  cookie: {
    secure  : process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge  : 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/auth',               authRoutes);       // Google OAuth callbacks
app.use('/api/profile',        profileRoutes);
app.use('/api/feedback',       feedbackRoutes);
app.use('/api/community-chat', communityChatRoutes);
app.use('/api/push',           pushRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/webinar',        webinarRoutes);

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime(), memory: process.memoryUsage() });
});

// ─── Public profile by username ────────────────────────────────────────────
app.get('/api/profile/:username', async (req, res) => {
  try {
    const profile = await User.findOne({ username: req.params.username })
      .select('-password -passwordResetToken -passwordResetExpires -verificationToken')
      .lean();
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// ─── Contact form ──────────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'All fields required' });
    if (resend) {
      await resend.emails.send({
        from   : 'Atyant <notification@atyant.in>',
        to     : ['support@atyant.in'],
        subject: `Contact: ${name}`,
        text   : `From: ${name} <${email}>\n\n${message}`
      });
    }
    res.json({ message: "Message received. We'll get back to you soon!" });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
//  GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  await mongoose.connection.close();
  console.log('✅ MongoDB disconnected.');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// ─────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 CORS: ${allowedOrigins.join(', ')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
