import mongoose from 'mongoose';

const webinarRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  college: {
    type: String,
    required: [true, 'College name is required'],
    trim: true
  },
  yearOfStudy: {
    type: String,
    required: [true, 'Year of study is required'],
    trim: true
  },
  stream: {
    type: String,
    required: [true, 'Stream/Major is required'],
    trim: true
  },
  questions: {
    type: String,
    trim: true,
    default: ''
  },
  webinarId: {
    type: String,
    default: 'career-guidance-webinar-1',
    index: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent registering multiple times for the same webinar
webinarRegistrationSchema.index({ email: 1, webinarId: 1 }, { unique: true });

const WebinarRegistration = mongoose.model('WebinarRegistration', webinarRegistrationSchema);
export default WebinarRegistration;
