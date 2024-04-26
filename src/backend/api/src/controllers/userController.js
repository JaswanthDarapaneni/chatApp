const User = require('../models/userModel');
const Conversation = require('../models/conversationModel')

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
module.exports = {
  getUserProfile,
  userConversation,
  findManyUser,
  newUserCheck
};
