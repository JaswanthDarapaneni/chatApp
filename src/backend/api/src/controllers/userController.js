const User = require('../models/userModel');
const Conversation = require('../models/conversationModel')
const ActiveUser = require('../models/activeUserModel')
const OfflinePendingConversation = require('../models/offlineConversationModel')
const pendingConversation = require('../models/pendingConversationModel')
const ReceivedSeenStatus = require('../models/receivedSeenStatusModel')




// const userConversation = async (req, res) => {
//   const { username } = req.query;
//   try {
//     const conversations = await Conversation.find({
//       $or: [{ from: username }, { to: username }],
//       participants: username
//     }).select('-messages');

//     const combinedParticipants = conversations.reduce((acc, curr) => {
//       acc.push(...curr.participants);
//       return acc;
//     }, []);
//     const filteredParticipants = combinedParticipants.filter(participant => participant !== username);
//     const fields = 'username socketId';
//     User.findMany(filteredParticipants, fields)
//       .then(users => {
//         if (users) {
//           return res.status(200).json({ user: users });
//         } else {
//           return res.status(200).json({ user: null });
//         }
//       })
//       .catch(error => {
//         res.status(500).json({ error: error })
//       });

//   } catch (error) {
//     res.status(500).json({ error: error })
//   }
// }
// const userConversation = async (req, res) => {
//   const { username } = req.query;
//   try {
//     const conversations = await Conversation.find({
//       $or: [{ from: username }, { to: username }],
//       participants: username
//     })

//     // console.log(conversations)

//     const combinedParticipants = conversations.reduce((acc, curr) => {
//       acc.push(...curr.participants);
//       return acc;
//     }, []);
//     const filteredParticipants = combinedParticipants.filter(participant => participant !== username);
//     const fields = 'username socketId';
//     User.findMany(filteredParticipants, fields)
//       .then(users => {
//         if (users) {
//           users.map(user => {
//             const userConversations = conversations.filter(conversation => {
//               if (conversation.participants.includes(user.username)) {
//                 console.log(' im calling')
//                 return { user: user.username, conversation: conversation };
//               }
//             });
//             console.log(userConversations)
//           })


//         } else {
//           return res.status(200).json({ user: null });
//         }
//       })
//       // User.findMany(filteredParticipants, fields)
//       //   .then(users => {
//       //     if (users) {
//       //       const response = users.map(user => {
//       //         const userConversations = conversations.filter(conversation => conversation.participants.includes(user.username));
//       //         return { user: user, conversations: userConversations };
//       //       });
//       //       return res.status(200).json(response);
//       //     } else {
//       //       return res.status(200).json([]);
//       //     }
//       //   })
//       .catch(error => {
//         console.log(error)
//         res.status(500).json({ error: error })
//       });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// };


const userConversation = async (req, res) => {
  const { username } = req.query;
  try {
    const conversations = await Conversation.find({
      $or: [{ from: username }, { to: username }],
      participants: username
    }).select('participants messages');

    const combinedParticipants = conversations.reduce((acc, curr) => {
      acc.push(...curr.participants);
      return acc;
    }, []);

    const filteredParticipants = [...new Set(combinedParticipants)].filter(participant => participant !== username);

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
    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ error: error });
  }
};


const getUserProfile = (req, res) => {
  res.json({ userId: req.body.userId });
};

const newUserCheck = async (req, res) => {
  const { search } = req.query;
  try {
    if (search) {
      console.log(search)
      const user = await User.findOne({ username: search }).select(['socketId', 'username'])
      console.log(user)
      if (user) {
        res.status(200).json({ user: user })
      } else {
        res.status(400).json({ user: null })
      }
    } else {
      res.status(400).json({ error: 'Check params' })
    }
  }
  catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Something went wrong' })
  }
}

