import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'mentor', 'admin'],
    default: 'user'
  },
  // Corrected skills property
  skills: [{
    type: String,
    trim: true
  }],
  expertise: {
    type: [String], // Ensure it's an array of strings
    default: []
  },
  profilePicture: {
    type: String,
    default: null // You can set a default image URL here
  },
  bio: {
    type: String,
    default: null,
    maxlength: 500
  },
  socialLinks: {
    type: Map,
    of: String,
    default: {}
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    unique: true
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
   messageCredits: {
    type: Number,
    default: 5 // Every new user gets 5 free message credits
  },
   linkedinProfile: {
    type: String,
    default: ''
  }
  
}, { timestamps: true });
// In backend/models/User.js, add:
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);
export default User;
