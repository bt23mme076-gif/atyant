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

// --- NEW, MORE FLEXIBLE CORS CONFIGURATION ---
const allowedOrigins = [
  "https://atyant.vercel.app", 
  "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
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

io.on('connection', (socket) => {
  // Your socket logic here...
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});