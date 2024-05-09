const { Server } = require('socket.io');
const config = require("../env/config");
const { server } = require('../server.config')
const { informFriendsMsgRecived, informUsers, onConnectSocket, onLogin, onDisconnect, onUserOnline, onGetConversation, RemovePendingMsg, onSendMsg } = require('./socketfunctions')

const initiateSocket = (io) => {
    const server = new Server(io, {
        cors: { origin: [config.crossOrigin] },
        pingInterval: 250000,
        pingTimeout: 3000,
    });
    server.setMaxListeners(2000);
    server.on('connection', async (socket) => {
        const userId = await onConnectSocket(socket);
        socket.on('login', (userId) => onLogin(socket, userId));

        socket.on('user-online', async ({ UserId }) => await onUserOnline(socket, UserId))

        socket.on('getConversation', ({ from, to }) => onGetConversation(socket, from, to));
        // socket.on('sendMessage', ({ senderId, receverId, text }) => onSendMsg( socket, senderId, receverId, text));
        socket.on('sendMessage', async ({ uniqueId, senderId, receiverId, text }, callback) => {
            try {
                await onSendMsg(socket, uniqueId, senderId, receiverId, text, (success) => {
                    if (callback) {
                        callback(success);
                    }
                });
            } catch (error) {
                console.error('Error sending message:', error);
                if (callback) {
                    callback(false);
                }
            }
        });

        socket.on('inform_users_to_receive_msg', async ({ id }, callback) => {
            try {
                await informUsers(socket, id, (results) => {
                    callback(results);
                });
            } catch (e) {
                throw e;
            }
        });
        // socket.on('Im_got_msg_when_my_friend_offline', (friends) => )

        socket.on('Im_got_msg_when_my_friend_offline', ({ friends, userId }) => informFriendsMsgRecived(socket, friends, userId))

        socket.on('disconnect', async () => onDisconnect(userId));
    });


}

module.exports = initiateSocket;