const { findManyActiveUsers, addUser, addActiveUser, getuserConversation, RemovePendingMsg, findOneSocketIdForUser, RemoveActiveUser, findActiveOneUser, addMessage, findOneUser, GetActiveAllUser, getPendingConversation, addPendingMsg, addOfflinePendingMsg } = require('../controllers/socketController');
const { addOfflineSender } = require('../controllers/receivedSeenStatusController');
const ReceivedSeenStatus = require('../models/receivedSeenStatusModel')

const onConnectSocket = async (socket) => {
    const { userId } = socket.handshake.query
    console.log(`connectedusers: ${userId} + ${socket.id}`);
    await addActiveUser(userId, socket.id);
    const currentUser = { userId, socketId: socket.id };
    // await onUserOnline(socket, userId);
    socket.emit('currentUser', currentUser);
    return userId;
}
const onLogin = async (socket, userId) => {
    addUser(userId, socket.id);
    const currentUser = { userId, socketId: socket.id };
    socket.emit('currentUser', currentUser);
}

const onDisconnect = async (userId) => { await RemoveActiveUser(userId); console.log('disconnected') }
const onUserOnline = async (socket, userId) => {
    try {
        await addActiveUser(userId, socket.id);

        // Add user to active users
        const pendingMsg = await getPendingConversation(userId);
        if (!pendingMsg || !pendingMsg.data || pendingMsg.data != null || pendingMsg.data != undefined) return;
        // Emit pending messages to the user
        const senderList = pendingMsg.data;

        if (senderList && senderList.length > 0) {
            for (const sender of senderList) {
                const senderDetails = await findOneSocketIdForUser(sender.sender._id);
                if (!senderDetails) return;
                if (senderDetails) {
                    try {
                        await socket.to(senderDetails.socketId).timeout(1000).emitWithAck('messages-received', userId);
                    } catch (e) {
                        throw e
                    }
                } else {
                    await addOfflineSenderFunction(sender.sender._id);
                }
            }
        }

    } catch (error) {
        console.error('Error in onUserOnline:', error);
        // Handle error
    }
}

const addOfflineSenderFunction = async (userId) => {
    await addOfflineSender(userId);
}

const onGetConversation = async (socket, from, to) => {
    const conversation = await getuserConversation(from, to);
    socket.emit('conversation', conversation);
}
const onSendMsg = async (socket, uniqueId, senderId, receiverId, text, callback) => {
    try {
        // Find sender and receiver
        const sender = await findOneUser(senderId);
        const receiver = await findOneUser(receiverId);

        if (!receiver) {
            console.log('Recipient not found');
            callback(false);
            return;
        }

        // Prepare message
        const message = { uniqueId: uniqueId, from: senderId, to: receiverId, text: text, isSended: true, isRecived: false, isSeen: false };

        // Check if receiver has an active socket connection
        if (receiver.socketId && await findActiveOneUser(receiver.id)) {
            try {
                const ack = await socket.to(receiver.socketId).timeout(1000).emitWithAck('from_server');
                if (ack) {
                    console.log(`Sending message from ${senderId} to ${receiverId}`);
                    socket.to(receiver.socketId).emit("getMessage", { sender: sender, messages: [message], receiver: receiver });
                    callback(true);
                }
            } catch (e) {
                console.log("The receiver don't send responce")
                // Set to offline when active user not sent ack
                RemoveActiveUser(receiver.id)
                callback(false);
                await addPendingMsg(sender, receiver, receiver.id, message);
            }
        } else {
            console.log(`Receiver ${receiverId} is offline or has no active socket connection`);
            // Save message as pending for offline receiver
            await addPendingMsg(sender, receiver, receiver.id, message);

            callback(false);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        callback(false); // Call the callback with false to indicate failure
    }
}

// Api called sockets

const informUsers = async (socket, id, callback) => {
    if (!id) return;
    const results = [];
    const activeUser = await findOneSocketIdForUser(id);
    if (!activeUser) return callback(results);
    if (activeUser.socketId) {
        try {
            const status = await socket.to(activeUser.socketId).timeout(3000).emitWithAck('call_updates');
            if (status) {
                results.push({ success: true, sender: activeUser });
                console.log('Received acknowledgment from client');
            }
        } catch (e) {
            console.log('Error sending event to client:', e);
            throw e
        }
    }
    callback(results);
};

// Calling the get status of reciver deatils 

const informFriendsMsgRecived = async (socket, friends, userId) => {
    if (!userId) return;
    const reciverList = await ReceivedSeenStatus.find({ userId: userId });
    if (reciverList) {
        socket.emit('reciverList', reciverList);
    }
    if (friends) {
        for (const friend of friends) {
            const activeUser = await findOneSocketIdForUser(friend.sender._id);
            if (!activeUser) continue;
            if (activeUser.socketId) {
                try {
                    const track = { message: friend.messages, id: userId }
                    await socket.to(activeUser.socketId).emit('your_frined_got_msg_when_you_offline', track);
                } catch (e) {
                    console.log('Error sending event to client:', e);
                    throw e
                }
            }
        }
    } else {
        return;
    }
}

module.exports = {
    onConnectSocket,
    onLogin,
    onDisconnect,
    onUserOnline,
    onGetConversation,
    onSendMsg,
    addOfflineSenderFunction,
    RemovePendingMsg,
    // api calls
    informUsers,
    informFriendsMsgRecived
}