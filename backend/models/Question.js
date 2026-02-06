import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  // User who asked the question
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // NEW: Question title
  title: {
    type: String,
    required: false, // Not required for backward compatibility
    trim: true,
    minlength: 10,
    maxlength: 200,
    default: function() {
      // Default to first 50 chars of questionText if not provided
      return this.questionText ? this.questionText.substring(0, 50) : '';
    }
  },
  
  // Question text (main field)
  questionText: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  
  // NEW: Category
  category: {
    type: String,
    required: false, // Not required for backward compatibility
    enum: [
      'Academic & College Life',
      'Technical Skills',
      'Career Growth',
      'Personal Development',
      'Entrepreneurship'
    ],
    default: 'Career Growth'
  },
  
  // NEW: Reason for asking
  reason: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  
  // NEW: Quality score from AI check
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Keywords extracted from question
  keywords: [{
    type: String,
    trim: true
  }],
  
  // Selected mentor (internal - not shown to user)
  selectedMentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // NEW: Match percentage with selected mentor
  matchPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Mentor selection logic/reason (for internal tracking)
  selectionReason: {
    type: String,
    default: ''
  },
  
  // Status of the question
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'pending',
      'mentor_assigned',
      'awaiting_experience',
      'experience_submitted',
      'answer_generated',
      'delivered',
      'answered_instantly',
      'failed'
    ],
    default: 'draft'
  },
  
  // Answer Card ID (once generated)
  answerCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnswerCard',
    default: null
  },
  
  // Follow-up questions (max 2)
  followUpQuestions: [{
    questionText: String,
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    answerCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnswerCard'
    }
  }],
  
  // Track if this is a follow-up question
  isFollowUp: {
    type: Boolean,
    default: false
  },
  
  // Reference to parent question (if this is a follow-up)
  parentQuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  
  // Payment tracking
  isPaid: { 
    type: Boolean, 
    default: false 
  },
  paidMentorshipType: {
    type: String,
    enum: ['chat', 'video', 'roadmap', null],
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  
  // NEW: Edit tracking (5 minute edit window)
  lastEditedAt: {
    type: Date,
    default: null
  },
  
  isEditable: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// Virtual for 'description' - alias for questionText (for backward compatibility)
questionSchema.virtual('description').get(function() {
  return this.questionText;
}).set(function(value) {
  this.questionText = value;
});

// Method to check if question is editable (within 5 minutes of submission)
questionSchema.methods.checkEditable = function() {
  if (!this.createdAt) return false;
  const fiveMinutes = 5 * 60 * 1000;
  const timePassed = Date.now() - this.createdAt.getTime();
  return timePassed < fiveMinutes && this.status === 'submitted';
};

// Update isEditable and timestamp before save
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isNew) {
    this.isEditable = true;
  } else if (this.status !== 'draft') {
    this.isEditable = this.checkEditable();
  }
  
  next();
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
