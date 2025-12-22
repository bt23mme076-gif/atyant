import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  // User who asked the question
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Question text
  questionText: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
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
  
  // Mentor selection logic/reason (for internal tracking)
  selectionReason: {
    type: String,
    default: ''
  },
  
  // Status of the question
  status: {
    type: String,
    enum: ['pending', 'mentor_assigned', 'awaiting_experience', 'experience_submitted', 'answer_generated', 'delivered'],
    default: 'pending'
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
  
  // Metadata
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
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
