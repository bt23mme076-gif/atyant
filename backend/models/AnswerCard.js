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
    required: false
  },
  
  // Mentor who provided the experience (hidden from user)
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /**
   * 🚀 VECTOR SEARCH FIELD (ADDED)
   * Isme Python API se aaya hua 384-dimension array save hoga.
   * 'select: false' isliye taaki normal API calls mein ye data load na ho (performance).
   */
  embedding: {
    type: [Number],
    required: false, // Initial data migration ke waqt false rakhna sahi hai
    select: false    
  },
  
  // Transformed Answer Card content (in Atyant's voice)
  answerContent: {
    type: new mongoose.Schema({
      mainAnswer: String,
      situation: String,
      firstAttempt: String,
      keyMistakes: [Object],
      whatWorked: String,
      actionableSteps: [Object],
      timeline: String,
      differentApproach: String,
      additionalNotes: String
    }, { _id: false })
  },

  // Mentor audio answer (optional)
  audioUrl: {
    type: String,
    default: null
  },
  transcript: {
    type: String,
    default: null
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
  
  // Follow-up Q&A pairs
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
      type: new mongoose.Schema({
        mainAnswer: String,
        situation: String,
        firstAttempt: String,
        keyMistakes: [Object],
        whatWorked: String,
        actionableSteps: [Object],
        timeline: String,
        differentApproach: String,
        additionalNotes: String
      }, { _id: false })
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