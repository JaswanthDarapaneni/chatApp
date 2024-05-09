const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  isSended: { type: Boolean },
  isRecived: { type: Boolean },
  isSeen: { type: Boolean },
  timestamp: { type: Date, default: Date.now }
});


const conversationSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }], // Array of participant IDs
  messages: [messageSchema] // Array of messages
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
