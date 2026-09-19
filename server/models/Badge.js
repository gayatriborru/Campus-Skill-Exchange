const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'Award', // Lucide icon name
    },
    category: {
      type: String,
      enum: ['Teaching', 'Learning', 'Community', 'Excellence'],
      default: 'Community',
    },
    criteriaType: {
      type: String,
      enum: [
        'TEACH_COUNT',
        'LEARN_COUNT',
        'POINTS_THRESHOLD',
        'RATING_THRESHOLD',
        'SESSIONS_COUNT',
      ],
      required: true,
    },
    criteriaThreshold: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Badge', badgeSchema);
