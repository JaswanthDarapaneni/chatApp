const express = require('express');
const {addUser,addMessage,getUser,removeUser,conversations,users} = require('./handlers/userhandler.js');
const { Server } = require('socket.io');
const server = new Server({ cors: { origin: "http://localhost:8100" } });
server.setMaxListeners(200);

server.on('connection', (socket) => {
  console.log('User connected');

  socket.on('login', (username) => {
    addUser(username, socket.id);
    const currentUser = { username, socketId: socket.id };
    socket.emit('getUsers', users);
    socket.emit('currentUser', currentUser);
    console.log(`User ${username} logged in`);
  });

  socket.on("sendMessage", ({ senderId, receverId, text }) => {
    const user = getUser(receverId);
    if (user) {
      addMessage(senderId, receverId, text);
      socket.to(user.socketId).emit("getMessage", { from: senderId, to: receverId, text: text });
    } else {
      console.log('Recipient not found');
      // Optionally handle recipient not found error
    }
  });

  socket.on('getConversation', ({ from, to }) => {
    const key = [from, to].sort().join('_');
    const conversation = conversations[key] || [];
    socket.emit('conversation', conversation);
  });
  // Handle sending messages
  socket.on('message', ({ from, to, message }) => {
    if (to && users[to]) {
      console.log('ImCalling');
      // Send message to a specific user
      socket.to(users[to].socketId).emit('message', { from, to, message });
      // Store the message in the conversation
      const key = [from, to].sort().join('_');
      if (!conversations[key]) {
        conversations[key] = [];
      }
      conversations[key].push({ from, to, message });
      console.log(conversations[key]);

      // Emit an event to notify the recipient
      if (to && users[to]) {
        io.to(users[to].socketId).emit('newMessage', { from });
      }
    } else {
      console.log('Recipient not found');
    }
  });


  socket.on('disconnect', () => {
    removeUser(socket.id);
    socket.emit("getUsers", users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
