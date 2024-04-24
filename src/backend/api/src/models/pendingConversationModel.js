const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});


const conversationSchema = new mongoose.Schema({
  userId: [{ type: String, required: true }], // Array of participant IDs
  messages: [messageSchema] // Array of messages
});


const PendingConversation = mongoose.model('PendingConversation', conversationSchema);

module.exports = PendingConversation;
