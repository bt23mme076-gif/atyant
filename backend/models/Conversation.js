// backend/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Links to our User model
  }]
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;