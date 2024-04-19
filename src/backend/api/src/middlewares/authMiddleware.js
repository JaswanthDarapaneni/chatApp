const jwt = require('jsonwebtoken');
const config = require('../env/config');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  jwt.verify(token, config.secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.body.userId = decoded.userId;
    next();
  });
};

const sendVerificationEmail = async (req, res) => {
  try {
    const verificationToken = req.body.verificationToken;

    if (verificationToken &&  config.email != req.body.email) {
      const emailconfig = {
        service: 'gmail',
        auth: {
          user: config.email,
          pass: config.password
        }
      };

      const transporter = nodemailer.createTransport(emailconfig);

      const MailGenerator = new Mailgen({
        theme: "default",
        product: {
          name: "ChitChat",
          link: 'https://mailgen.js/'
        }
      });

      const response = {
        body: {
          name: `Hi ${req.body.username}`,
          intro: "Your OTP has arrived!\n\n",
          intro:`Your OTP for account verification is:${verificationToken}"Please use this OTP to verify your account within 30 minutes.`,
          outro: "Your friends are waiting for you! Verify quickly."
        }
      };

      const mail = MailGenerator.generate(response);

      const message = {
        from: config.email,
        to: req.body.email,
        subject: "OTP Verification Code for Chitchat",
        html: mail
      };

      await transporter.sendMail(message);
      res.status(200).json({email:"Verification email sent successfully"});
    } else {
      res.status(400).send("Verification token is missing");
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send("Failed to send verification email");
  }
};

module.exports = { verifyToken, sendVerificationEmail };
