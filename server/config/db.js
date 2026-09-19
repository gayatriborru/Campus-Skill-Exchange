const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_skill_exchange'
    );
    console.log(`[MongoDB] Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.error('Tip: Make sure MONGODB_URI in server/.env is valid and your IP is whitelisted in MongoDB Atlas.');
  }
};

module.exports = connectDB;
