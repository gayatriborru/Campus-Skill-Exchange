const Session = require('../models/Session');
const StudentSkill = require('../models/StudentSkill');
const Rating = require('../models/Rating');
const User = require('../models/User');
const Skill = require('../models/Skill');

// @desc    Get public campus platform statistics (for homepage counters)
// @route   GET /api/analytics/platform-stats
const getPlatformStats = async (req, res, next) => {
  try {
    const activeStudents = await User.countDocuments({ role: 'student', isBlocked: false });
    const totalSkills = await Skill.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'Completed' });

    // Calculate real campus-wide average rating from student users who have received ratings
    const ratingAgg = await User.aggregate([
      { $match: { role: 'student', ratingsCount: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$averageRating' } } },
    ]);

    const averageRating = ratingAgg.length > 0 && ratingAgg[0].avgRating != null
      ? Number(ratingAgg[0].avgRating.toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        activeStudents,
        totalSkills,
        completedSessions,
        averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personal learning & teaching analytics
// @route   GET /api/analytics/me
const getMyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const skills = await StudentSkill.find({ student: userId }).populate('skill');
    const skillsTeachCount = skills.filter((s) => s.type === 'teach').length;
    const skillsLearnCount = skills.filter((s) => s.type === 'learn').length;

    const taughtSessions = await Session.find({ teacher: userId, status: 'Completed' });
    const learnedSessions = await Session.find({ learner: userId, status: 'Completed' });

    // Category breakdown
    const categoryMap = {};
    skills.forEach((sk) => {
      const cat = sk.skill?.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
    }));

    // Real monthly activity derived from actual sessions in MongoDB
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    [...taughtSessions, ...learnedSessions].forEach((s) => {
      const date = new Date(s.createdAt || s.date);
      const mName = months[date.getMonth()];
      if (!monthlyMap[mName]) {
        monthlyMap[mName] = { month: mName, teaching: 0, learning: 0 };
      }
      if (s.teacher.toString() === userId.toString()) {
        monthlyMap[mName].teaching += 1;
      } else {
        monthlyMap[mName].learning += 1;
      }
    });

    const monthlyActivity = Object.values(monthlyMap);

    // Ratings breakdown
    const ratings = await Rating.find({ teacher: userId });
    const ratingBreakdown = ratings.length > 0
      ? [
          { category: 'Knowledge', score: Number((ratings.reduce((a, b) => a + b.skillKnowledge, 0) / ratings.length).toFixed(1)) },
          { category: 'Communication', score: Number((ratings.reduce((a, b) => a + b.communication, 0) / ratings.length).toFixed(1)) },
          { category: 'Helpfulness', score: Number((ratings.reduce((a, b) => a + b.helpfulness, 0) / ratings.length).toFixed(1)) },
        ]
      : [];

    return res.status(200).json({
      success: true,
      data: {
        skillPoints: user.skillPoints || 0,
        averageRating: user.averageRating || 0,
        totalCompletedSessions: taughtSessions.length + learnedSessions.length,
        taughtSessionsCount: taughtSessions.length,
        learnedSessionsCount: learnedSessions.length,
        skillsTeachCount,
        skillsLearnCount,
        categoryDistribution,
        monthlyActivity,
        ratingBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlatformStats, getMyAnalytics };
