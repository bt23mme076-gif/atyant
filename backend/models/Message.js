import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {  // Changed from senderId to match your data
    type: String, 
    required: true 
  },
  receiver: {  // Changed from receiverId to match your data
    type: String, 
    required: true 
  },
  text: {  // Changed from message to match your data
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