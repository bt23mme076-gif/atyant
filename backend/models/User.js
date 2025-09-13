// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'mentor'], default: 'user' },
  
  // --- NEW PROFILE FIELDS ---
  bio: { 
    type: String, 
    default: 'This is my bio!' 
  },
  expertise: [{ // An array of strings, mainly for mentors
    type: String 
  }],
  profilePicture: { 
    type: String, 
    default: '' // We'll use a placeholder on the frontend
  }
  
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;