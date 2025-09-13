import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  // --- MODIFICATION STARTS HERE ---
  // We've replaced createdAt with timestamps and added a status field
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  }
}, {
  // This automatically adds createdAt and updatedAt fields
  timestamps: true 
});
// --- MODIFICATION ENDS HERE ---


// Your indexes are a good practice and remain the same
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ createdAt: 1 });

const Message = mongoose.model('Message', MessageSchema);
export default Message;