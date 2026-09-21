const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'SESSION_REQUEST',
        'SESSION_ACCEPTED',
        'SESSION_REJECTED',
        'SESSION_SCHEDULED',
        'SESSION_COMPLETED',
        'NEW_MESSAGE',
        'RATING_RECEIVED',
        'BADGE_EARNED',
        'SKILL_MATCH',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.virtual('isRead').get(function () {
  return this.read;
});

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
