const config = {
  secretKey: 'SuperManisMyhero',
  databaseURL: process.env.MONGODB_URL || 'mongodb://localhost:27017/chatapp',
  email: process.env.EMAIL_NAME || "jaswanth.d304@gmail.com",
  password: process.env.EMAIL_PASSWORD || "rgyt zlbe kudx ywex",
  url: process.env.URL || "http://localhost:8100"
};
module.exports = config;