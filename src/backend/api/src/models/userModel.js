const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true},
  number: {type: Number, required: true, unique: true},
  username: { type: String, required: true, unique: true },
  socketId: {type: String},
  password: { type: String, required: true },
  status: {type: String},
  verifed: {type: Boolean},
  verificationToken: {type: Number}
});
userSchema.statics.findMany = async function (usernames,fields) {
  try {
    const users = await this.find({ username: { $in: usernames } }).select(fields);
    return users;
  } catch (error) {
    console.error('Error finding users:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;



