const Badge = require('../models/Badge');

// @desc    Get all campus gamification badges
// @route   GET /api/badges
const getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ category: 1, name: 1 });
    return res.status(200).json({
      success: true,
      count: badges.length,
      badges,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBadges };
