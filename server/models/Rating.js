const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      unique: true, // One rating per completed session
      index: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillKnowledge: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    helpfulness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

ratingSchema.index({ teacher: 1, createdAt: -1 });

module.exports = mongoose.model('Rating', ratingSchema);
