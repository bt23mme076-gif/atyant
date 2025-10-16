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
  
  // ========== PROFILE FIELDS (All Optional) ==========
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null,
    maxlength: 500
  },
  city: {
    type: String,
    default: ''
  },
  
  // ========== SKILLS & EXPERTISE (All Optional) ==========
  skills: [{
    type: String,
    trim: true
  }],
  expertise: {
    type: [String],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  domainExperience: {
    type: [String],
    default: []
  },
  
  // ========== EDUCATION (Optional) ==========
  education: [{
    institution: { type: String },
    degree: { type: String },
    field: { type: String },
    year: { type: String }
  }],
  
  // ========== SOCIAL LINKS (Optional) ==========
  linkedinProfile: {
    type: String,
    default: ''
  },
  socialLinks: {
    type: Map,
    of: String,
    default: {}
  },
  
  // ========== VERIFICATION ==========
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  
  // ========== PASSWORD RESET ==========
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  
  // ========== MESSAGE CREDITS ==========
  messageCredits: {
    type: Number,
    default: 5
  }
  
}, { 
  timestamps: true 
});

// ========== INDEXES ==========
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

// ========== HELPER METHODS ==========
userSchema.methods.isProfileComplete = function() {
  const hasInterests = this.interests && this.interests.length > 0;
  const hasEducation = this.education && this.education.length > 0;
  const hasCity = this.city && this.city.trim() !== '';
  
  return hasInterests && hasEducation && hasCity;
};

userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    role: this.role,
    profilePicture: this.profilePicture,
    bio: this.bio,
    city: this.city,
    expertise: this.expertise,
    interests: this.interests,
    domainExperience: this.domainExperience,
    education: this.education,
    linkedinProfile: this.linkedinProfile,
    skills: this.skills,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;
