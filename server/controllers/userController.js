const User = require('../models/User');
const StudentSkill = require('../models/StudentSkill');
const UserBadge = require('../models/UserBadge');
const Rating = require('../models/Rating');

// @desc    Discover students with search and filters
// @route   GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { search, department, year, availability, minRating, skillId, sortBy } = req.query;

    const query = {
      isBlocked: false,
      role: 'student',
    };

    // Only exclude current user if explicitly requested (e.g. for matching)
    if (req.query.excludeSelf === 'true' && req.user) {
      query._id = { $ne: req.user._id };
      if (req.user.blockedUsers?.length) {
        query._id = { $nin: [req.user._id, ...req.user.blockedUsers] };
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { bio: regex }, { department: regex }];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (year && year !== 'All') {
      query.year = year;
    }

    if (availability && availability !== 'All') {
      query.availability = availability;
    }

    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Filter by specific skill
    if (skillId) {
      const studentIdsWithSkill = await StudentSkill.find({
        skill: skillId,
        type: 'teach',
      }).distinct('student');

      query._id = { $in: studentIdsWithSkill };
    }

    let sortOption = { averageRating: -1, completedSessionsCount: -1 };
    if (sortBy === 'rating') sortOption = { averageRating: -1 };
    if (sortBy === 'sessions') sortOption = { completedSessionsCount: -1 };
    if (sortBy === 'points') sortOption = { skillPoints: -1 };
    if (sortBy === 'newest') sortOption = { createdAt: -1 };

    // Explicitly exclude passwords for security
    const students = await User.find(query).select('-password').sort(sortOption).limit(50);

    // Populate skills for each student
    const studentList = await Promise.all(
      students.map(async (st) => {
        const skills = await StudentSkill.find({ student: st._id }).populate('skill');
        const badges = await UserBadge.find({ user: st._id }).populate('badge');
        return {
          ...st.toObject(),
          skillsTeach: skills.filter((s) => s.type === 'teach'),
          skillsLearn: skills.filter((s) => s.type === 'learn'),
          badges: badges.map((b) => b.badge),
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: studentList.length,
      users: studentList,
      students: studentList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student public profile
// @route   GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.isBlocked) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const skills = await StudentSkill.find({ student: student._id }).populate('skill');
    const badges = await UserBadge.find({ user: student._id }).populate('badge');
    const reviews = await Rating.find({ teacher: student._id })
      .populate('learner', 'name profileImage department')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      student: {
        ...student.toObject(),
        skillsTeach: skills.filter((s) => s.type === 'teach'),
        skillsLearn: skills.filter((s) => s.type === 'learn'),
        badges: badges.map((ub) => ({
          ...ub.badge.toObject(),
          earnedAt: ub.earnedAt,
        })),
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById };
