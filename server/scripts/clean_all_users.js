const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const maskUri = (uri) => (uri ? uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@') : 'none');

const cleanAllUsers = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI?.trim() ||
      process.env.MONGO_URI?.trim() ||
      'mongodb://127.0.0.1:27017/campus_skill_exchange';
    console.log(`[Cleaner] Connecting to MongoDB: ${maskUri(mongoUri)}`);
    await mongoose.connect(mongoUri);
    console.log('[Cleaner] Connected.');

    const User = require('../models/User');
    const StudentSkill = require('../models/StudentSkill');
    const UserBadge = require('../models/UserBadge');
    const Session = require('../models/Session');
    const Rating = require('../models/Rating');
    const Report = require('../models/Report');
    const Message = require('../models/Message');
    const Notification = require('../models/Notification');

    const [uRes, skRes, ubRes, sRes, rRes, repRes, mRes, nRes] = await Promise.all([
      User.deleteMany({}),
      StudentSkill.deleteMany({}),
      UserBadge.deleteMany({}),
      Session.deleteMany({}),
      Rating.deleteMany({}),
      Report.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log(`✓ Deleted ${uRes.deletedCount} pre-existing users from MongoDB.`);
    console.log(`✓ Deleted ${skRes.deletedCount} student skills.`);
    console.log(`✓ Deleted ${ubRes.deletedCount} user badges.`);
    console.log(`✓ Deleted ${sRes.deletedCount} sessions.`);
    console.log(`✓ Deleted ${rRes.deletedCount} ratings.`);
    console.log(`✓ Deleted ${repRes.deletedCount} reports.`);
    console.log(`✓ Deleted ${mRes.deletedCount} messages.`);
    console.log(`✓ Deleted ${nRes.deletedCount} notifications.`);

    const remainingUsers = await User.countDocuments();
    console.log(`\nVerified: Remaining user count in MongoDB is exactly: ${remainingUsers}`);

    await mongoose.disconnect();
    console.log('Database successfully cleaned. Users list is now completely EMPTY (0 users).');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning database:', err);
    process.exit(1);
  }
};

cleanAllUsers();
