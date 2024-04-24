const { Server } = require('socket.io');
const config = require("../env/config");
const { onConnectSocket, onLogin, onDisconnect, onUserOnline, onGetConversation, onSendMsg } = require('./socketfunctions')


const initiateSocket = (io) => {
    const server = new Server(io, { cors: { origin: [config.crossOrigin] } });

  server.setMaxListeners(2000);
    server.on('connection', async (socket) => {
        const userId = await onConnectSocket(socket);
        socket.on('login', (userId) => onLogin(socket, userId));
        socket.on('user-online', (userId) => onUserOnline(socket, userId));
        socket.on('getConversation', ({ from, to }) => onGetConversation(socket, from, to));
        socket.on('sendMessage', ({ senderId, receverId, text }) => onSendMsg(socket, senderId, receverId, text));
        socket.on('disconnect', () => onDisconnect(userId));
    });
}
module.exports = initiateSocket;