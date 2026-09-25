const mongoose = require('mongoose');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Skill = require('../models/Skill');
const { sendSessionRequestEmail } = require('../services/emailService');
const { awardPoints, checkAndAwardBadges } = require('../services/gamificationService');

// @desc    Send a session request
// @route   POST /api/sessions
const createSession = async (req, res, next) => {
  try {
    const { teacher, skill, date, startTime, endTime, topic, notes, meetingLink } = req.body;

    // 1. Authenticate Requester (Learner is the authenticated user making the request)
    const learnerId = req.user._id;

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher / Mentor is required to request a session.',
      });
    }

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill is required to request a session.',
      });
    }

    // Prevent requesting a session with yourself
    if (teacher.toString() === learnerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request a skill session with yourself.',
      });
    }

    // 2. Validate Receiver in MongoDB
    if (!mongoose.Types.ObjectId.isValid(teacher)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID provided.',
      });
    }

    const receiverUser = await User.findById(teacher);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver student not found in platform directory.',
      });
    }

    // Validate Skill in MongoDB
    if (!mongoose.Types.ObjectId.isValid(skill)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID provided.',
      });
    }

    const skillDoc = await Skill.findById(skill);
    if (!skillDoc) {
      return res.status(404).json({
        success: false,
        message: 'Requested skill not found.',
      });
    }

    // Prevent duplicate pending requests for the same mentor and skill
    const existingPending = await Session.findOne({
      teacher: receiverUser._id,
      learner: learnerId,
      skill: skillDoc._id,
      status: 'Pending',
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'A pending session request already exists for this mentor and skill.',
      });
    }

    // Format date and time for notifications and email
    const sessionDate = date ? new Date(date) : new Date();
    const formattedDate = !isNaN(sessionDate.getTime())
      ? sessionDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : String(date);
    const formattedDateTime = `${formattedDate} (${startTime || '16:00'} - ${endTime || '17:00'})`;

    // 3. Create Session Request in MongoDB
    const session = await Session.create({
      teacher: receiverUser._id,
      learner: learnerId,
      skill: skillDoc._id,
      date: !isNaN(sessionDate.getTime()) ? sessionDate : new Date(),
      startTime: startTime || '16:00',
      endTime: endTime || '17:00',
      topic: topic?.trim() || `1:1 Mentorship in ${skillDoc.name}`,
      notes: notes?.trim() || '',
      meetingLink: meetingLink?.trim() || 'https://meet.google.com/new',
      status: 'Pending',
    });

    console.log(`[Session Controller] Session request created in MongoDB [ID: ${session._id}]: Requester=${req.user.name} -> Receiver=${receiverUser.name} (${receiverUser.email})`);

    // 4. Create Notification in MongoDB for Receiver
    let notification = null;
    try {
      notification = await Notification.create({
        recipient: receiverUser._id,
        sender: req.user._id,
        type: 'SESSION_REQUEST',
        title: 'New Session Request',
        message: `${req.user.name} requested a session with you for ${skillDoc.name}.`,
        link: '/sessions',
        relatedSession: session._id,
        read: false,
        metadata: {
          requesterName: req.user.name,
          receiverName: receiverUser.name,
          skillName: skillDoc.name,
          dateTime: formattedDateTime,
          notes: notes?.trim() || '',
          sessionId: session._id,
        },
      });
      console.log(`[Session Controller] In-app notification created in MongoDB [ID: ${notification._id}] for ${receiverUser.name}`);
    } catch (notifErr) {
      console.error('[Session Controller] In-app notification creation failed (session kept):', notifErr.message);
    }

    // 5. Send Email to Receiver's registered email via Nodemailer
    let emailResult = { success: false };
    try {
      emailResult = await sendSessionRequestEmail({
        receiverEmail: receiverUser.email,
        receiverName: receiverUser.name,
        requesterName: req.user.name,
        skillName: skillDoc.name,
        dateTime: formattedDateTime,
        message: notes?.trim() || topic?.trim() || 'Skill exchange session requested via SkillVerse.',
      });
    } catch (emailErr) {
      console.error('[Session Controller] Email delivery threw exception (session kept):', emailErr.message);
      emailResult = { success: false, error: emailErr.message };
    }

    // Populate session for real-time and client response
    const populated = await Session.findById(session._id)
      .populate('teacher', 'name email profileImage department averageRating ratingsCount')
      .populate('learner', 'name email profileImage department ratingsCount')
      .populate('skill', 'name category');

    // 6. Emit Real-Time Socket.IO notification to Receiver
    const io = req.app.get('io');
    if (io) {
      if (notification) {
        io.emitToUser?.(receiverUser._id, 'notification:receive', notification);
        io.emitToUser?.(receiverUser._id, 'new_session_request', {
          session: populated,
          notification,
        });
      }
      io.emitToUser?.(receiverUser._id, 'session:new', populated);
      io.emit('stats:updated');
      console.log(`[Session Controller] Emitted real-time socket events to user ${receiverUser._id}`);
    }

    // 7. Return success response with proper status message
    const responseMessage = emailResult.success
      ? 'Session request sent successfully.'
      : 'Session request created. Email notification could not be sent.';

    return res.status(201).json({
      success: true,
      message: responseMessage,
      emailSent: emailResult.success,
      session: populated,
      notificationId: notification?._id,
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
      .populate('teacher', 'name email profileImage department averageRating ratingsCount')
      .populate('learner', 'name email profileImage department averageRating ratingsCount')
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

// @desc    Update session status (Accept, Reject, Complete, Cancel)
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

    const io = req.app.get('io');

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
        const notif = await Notification.create({
          recipient: session.learner._id,
          sender: session.teacher._id,
          type: 'SESSION_COMPLETED',
          title: 'Session Completed 🎉',
          message: `Your session with ${session.teacher.name} has concluded. Please leave a rating!`,
          link: `/sessions`,
        });
        if (io) {
          io.emitToUser?.(session.learner._id, 'notification:receive', notif);
        }
      }

      // Notifications on accept / reject
      if (status === 'Accepted' || status === 'Scheduled') {
        const notif = await Notification.create({
          recipient: session.learner._id,
          sender: session.teacher._id,
          type: 'SESSION_ACCEPTED',
          title: 'Session Accepted! ✅',
          message: `${session.teacher.name} accepted your skill exchange session!`,
          link: '/sessions',
        });
        if (io) {
          io.emitToUser?.(session.learner._id, 'notification:receive', notif);
        }
      } else if (status === 'Rejected') {
        const notif = await Notification.create({
          recipient: session.learner._id,
          sender: session.teacher._id,
          type: 'SESSION_REJECTED',
          title: 'Session Update',
          message: `${session.teacher.name} was unable to accept your session request.`,
          link: '/sessions',
        });
        if (io) {
          io.emitToUser?.(session.learner._id, 'notification:receive', notif);
        }
      }
    }

    if (date) session.date = new Date(date);
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (meetingLink) session.meetingLink = meetingLink;
    if (cancellationReason) session.cancellationReason = cancellationReason;

    await session.save();

    const updated = await Session.findById(session._id)
      .populate('teacher', 'name profileImage department averageRating ratingsCount')
      .populate('learner', 'name profileImage department averageRating ratingsCount')
      .populate('skill', 'name category');

    // Real-time broadcast to both participants and update global stats
    if (io) {
      io.emitToUser?.(session.teacher._id, 'session:updated', updated);
      io.emitToUser?.(session.learner._id, 'session:updated', updated);
      io.emit('stats:updated');
    }

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
