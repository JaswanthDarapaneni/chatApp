const User = require('../models/userModel')
const ActiveUser = require('../models/activeUserModel')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../env/config');
const { sendVerificationEmail } = require('../middlewares/authMiddleware');

const getUserProfile = (req, res) => {
    res.json({ userId: req.body.userId });
};
const logout = (req, res)=>{

}
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = jwt.sign({ userId: user._id }, config.secretKey);
        if (token) {
            const activeUser = new ActiveUser({ userId: username, status: true });
            await activeUser.save();
        }
        return res.status(200).json({ token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to login' });
    }
};

const registerUser = async (req, res) => {
    const { username, password, email, number } = req.body;
    try {
        // Checkin the fields are Unique or not and 
        const existingUser = await User.findOne({ $or: [{ email }, { number }, { username }] }).select('-password -status')
        if (existingUser) {
            const existingFields = [];
            if (existingUser.email === email) {
                existingFields.push('email');
            }
            if (existingUser.number === parseInt(number)) {
                existingFields.push('number');
            }
            if (existingUser.username === username) {
                existingFields.push('username');
            }
            return res.status(400).json({ error: `${existingFields.join(', ')} is already registered` });
        } else {
            const verificationToken = await generateVerificationToken();
            req.body.verificationToken = verificationToken;
            if (req.body.verificationToken) {
                await sendVerificationEmail(req, res);
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = new User({ username, password: hashedPassword, email, number, verifed: false, verificationToken: verificationToken });
                await user.save();
            }
        }

    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: 'Failed to register user' });
    }
};

const generateVerificationToken = async () => {
    // Generate a random 6-digit number
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return randomNumber;
};

const verifyEmail = async (req, res) => {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        return res.status(401).json({ error: 'Invalid OTP' });
    }
    // Mark the user as verified in the database
    user.verifed = true;
    user.verificationToken = 0
    await user.save()
    res.status(200).json({ message: 'Verified Successfully' });
};

module.exports = { loginUser, registerUser, verifyEmail, getUserProfile,logout }