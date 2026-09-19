const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Session = require('../models/Session');
const Notification = require('../models/Notification');

const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const existingUserBadges = await UserBadge.find({ user: userId });
  const earnedBadgeIds = existingUserBadges.map((b) => b.badge.toString());

  const allBadges = await Badge.find();
  const newlyAwarded = [];

  // Count teaching and learning sessions
  const taughtCount = await Session.countDocuments({
    teacher: userId,
    status: 'Completed',
  });
  const learnedCount = await Session.countDocuments({
    learner: userId,
    status: 'Completed',
  });
  const totalSessions = taughtCount + learnedCount;

  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge._id.toString())) continue;

    let qualifies = false;

    switch (badge.criteriaType) {
      case 'TEACH_COUNT':
        if (taughtCount >= badge.criteriaThreshold) qualifies = true;
        break;
      case 'LEARN_COUNT':
        if (learnedCount >= badge.criteriaThreshold) qualifies = true;
        break;
      case 'SESSIONS_COUNT':
        if (totalSessions >= badge.criteriaThreshold) qualifies = true;
        break;
      case 'POINTS_THRESHOLD':
        if (user.skillPoints >= badge.criteriaThreshold) qualifies = true;
        break;
      case 'RATING_THRESHOLD':
        if (user.ratingsCount >= 3 && user.averageRating >= badge.criteriaThreshold) {
          qualifies = true;
        }
        break;
      default:
        break;
    }

    if (qualifies) {
      await UserBadge.create({
        user: userId,
        badge: badge._id,
      });

      // Issue notification
      await Notification.create({
        recipient: userId,
        type: 'BADGE_EARNED',
        title: 'New Badge Unlocked! 🏆',
        message: `Congratulations! You unlocked the "${badge.name}" badge.`,
        link: '/profile',
      });

      newlyAwarded.push(badge);
    }
  }

  return newlyAwarded;
};

const awardPoints = async (userId, points, reason = 'Activity') => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { skillPoints: points } },
    { new: true }
  );

  // Check if new badges unlocked with points
  await checkAndAwardBadges(userId);
  return user;
};

module.exports = {
  checkAndAwardBadges,
  awardPoints,
};
