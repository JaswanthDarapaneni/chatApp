
const express = require('express');
const {  getUserProfile, userConversation, findManyUser } = require('../controllers/userController')
const { verifyToken } = require('../middlewares/authMiddleware');


const userRoutes = express.Router();


userRoutes.get('/profile', verifyToken, getUserProfile);
userRoutes.get('/getConversation', verifyToken, userConversation)
userRoutes.get('/findusers', verifyToken, findManyUser)
// verification



module.exports = { userRoutes };