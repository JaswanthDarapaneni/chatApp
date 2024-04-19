const { Server } = require('socket.io');
const { addUser, addMessage, findOneUser, getConversation } = require('../controllers/socketController')

const initiateSocket = (io) => {
    const server = new Server(io, { cors: { origin: ["http://localhost:8101"] } });
    server.setMaxListeners(2000);

    server.on('connection', async (socket) => {
        const { userId } = socket.handshake.query
        addUser(userId, socket.id);
        const currentUser = { userId, socketId: socket.id };
        socket.emit('currentUser', currentUser);
        socket.on('login', async (userId) => {
            addUser(userId, socket.id);
            const currentUser = { userId, socketId: socket.id };
            socket.emit('currentUser', currentUser);
        });

        socket.on("sendMessage", async ({ senderId, receverId, text }) => {
            const user = await findOneUser(receverId);
            if (user) {
                if (user.socketId) {
                    addMessage(senderId, receverId, text);
                    socket.to(user.socketId).emit("getMessage", { from: senderId, to: receverId, text: text });
                } else {
                    addMessage(senderId, receverId, text);
                }
            } else {
                console.log('Recipient not found');
                // Optionally handle recipient not found error
            }
        });
        socket.on('getConversation', async ({ from, to }) => {
            const conversation = await getConversation(from, to);
            socket.emit('conversation', conversation);
        });
        
        socket.on('disconnect', () => {
            // console.log(socket.id)
            console.log('disconnected')
            // // removeUser(socket.id);
            // // socket.emit("getUsers", getUser());
        });
    });
}
module.exports = initiateSocket;