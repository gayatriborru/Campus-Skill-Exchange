const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
      index: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Learner is required'],
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Session date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/new',
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      default: 'Skill Exchange & Practice Session',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    rated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ teacher: 1, learner: 1, status: 1 });
sessionSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
