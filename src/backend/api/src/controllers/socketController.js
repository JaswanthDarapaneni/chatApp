
const User = require('../models/userModel');
const ActiveUser = require('../models/activeUserModel');
const Conversation = require('../models/conversationModel');
const PendingConversation = require('../models/pendingConversationModel');

const AsyncLock = require('async-lock');

const findOneUser = async (userId) => {
  return await User.findOne({ username: userId }).select(['username', 'verifed', 'socketId']);
}
const findOneSocketIdForUser = async (userId) => {
  return ActiveUser.findOne({ userId: userId, status: true });
}
const findManyActiveUsers = async (userIds) => {
  return ActiveUser.find({ userId: { $in: userIds }, status: true });
};
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
const GetActiveAllUser = async () => {
  return await ActiveUser.find({ status: true });
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

const addPendingMsg = async (sender, receiver, receiverId, message) => {
  const lock = new AsyncLock();
  try {
    // Check for missing required fields
    if (!sender || !receiver || !receiverId || !message || !message.from || !message.to || !message.text || !message.uniqueId) {
      throw new Error('Missing required fields: "sender", "receiver", "receiverId", "from", "to", or "text"');
    }

    await lock.acquire(receiverId, async () => {
      // Find or create pending conversation
      let pendingConversation = await PendingConversation.findOne({ receiverId: receiverId });
      if (!pendingConversation) {
        pendingConversation = new PendingConversation({
          receiverId: receiverId,
          data: [{ sender: sender, messages: [message] }]
        });
      } else {
        // Check if sender already exists in pending conversation
        const existingSender = pendingConversation.data.find(item => item.sender.username === message.from);
        if (existingSender) {
          existingSender.messages.push(message);
        } else {
          pendingConversation.data.push({ sender: sender, messages: [message] });
        }
      }

      // Save pending conversation
      await pendingConversation.save();
    })
  } catch (error) {
    console.error('Error adding message to pendingConversation:', error);
    throw error;
  }
}


const getPendingConversation = async (userId) => {
  try {
    const pendingConversation = await PendingConversation.findOne({ receiverId: userId });
    return pendingConversation ? pendingConversation : [];
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    throw error;
  }
}

const RemovePendingMsg = async (userId) => {
  setTimeout(async () => {
    try {
      const result = await PendingConversation.findOneAndUpdate(
        { receiverId: userId },
        { $set: { 'data.$[].messages': [] } },
        { returnDocument: 'before' }
      );
      if (result) {
        console.log('Pending msg data removed successfully');
      } else {
        console.log('No pending msg data found for the user');
      }
    } catch (error) {
      console.error('Error removing pending msg data:', error);
    }
  }, 2000);
}

const addMessage = async (message) => {
  try {
    // Validate the message object
    if (!message || !message.from || !message.to || !message.text) {
      throw new Error('Missing required fields: "from", "to", or "text"');
    }

    const participants = [message.from, message.to].sort();
    let conversation = await Conversation.findOne({ participants });
    if (!conversation) {
      // If conversation doesn't exist, create a new one
      conversation = new Conversation({
        participants: participants, messages: [message]
      });

    } else {
      conversation.messages.push(message);
    }

    await conversation.save();
    const addedMessage = conversation.messages[conversation.messages.length - 1]; // Get the last added message
    return addedMessage;
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    throw error;
  }
}

const getuserConversation = async (from, to) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ from: from }, { to: from }],
      participants: from
    }).select('participants messages');
    if (conversations) {
      const combinedParticipants = conversations.reduce((acc, curr) => {
        acc.push(...curr.participants);
        return acc;
      }, []);

      const filteredParticipants = [...new Set(combinedParticipants)].filter(participant => participant !== from);

      const users = await User.find({ username: { $in: filteredParticipants } }, 'username socketId');

      const response = users.map(user => {
        const userConversations = conversations.flatMap(conversation => {
          if (conversation.participants.includes(user.username)) {
            return conversation.messages;
          } else {
            return [];
          }
        });

        const responce = { user: user, conversations: userConversations }

        return responce;
      });
      return response;
    } else {
      return null;
    }
    // res.status(200).json(response);
  } catch (error) {
    // res.status(500).json({ error: error });
    console.error('Error retrieving conversation:', error);
  }
};
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
  GetActiveAllUser,
  getuserConversation,
  RemoveActiveUser,
  RemovePendingMsg,
  addMessage,
  getConversation,
  findOneUser,
  findActiveOneUser,
  getPendingConversation,
  addPendingMsg,
  findOneSocketIdForUser,
  findManyActiveUsers
}