const User = require('../models/User');
const StudentSkill = require('../models/StudentSkill');
const UserBadge = require('../models/UserBadge');
const generateToken = require('../utils/generateToken');

// @desc    Register new student
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, department, year, bio, profileImage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      year,
      bio: bio || 'Passionate student eager to share skills and learn from campus peers.',
      profileImage:
        profileImage ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      role: 'student',
      skillPoints: 50, // Welcome bonus points!
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Campus Skill Exchange.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role,
        skillPoints: user.skillPoints,
        averageRating: user.averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login student or admin
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'This account is suspended. Please contact the campus administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role,
        skillPoints: user.skillPoints,
        averageRating: user.averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const skills = await StudentSkill.find({ student: user._id }).populate('skill');
    const badges = await UserBadge.find({ user: user._id }).populate('badge');

    return res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        skillsTeach: skills.filter((s) => s.type === 'teach'),
        skillsLearn: skills.filter((s) => s.type === 'learn'),
        badges: badges.map((ub) => ({
          ...ub.badge.toObject(),
          earnedAt: ub.earnedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, bio, department, year, availability, profileImage, currentPassword, newPassword } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (department) user.department = department;
    if (year) user.year = year;
    if (availability) user.availability = availability;
    if (profileImage) user.profileImage = profileImage;

    // Optional password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password.',
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters.',
        });
      }
      user.password = newPassword;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        bio: user.bio,
        profileImage: user.profileImage,
        availability: user.availability,
        role: user.role,
        skillPoints: user.skillPoints,
        averageRating: user.averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