const findManyUser = async (req, res) => {
  try {
    const { search } = req.query;
    const { userId } = req.body.userId;

    if (search != '') {
      const users = await User.find({
        $or: [
          { username: { $regex: `.*${search}.*`, $options: 'i' } },

        ],
        userId: userId
      }).select(['username', 'socketId']);
      res.status(200).json({ users });
    } else {
      res.status(200).json({ users: null });
    }
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// *************************************** //
const findOneUser = async (userId) => {
  return await User.findOne({ username: userId }).select(['username', 'verifed', 'socketId']);
}


// **** adding OfflineMsg **** //

const addOfflineMsg = async (req, res) => {
  try {
    const { messages } = req.query;
    const pendingMsgList = JSON.parse(messages);

    if (!messages || !Array.isArray(pendingMsgList)) {
      return res.status(400).json({ error: 'Required fields not found or invalid format', code: 400 });
    }

    for (const message of pendingMsgList) {
      await processOfflineMessage(message);
    }

    const uniqueIds = new Set();
    pendingMsgList.forEach(async (item) => uniqueIds.add(item.key._id));
    const ids = Array.from(uniqueIds);
    return res.status(200).json({ message: 'Offline pending messages added successfully', code: 200, ids: ids });
  } catch (error) {
    console.error('Error adding offline messages:', error);
    return res.status(500).json({ error: 'Internal server error', code: 500 });
  }
}

const processOfflineMessage = async (message) => {
  const sender = await findOneUser(message.from);
  const receiver = await findOneUser(message.to);

  if (!sender || !receiver) {
    throw new Error('Sender or receiver not found');
  }

  let offlineUserData = await OfflinePendingConversation.findOne({ receiverId: receiver._id });

  if (!offlineUserData) {
    offlineUserData = new OfflinePendingConversation({
      receiverId: receiver._id,
      data: [{ sender: sender, messages: [message] }]
    });
  } else {
    const existingSender = offlineUserData.data.find(item => item.sender?.username === sender.username);
    if (existingSender) {
      existingSender.messages.push(message);
    } else {
      offlineUserData.data.push({ sender: sender, messages: [message] });
    }
  }

  await offlineUserData.save();
}

const getMessages = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'UserId not found' });
  try {
    const offlineUserData = await OfflinePendingConversation.findOneAndUpdate(
      { receiverId: id },
      { $set: { 'data.$[].messages': [] } },
      { returnDocument: 'before' }
    );

    if (!offlineUserData) {
      return res.status(404).json({ message: 'Offline conversation data not found for the user', id });
    }

    if (offlineUserData.data[0].messages.length !== 0) {
      await updateTrakingOfMsg(offlineUserData, id);
      return res.status(200).json({ message: 'Messages cleared successfully', data: offlineUserData });
    } else {
      return res.status(200).json({ message: 'Messages cleared successfully', data: null });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error', code: 500 });
  }
}

const getPendingMessages = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'UserId not found' });
  try {
    const offlineUserData = await pendingConversation.findOneAndUpdate(
      { receiverId: id },
      { $set: { 'data.$[].messages': [] } },
      { returnDocument: 'before' }
    );
    if (!offlineUserData) {
      return res.status(404).json({ message: 'Pending conversation data not found for the user', id });
    }
    if (offlineUserData.data) {
      await updateTrakingOfMsg(offlineUserData, id);
      return res.status(200).json({ message: 'Messages cleared successfully', data: offlineUserData });
    } else {
      return res.status(200).json({ message: 'Messages cleared successfully', data: null });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error', code: 500 });
  }
}

const updateTrakingOfMsg = async (data, id) => {
  for (const item of data.data) {
    const { sender, messages } = item;
    const senderId = sender._id;

    const uniqueIds = messages.map((message) => message.uniqueId);
    const existingDocument = await ReceivedSeenStatus.findOne({ userId: sender._id });
    if (existingDocument) {
      const reciverExists = existingDocument.traking.some(traking => traking.reciver_id.toString() === id.toString());
      if (reciverExists) {
        await ReceivedSeenStatus.findOneAndUpdate(
          { userId: senderId, 'traking.reciver_id': id, 'traking.sender_id': senderId },
          { $set: { 'traking.$.unique': uniqueIds, 'traking.$.last_seen': new Date().toISOString() } },
          { upsert: true }
        );
      } else {
        await ReceivedSeenStatus.findOneAndUpdate(
          { userId: senderId },
          { $push: { 'traking': { reciver_id: id, sender_id: senderId, unique: uniqueIds, last_seen: new Date().toISOString() } } },
          { upsert: true }
        );
      }
    } else {
      await ReceivedSeenStatus.findOneAndUpdate(
        { userId: senderId },
        { $push: { 'traking': { reciver_id: id, sender_id: senderId, unique: uniqueIds, last_seen: new Date().toISOString() } } },
        { upsert: true }
      );
    }
  }
}


// *************************************** //
module.exports = {
  getUserProfile,
  userConversation,
  findManyUser,
  newUserCheck,
  addOfflineMsg,
  getMessages,
  getPendingMessages
};
