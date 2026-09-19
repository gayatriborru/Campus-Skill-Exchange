const Session = require('../models/Session');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { awardPoints, checkAndAwardBadges } = require('../services/gamificationService');

// @desc    Send a session request
// @route   POST /api/sessions
const createSession = async (req, res, next) => {
  try {
    const { teacher, skill, date, startTime, endTime, topic, notes, meetingLink } = req.body;

    // Learner is the authenticated user making the request
    const learnerId = req.user._id;

    if (teacher.toString() === learnerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request a skill session with yourself.',
      });
    }

    const session = await Session.create({
      teacher,
      learner: learnerId,
      skill,
      date: new Date(date),
      startTime,
      endTime,
      topic: topic || 'Skill Exchange & Hands-On Practice',
      notes: notes || '',
      meetingLink: meetingLink || 'https://meet.google.com/new',
      status: 'Pending',
    });

    // Notify teacher
    await Notification.create({
      recipient: teacher,
      sender: learnerId,
      type: 'SESSION_REQUEST',
      title: 'New Session Request 📅',
      message: `${req.user.name} sent you a learning request for a skill session.`,
      link: '/sessions',
    });

    const populated = await Session.findById(session._id)
      .populate('teacher', 'name profileImage department averageRating')
      .populate('learner', 'name profileImage department')
      .populate('skill', 'name category');

    return res.status(201).json({
      success: true,
      message: 'Session request sent successfully!',
      session: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's sessions (as teacher or learner)
// @route   GET /api/sessions
const getSessions = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const userId = req.user._id;

    const query = {
      $or: [{ teacher: userId }, { learner: userId }],
    };

    if (status && status !== 'All') {
      if (status === 'Upcoming') {
        query.status = { $in: ['Accepted', 'Scheduled'] };
        query.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
      } else {
        query.status = status;
      }
    }

    if (role === 'teacher') {
      query.teacher = userId;
      delete query.$or;
    } else if (role === 'learner') {
      query.learner = userId;
      delete query.$or;
    }

    const sessions = await Session.find(query)
      .populate('teacher', 'name email profileImage department averageRating')
      .populate('learner', 'name email profileImage department averageRating')
      .populate('skill', 'name category')
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session status (Accept, Reject, Reschedule, Complete, Cancel)
// @route   PUT /api/sessions/:id
const updateSession = async (req, res, next) => {
  try {
    const { status, date, startTime, endTime, meetingLink, cancellationReason } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(req.params.id)
      .populate('teacher', 'name')
      .populate('learner', 'name');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Verify ownership
    const isTeacher = session.teacher._id.toString() === userId.toString();
    const isLearner = session.learner._id.toString() === userId.toString();

    if (!isTeacher && !isLearner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this session.',
      });
    }

    // Status transitions
    if (status) {
      // Only teacher can accept or reject
      if (['Accepted', 'Scheduled'].includes(status) && !isTeacher) {
        return res.status(403).json({
          success: false,
          message: 'Only the teacher can accept/confirm this session request.',
        });
      }

      session.status = status;

      // When completed: award gamification points
      if (status === 'Completed') {
        // Teacher receives teaching points (+75)
        await awardPoints(session.teacher._id, 75, 'Taught Session');
        await User.findByIdAndUpdate(session.teacher._id, {
          $inc: { completedSessionsCount: 1 },
        });

        // Learner receives learning points (+40)
        await awardPoints(session.learner._id, 40, 'Learned Skill');
        await User.findByIdAndUpdate(session.learner._id, {
          $inc: { completedSessionsCount: 1 },
        });

        // Check badges for both
        await checkAndAwardBadges(session.teacher._id);
        await checkAndAwardBadges(session.learner._id);

        // Notify learner to rate session
        await Notification.create({
          recipient: session.learner._id,
          sender: session.teacher._id,
          type: 'SESSION_COMPLETED',
          title: 'Session Completed 🎉',
          message: `Your session with ${session.teacher.name} has concluded. Please leave a rating!`,
          link: `/sessions`,
        });
      }

      // Notifications on accept / reject
      if (status === 'Accepted' || status === 'Scheduled') {
        await Notification.create({
          recipient: session.learner._id,
          sender: session.teacher._id,
          type: 'SESSION_ACCEPTED',
          title: 'Session Accepted! ✅',
          message: `${session.teacher.name} accepted your skill exchange session!`,
          link: '/sessions',
        });
      } else if (status === 'Rejected') {
        await Notification.create({
          recipient: session.learner._id,
          sender: session.teacher._id,
          type: 'SESSION_REJECTED',
          title: 'Session Update',
          message: `${session.teacher.name} was unable to accept your session request.`,
          link: '/sessions',
        });
      }
    }

    if (date) session.date = new Date(date);
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (meetingLink) session.meetingLink = meetingLink;
    if (cancellationReason) session.cancellationReason = cancellationReason;

    await session.save();

    const updated = await Session.findById(session._id)
      .populate('teacher', 'name profileImage department averageRating')
      .populate('learner', 'name profileImage department averageRating')
      .populate('skill', 'name category');

    return res.status(200).json({
      success: true,
      message: `Session updated successfully. Status: ${session.status}`,
      session: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  updateSession,
};
