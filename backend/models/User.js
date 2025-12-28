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
    lowercase: true
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
    institution: { type: String }, // College name matching ke liye
    degree: { type: String },
    field: { type: String },      // Branch matching ke liye
    year: { type: String },
    cgpa: { type: Number }        // 🚀 Matching logic ke liye zaroori
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

  // ========== LOCATION SCHEMA ==========
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: function() {
        // Only require type if coordinates exist
        return this.location && this.location.coordinates && this.location.coordinates.length === 2;
      }
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false, // ✅ Optional - no default
      validate: {
        validator: function(v) {
          // Allow empty/null or valid [lng, lat] array
          return !v || v.length === 0 || (Array.isArray(v) && v.length === 2 && !isNaN(v[0]) && !isNaN(v[1]));
        },
        message: 'Coordinates must be [longitude, latitude] with valid numbers'
      }
    },
    city: {
      type: String,
      default: null
    },
    state: {
      type: String,
      default: null
    },
    country: {
      type: String,
      default: 'India'
    },
    lastUpdated: {
      type: Date,
      default: null
    }
  },
  
  // ========== MENTOR SPECIFIC FIELDS ==========
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  acceptsCredits: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  
  // ========== MENTOR STATISTICS ==========
  profileViews: {
    type: Number,
    default: 0
  },
  totalChats: {
    type: Number,
    default: 0
  },
  
  // ========== MESSAGE CREDITS ==========
  messageCredits: {
    type: Number,
    default: 5
  }
  
}, { 
  timestamps: true 
});

// ✅ Sparse index - only indexes documents where coordinates exist
userSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

// Remove duplicate indexes if any:
// userSchema.index({ email: 1 }); // Remove if using unique: true in field definition
// userSchema.index({ username: 1 }); // Remove if using unique: true in field definition

const User = mongoose.model('User', userSchema);

export default User;
