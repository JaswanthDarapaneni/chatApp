
const express = require('express');
const { addOfflineMsg, getMessages, getPendingMessages } = require('../controllers/userController')
const { verifyToken } = require('../middlewares/authMiddleware');


const OfflineRoutes = express.Router();



OfflineRoutes.get('/messages', verifyToken, addOfflineMsg)
OfflineRoutes.get('/getMessages', verifyToken, getMessages)
// get pendingmsg data 
OfflineRoutes.get('/pendingMessage', verifyToken, getPendingMessages)

// verification



module.exports = { OfflineRoutes };