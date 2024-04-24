
const User = require('../models/userModel');
const ActiveUser = require('../models/activeUserModel');
const Conversation = require('../models/conversationModel');
const PendingConversation = require('../models/pendingConversationModel');


const findOneUser = async (userId) => {
  return await User.findOne({ username: userId }).select(['username', 'verifed', 'socketId']);
}
const findActiveOneUser = async (userId) => {
  const activeUser = await ActiveUser.findOne({ userId: userId, status: true })
  if (!activeUser) return false;
  else return true;
}

const addActiveUser = async (userId, socketId) => {
  let exitingUser = await ActiveUser.findOne({ userId: userId });
  if (!exitingUser) {
    exitingUser = new ActiveUser({ userId: userId, socketId: socketId, status: true })
  } else {
    exitingUser.socketId = socketId;
    exitingUser.status = true;
  }
  await exitingUser.save();
}
const RemoveActiveUser = async (userId) => {
  let exitingUser = await ActiveUser.findOne({ userId: userId, status: true });
  if (exitingUser) {
    exitingUser.status = false;
    await exitingUser.save();
  }
}
const addUser = async (userId, socketId) => {
  try {
    let user = await User.findById(userId).select(['socketId']);;
    // console.log(user)
    if (user) {
      user.socketId = socketId;
      user.save();
    }
  } catch (error) {
    console.log(error);
  }

}
const addPendingMsg = async (userId, from, to, text) => {
  try {
    if (!userId || !from || !to || !text) {
      throw new Error('Missing required fields: "from", "to", or "text"');
    }

    let pendingConversation = await PendingConversation.findOne({ userId: userId });
    if (!pendingConversation) {
      pendingConversation = new PendingConversation({ userId, messages: [{ from, to, text }] });
    } else {
      pendingConversation.messages.push({ from, to, text });
    }
    await pendingConversation.save();
  } catch (error) {
    console.error('Error adding message to pendingConversation:', error);
    throw error;
  }
}
const getPendingConversation = async (userId) => {
  try {
    const pendingConversation = await PendingConversation.findOne({ UserId: userId });
    return pendingConversation ? pendingConversation.messages : [];
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    throw error;
  }
}
const RemovePendingMsg = async (userId) => {
  let exitingUser = await PendingConversation.findOneAndDelete({ userId: userId });
  if (exitingUser) console.log(' Pending msg deleted')
  else console.log('pending msg id not deleted someting wrong')
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
  addActiveUser,
  RemoveActiveUser,
  RemovePendingMsg,
  addMessage,
  getConversation,
  findOneUser,
  findActiveOneUser,
  getPendingConversation,
  addPendingMsg
}