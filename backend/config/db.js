const mongoose = require('mongoose');
require('dotenv').config();

exports.connectDB = async () => {
    try{
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Connected to MongoDB');
    }catch(error){
        console.error("❌ MongoDB connection error:", error);
    }
}