const Rating = require('../models/Rating');
const Session = require('../models/Session');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { awardPoints, checkAndAwardBadges } = require('../services/gamificationService');

// @desc    Submit rating for a completed session
// @route   POST /api/ratings
const createRating = async (req, res, next) => {
  try {
    const { sessionId, skillKnowledge, communication, helpfulness, feedback } = req.body;
    const learnerId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (session.learner.toString() !== learnerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the learner of this session can submit a rating.',
      });
    }

    if (session.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Ratings can only be submitted for completed sessions.',
      });
    }

    const existingRating = await Rating.findOne({ session: sessionId });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this session.',
      });
    }

    // Compute overall rating (mean of the three 1-5 categories)
    const overallRating = Number(
      ((Number(skillKnowledge) + Number(communication) + Number(helpfulness)) / 3).toFixed(1)
    );

    const rating = await Rating.create({
      session: sessionId,
      teacher: session.teacher,
      learner: learnerId,
      skillKnowledge,
      communication,
      helpfulness,
      overallRating,
      feedback: feedback?.trim() || '',
    });

    // Mark session as rated
    session.rated = true;
    await session.save();

    // Recompute teacher's cumulative average rating directly from real MongoDB ratings
    const teacherRatings = await Rating.find({ teacher: session.teacher });
    const totalScore = teacherRatings.reduce((acc, r) => acc + Number(r.overallRating || 0), 0);
    const newAverage = teacherRatings.length > 0
      ? Number((totalScore / teacherRatings.length).toFixed(1))
      : 0;

    const updatedTeacher = await User.findByIdAndUpdate(
      session.teacher,
      {
        averageRating: newAverage,
        ratingsCount: teacherRatings.length,
      },
      { new: true }
    );

    // Bonus points for teacher if rating is 5 stars (+25 points)
    if (overallRating >= 4.8) {
      await awardPoints(session.teacher, 25, '5-Star Rating Bonus');
    }

    // Check teacher badges (e.g. Rating Threshold badges)
    await checkAndAwardBadges(session.teacher);

    // Notify teacher
    const notif = await Notification.create({
      recipient: session.teacher,
      sender: learnerId,
      type: 'RATING_RECEIVED',
      title: 'New Review Received! ⭐',
      message: `${req.user.name} gave you a ${overallRating}★ rating with feedback.`,
      link: '/profile',
    });

    const io = req.app.get('io');
    if (io) {
      io.emitToUser?.(session.teacher, 'notification:receive', notif);
      io.emit('user:rating:updated', {
        userId: session.teacher.toString(),
        teacherId: session.teacher.toString(),
        averageRating: newAverage,
        ratingsCount: teacherRatings.length,
      });
      io.emit('stats:updated');
    }

    const populated = await Rating.findById(rating._id)
      .populate('teacher', 'name profileImage gender')
      .populate('learner', 'name profileImage department gender');

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your rating and feedback have been published.',
      rating: populated,
      teacherAverageRating: newAverage,
      teacherRatingsCount: teacherRatings.length,
      teacher: updatedTeacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ratings/reviews for a student
// @route   GET /api/ratings/:studentId
const getStudentRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ teacher: req.params.studentId })
      .populate('learner', 'name profileImage department year gender')
      .populate({
        path: 'session',
        populate: { path: 'skill', select: 'name' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRating,
  getStudentRatings,
};
