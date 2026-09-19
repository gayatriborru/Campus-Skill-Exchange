const { calculateSkillMatch } = require('../services/matchingService');
const User = require('../models/User');

// @desc    Get smart skill matches for logged in user
// @route   GET /api/matches
const getMatches = async (req, res, next) => {
  try {
    const { department, year, minRating, limit } = req.query;

    const matches = await calculateSkillMatch(req.user._id, {
      department,
      year,
      minRating,
      includeAll: req.query.includeAll === 'true',
    });

    const results = limit ? matches.slice(0, Number(limit)) : matches;

    return res.status(200).json({
      success: true,
      count: results.length,
      matches: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get match percentage & compatibility details with a specific student
// @route   GET /api/matches/:studentId
const getMatchWithStudent = async (req, res, next) => {
  try {
    const targetStudentId = req.params.studentId;
    const targetUser = await User.findById(targetStudentId);

    if (!targetUser || targetUser.isBlocked) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const allMatches = await calculateSkillMatch(req.user._id, { includeAll: true });
    const match = allMatches.find(
      (m) => m.student._id.toString() === targetStudentId
    );

    return res.status(200).json({
      success: true,
      match: match || {
        student: targetUser,
        matchPercentage: 40,
        isMutualMatch: false,
        reasons: ['Same campus community'],
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatches,
  getMatchWithStudent,
};
