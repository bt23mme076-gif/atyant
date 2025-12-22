import mongoose from 'mongoose';

const answerCardSchema = new mongoose.Schema({
  // Related question
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  
  // Related mentor experience (internal only)
  mentorExperienceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorExperience',
    required: true
  },
  
  // Mentor who provided the experience (hidden from user)
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Transformed Answer Card content (in Atyant's voice)
  answerContent: {
    // Main answer text
    mainAnswer: {
      type: String,
      required: true,
      maxlength: 3000
    },
    
    // Key mistakes to avoid (from failures)
    keyMistakes: [{
      type: String,
      maxlength: 300
    }],
    
    // Clear actionable steps
    actionableSteps: [{
      step: String,
      description: String
    }],
    
    // Timeline/expectations
    timeline: {
      type: String,
      maxlength: 500
    },
    
    // Real-world context
    realContext: {
      type: String,
      maxlength: 500
    }
  },
  
  // Trust message
  trustMessage: {
    type: String,
    default: "This answer is built from real experience, not AI-generated advice."
  },
  
  // Signature
  signature: {
    type: String,
    default: "— Atyant Expert Mentor"
  },
  
  // Follow-up questions allowed (max 2)
  followUpCount: {
    type: Number,
    default: 0,
    max: 2
  },
  
  // Follow-up Q&A pairs (stored in same card)
  followUpAnswers: [{
    questionText: {
      type: String,
      required: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answerContent: {
      mainAnswer: String,
      keyMistakes: [String],
      actionableSteps: [{
        step: String,
        description: String
      }],
      timeline: String,
      realContext: String
    },
    mentorExperienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorExperience'
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    answeredAt: {
      type: Date,
      default: null
    }
  }],
  
  // User feedback
  userFeedback: {
    helpful: {
      type: Boolean,
      default: null
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      maxlength: 500,
      default: ''
    }
  },
  
  // Metadata
  deliveredAt: {
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
answerCardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const AnswerCard = mongoose.model('AnswerCard', answerCardSchema);
export default AnswerCard;
