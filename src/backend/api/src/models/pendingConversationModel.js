const mongoose = require('mongoose');
const User = require('./userModel');


const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const userSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String },
  socketId: { type: String }
});

const conversationSchema = new mongoose.Schema({
  userId: [{ type: String, required: true }], // Array of participant IDs
  user: [userSchema], // Reference to User model
  messages: [messageSchema] // Array of messages
});


const PendingConversation = mongoose.model('PendingConversation', conversationSchema);

module.exports = PendingConversation;
