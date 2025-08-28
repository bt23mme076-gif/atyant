// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // THIS FIELD WAS MISSING
  role: { 
    type: String,
    enum: ['user', 'mentor'], // Role can only be 'user' or 'mentor'
    default: 'user'          // If no role is provided, it will be 'user'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;