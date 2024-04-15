const users = [];
const conversations = {};

const addUser = (userId, socketId) => {

    if (!users.some(user => user.userId === userId)) {
      users.push({ userId, socketId });
    }
  }
  
  const addMessage = (from, to, text) => {
    const key = [from, to].sort().join('_');
    if (!conversations[key]) {
      conversations[key] = [];
    }
    conversations[key].push({ from, to, text });
    console.log(conversations)
  }
  
  // const addMessage = (from, to, message) => {
  //   const key = [from, to].sort().join('_');
  //   if (!conversations[key]) {
  //     conversations[key] = [];
  //   }
  //   conversations[key].push({ from, to, message });
  // }
  
  const getUser = (userId) => {
    return users.find(user => user.userId === userId);
  }
  
  const removeUser = (socketId) => {
    const index = users.findIndex(user => user.socketId === socketId);
    if (index !== -1) {
      users.splice(index, 1);
    }
  }
module.exports= {
    getUser,
    removeUser,
    addUser,
    addMessage,
    users,
    conversations
}