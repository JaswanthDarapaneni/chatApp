const config = require('../env/config');
const { mongoose } = require('../server.config')
const connectDb = () => {
    mongoose.connect(config.databaseURL)
    const db = mongoose.connection;

    db.on('error', (error) => {
        console.error('MongoDB connection error:', error);
    });

    db.on('connected', () => {
        console.log('Connected to MongoDB');
    });

    db.on('disconnected', () => {
        console.log('Disconnected from MongoDB');
    });
}
module.exports = {
    connectDb
}