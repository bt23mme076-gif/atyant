import mongoose from 'mongoose';

const eventApplicationSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['Hackathon', 'Webinar', 'Workshop', 'Competition', 'Community Event'],
  },
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
    enum: ['Online', 'Offline', 'Hybrid'],
  },
  venue: {
    type: String,
    trim: true,
    default: '',
  },
  attendees: {
    type: Number,
    required: true,
    min: 1,
  },
  prize: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  // Organizer info
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  college: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const EventApplication = mongoose.model('EventApplication', eventApplicationSchema);
export default EventApplication;
