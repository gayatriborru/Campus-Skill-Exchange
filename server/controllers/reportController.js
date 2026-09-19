const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Submit report against a student
// @route   POST /api/reports
const createReport = async (req, res, next) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    const reporterId = req.user._id;

    if (reportedUserId.toString() === reporterId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself.' });
    }

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted. Campus safety moderators will review it promptly.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or Unblock a user
// @route   POST /api/reports/block
const toggleBlockUser = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    const user = await User.findById(req.user._id);

    const isAlreadyBlocked = user.blockedUsers.includes(targetUserId);

    if (isAlreadyBlocked) {
      user.blockedUsers = user.blockedUsers.filter(
        (id) => id.toString() !== targetUserId.toString()
      );
      await user.save();
      return res.status(200).json({ success: true, message: 'User unblocked successfully.' });
    } else {
      user.blockedUsers.push(targetUserId);
      await user.save();
      return res.status(200).json({ success: true, message: 'User blocked successfully.' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  toggleBlockUser,
};
