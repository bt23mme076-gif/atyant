// backend/server.js (Fully Updated for Private Chat)
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'https://atyant-43hmatjrd-nitins-projects-a657b35d.vercel.app', // tera Vercel frontend
  credentials: true
}));

// baki routes...



const http = require('http'); // Required for Socket.IO
const { Server } = require("socket.io"); // Required for Socket.IO
const cors = require('cors');
const mongoose = require('mongoose');

// Import your route files
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chatRoutes');

// Import your model files
const Contact = require('./models/Contact'); // Assuming you create this file
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app
const io = new Server(server, { // Initialize Socket.IO with the server
  cors: {
    origin: "http://localhost:5173", // Allow your frontend to connect
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = 'mongodb+srv://atyantuser:qf5CWLbdoKKzQlpL@cluster0.vutlgpa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));


// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes); // Use the new chat routes

// Contact form route (kept from before)
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


// --- Socket.IO Connection Logic for Private Chat ---
io.on('connection', (socket) => {
  console.log('✅ A user connected via WebSocket:', socket.id);

  // When a user logs in, they join a room with their own user ID
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined their private room: ${userId}`);
  });

  // When a private message is sent
  socket.on('private_message', async (data) => {
    // data should include: { sender, receiver, text }
    try {
      // Save the message to the database
      const newMessage = new Message({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text
      });
      await newMessage.save();

      // Send the message in real-time to the receiver's private room
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


// --- Start the Server ---
// IMPORTANT: Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});