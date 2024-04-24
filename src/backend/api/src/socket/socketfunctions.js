const { addUser, addActiveUser, RemovePendingMsg, RemoveActiveUser, findActiveOneUser, addMessage, findOneUser, getConversation, getPendingConversation, addPendingMsg } = require('../controllers/socketController')


const onConnectSocket = async (socket) => {
    const { userId } = socket.handshake.query
    console.log(`connectedusers: ${userId}`);
    addUser(userId, socket.id);
    // activeSockets.set(userId, socket.id)
    await addActiveUser(userId, socket.id)
    const currentUser = { userId, socketId: socket.id };
    socket.emit('currentUser', currentUser);
    return userId;
}
const onLogin = async (socket, userId) => {
    addUser(userId, socket.id);
    const currentUser = { userId, socketId: socket.id };
    socket.emit('currentUser', currentUser);
}
const onDisconnect = async (userId) => { await RemoveActiveUser(userId) }
const onUserOnline = async (socket, userId) => {
    console.log('User is online')
    const pendingMsg = await getPendingConversation(userId);
    socket.emit('pending-messages', pendingMsg);
    setTimeout(async () => {
        if (pendingMsg.length != 0) await RemovePendingMsg(userId);
    }, 2000)
}
const onGetConversation = async (socket, from, to) => {
    const conversation = await getConversation(from, to);
    socket.emit('conversation', conversation);
}
const onSendMsg = async (socket, senderId, receverId, text) => {
    const user = await findOneUser(receverId);
    if (user) {
        if (user.socketId) {
            if (await findActiveOneUser(user.id)) {
                addMessage(senderId, receverId, text);
                socket.to(user.socketId).emit("getMessage", { from: senderId, to: receverId, text: text });
            } else {
                await addMessage(senderId, receverId, text);
                await addPendingMsg(user.id, senderId, receverId, text);
            }
        } else {
            await addMessage(senderId, receverId, text);
        }
    } else {
        console.log('Recipient not found');
    }
}

module.exports = {
    onConnectSocket,
    onLogin,
    onDisconnect,
    onUserOnline,
    onGetConversation,
    onSendMsg
}