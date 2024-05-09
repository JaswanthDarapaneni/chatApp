const mongoose = require("mongoose")
const tarcking = new mongoose.Schema({
  reciver_id: { type: String },
  sender_id: { type: String },
  unique: { type: [String] },
  last_msg: { type: String },
  last_seen: { type: String }
});
const receivedSeenSchema = new mongoose.Schema({
  userId: { type: String },
  traking: [tarcking]
});


const ReceivedSeenStatus = mongoose.model('ReceivedSeenStatus', receivedSeenSchema);
module.exports = ReceivedSeenStatus;



