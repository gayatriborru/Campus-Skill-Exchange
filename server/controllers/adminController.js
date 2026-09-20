const User = require('../models/User');
const Skill = require('../models/Skill');
const Session = require('../models/Session');
const Report = require('../models/Report');
const StudentSkill = require('../models/StudentSkill');

// @desc    Get admin dashboard metrics & stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isBlocked: false });
    const suspendedStudents = await User.countDocuments({ role: 'student', isBlocked: true });

    const totalSkills = await Skill.countDocuments();
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'Completed' });
    const pendingSessions = await Session.countDocuments({ status: 'Pending' });
    const scheduledSessions = await Session.countDocuments({ status: { $in: ['Accepted', 'Scheduled'] } });

    const pendingReports = await Report.countDocuments({ status: 'pending' });

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        suspendedStudents,
        totalSkills,
        totalSessions,
        completedSessions,
        pendingSessions,
        scheduledSessions,
        pendingReports,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform visual analytics (Charts data for Recharts)
// @route   GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Department Breakdown
    const departmentAgg = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const departmentData = departmentAgg.map((d) => ({
      name: d._id || 'Other',
      students: d.count,
    }));

    // 2. Popular skills
    const popularSkills = await Skill.find()
      .sort({ popularityCount: -1 })
      .limit(8)
      .select('name popularityCount category');

    const skillsChartData = popularSkills.map((s) => ({
      name: s.name,
      count: s.popularityCount,
      category: s.category,
    }));

    // 3. Sessions status distribution
    const sessionStatusAgg = await Session.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const sessionStatusData = sessionStatusAgg.map((s) => ({
      name: s._id,
      value: s.count,
    }));

    // 4. Monthly session activity (aggregated from MongoDB)
    const allSessions = await Session.find().select('createdAt date status');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    allSessions.forEach((s) => {
      const d = new Date(s.createdAt || s.date);
      const m = months[d.getMonth()];
      if (!monthlyMap[m]) {
        monthlyMap[m] = { month: m, completed: 0, scheduled: 0 };
      }
      if (s.status === 'Completed') {
        monthlyMap[m].completed += 1;
      } else if (['Scheduled', 'Accepted'].includes(s.status)) {
        monthlyMap[m].scheduled += 1;
      }
    });
    const monthlySessions = Object.values(monthlyMap);

    return res.status(200).json({
      success: true,
      analytics: {
        departmentData,
        skillsChartData,
        sessionStatusData,
        monthlySessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with search & moderation actions
// @route   GET /api/admin/users
const getStudents = async (req, res, next) => {
  try {
    const { search, department, isBlocked } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    if (department && department !== 'All') query.department = department;
    if (isBlocked !== undefined && isBlocked !== '') query.isBlocked = isBlocked === 'true';

    const students = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle student suspension
// @route   PUT /api/admin/users/:id/status
const toggleStudentSuspension = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    student.isBlocked = !student.isBlocked;
    await student.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('stats:updated');
    }

    return res.status(200).json({
      success: true,
      message: `Student account ${student.isBlocked ? 'suspended' : 'activated'} successfully.`,
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get safety reports
// @route   GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email department')
      .populate('reportedUser', 'name email department isBlocked')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes, suspendUser } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;

    if (suspendUser && report.reportedUser) {
      await User.findByIdAndUpdate(report.reportedUser, { isBlocked: true });
    }

    await report.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('stats:updated');
    }

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getStudents,
  toggleStudentSuspension,
  getReports,
  updateReportStatus,
};
