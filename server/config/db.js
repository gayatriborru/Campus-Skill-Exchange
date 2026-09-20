const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_skill_exchange';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.error(
      'Tip: For production on Render, set MONGODB_URI in the Render Dashboard Environment Variables and whitelist 0.0.0.0/0 in MongoDB Atlas Network Access.'
    );
  }
};

module.exports = connectDB;
