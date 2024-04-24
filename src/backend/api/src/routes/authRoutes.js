
const express = require('express');
const { loginUser, registerUser, verifyEmail } = require('../controllers/authController')
const { verifyToken } = require('../middlewares/authMiddleware')
const { getUserProfile } = require('../controllers/authController')

const authRoutes = express.Router();

authRoutes.post('/register', registerUser);
authRoutes.post('/login', loginUser);
authRoutes.get('/verifyToken', verifyToken, getUserProfile)
authRoutes.post('/verify-email', verifyEmail)

module.exports = { authRoutes };