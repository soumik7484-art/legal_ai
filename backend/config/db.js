const mongoose = require('mongoose');

let isUsingMock = false;

const connectDB = async () => {
    // Disable buffering globally immediately
    mongoose.set('bufferCommands', false);

    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/legal_guardian_angel';
        
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 3000, // 3 seconds timeout
            family: 4 // Force IPv4 to avoid slow DNS resolution
        });
        
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.warn('MongoDB connection failed. Switching to PERSISTENT JSON storage mode.');
        isUsingMock = true;
    }
};

const getIsUsingMock = () => isUsingMock;

module.exports = { connectDB, getIsUsingMock };
