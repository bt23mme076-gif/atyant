import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId, // Changed from String to ObjectId
    ref: 'User', // Reference to User model
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId, // Changed from String to ObjectId
    ref: 'User', // Reference to User model
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better query performance
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ createdAt: 1 });

const Message = mongoose.model('Message', MessageSchema);
export default Message;