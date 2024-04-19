
const User = require('../models/userModel');
const Conversation = require('../models/conversationModel');

const findOneUser = async (userId) => {
  return await User.findOne({ username: userId }).select(['username', 'verifed', 'socketId']);
}
const addUser = async (userId, socketId) => {
  try {
    let user = await User.findById(userId).select(['socketId']);;
    console.log(user)
    if (user) {
      user.socketId = socketId;
      user.save();
    }
  } catch (error) {
    console.log(error);
  }

}

const addMessage = async (from, to, text) => {
  try {

    if (!from || !to || !text) {
      throw new Error('Missing required fields: "from", "to", or "text"');
    }

    const participants = [from, to].sort();
    let conversation = await Conversation.findOne({ participants });
    // console.log(conversation)
    if (!conversation) {
      // If conversation doesn't exist, create a new one
      conversation = new Conversation({ participants, messages: [{ from, to, text }] });
    } else {
      conversation.messages.push({ from, to, text });
    }
    await conversation.save();
    // console.log('Message added to conversation:', conversation);
    return conversation;
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    throw error;
  }
}
const getConversation = async (from, to) => {
  try {
    const participants = [from, to].sort()
    const conversation = await Conversation.findOne({ participants });
    return conversation ? conversation.messages : [];
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    throw error;
  }
}


module.exports = {
  addUser,
  addMessage,
  getConversation,
  findOneUser,
}