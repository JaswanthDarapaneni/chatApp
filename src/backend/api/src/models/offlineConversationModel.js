const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  isSended: { type: Boolean },
  isRecived: { type: Boolean },
  isSeen: { type: Boolean },
  uniqueId: { type: String },
  timestamp: { type: Date, default: Date.now }
});
const userSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String },
  socketId: { type: String }
});
const dataSchema = new mongoose.Schema({
  sender: { type: userSchema },
  messages: [messageSchema]
});


const conversationSchema = new mongoose.Schema({
  receiverId: { type: String, required: true }, // Array of participant IDs
  data: [dataSchema] // Array of messages
});


const OfflinePendingConversation = mongoose.model('OfflinePendingConversation', conversationSchema);

module.exports = OfflinePendingConversation;
