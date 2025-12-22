import mongoose from 'mongoose';

const mentorExperienceSchema = new mongoose.Schema({
  // Related question
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  
  // Mentor who provided the experience
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Raw experience input from mentor
  rawExperience: {
    // When I was in this situation
    situation: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    // What I tried first
    firstAttempt: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    // What failed
    failures: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    // What worked
    whatWorked: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    // Step-by-step actions
    stepByStep: {
      type: String,
      required: true,
      maxlength: 2000
    },
    
    // Timeline / outcomes
    timeline: {
      type: String,
      required: true,
      maxlength: 500
    },
    
    // What I would do differently today
    wouldDoDifferently: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    // Additional context (optional)
    additionalNotes: {
      type: String,
      maxlength: 500,
      default: ''
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processed'],
    default: 'draft'
  },
  
  // Metadata
  submittedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
mentorExperienceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = Date.now();
  }
  next();
});

const MentorExperience = mongoose.model('MentorExperience', mentorExperienceSchema);
export default MentorExperience;
