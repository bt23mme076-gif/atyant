import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  eventTitle: {
    type: String,
    required: true,
    trim: true,
  },
  eventDate: {
    type: String,
    required: true,
  },
  eventMode: {
    type: String,
    default: 'Online',
  },
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
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  college: {
    type: String,
    required: true,
    trim: true,
  },
  yearOfStudy: {
    type: String,
    trim: true,
    default: '',
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Prevent duplicate registrations per event
eventRegistrationSchema.index({ email: 1, eventId: 1 }, { unique: true });

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
export default EventRegistration;
