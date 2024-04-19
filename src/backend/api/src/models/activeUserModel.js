const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true},
  socketId: {type: String},
  status: {type: String},
});

const ActiveUser = mongoose.model('ActiveUser', userSchema);
module.exports = ActiveUser;



