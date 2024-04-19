
const express = require('express');
const { loginUser, getUserProfile, userConversation, verifyEmail, registerUser, findManyUser } = require('../controllers/userController')
const { verifyToken } = require('../middlewares/authMiddleware');


const userRoutes = express.Router();

userRoutes.post('/register', registerUser);
userRoutes.post('/login', loginUser);
userRoutes.get('/profile', verifyToken, getUserProfile);

userRoutes.get('/getConversation', verifyToken, userConversation)
userRoutes.get('/findusers', verifyToken, findManyUser)
// verification
userRoutes.post('/verify-email', verifyEmail)


module.exports = { userRoutes };