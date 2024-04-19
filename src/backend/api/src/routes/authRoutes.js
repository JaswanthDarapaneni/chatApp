
const express = require('express');
const {  loginUser,registerUser } = require('../controllers/userController')


const authRoutes = express.Router();

authRoutes.post('/register', registerUser);
authRoutes.post('/login', loginUser);

module.exports = { authRoutes };