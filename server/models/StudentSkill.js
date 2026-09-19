const mongoose = require('mongoose');

const studentSkillSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['teach', 'learn'],
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent student from adding the exact same skill twice under the same type
studentSkillSchema.index({ student: 1, skill: 1, type: 1 }, { unique: true });
studentSkillSchema.index({ skill: 1, type: 1 });

module.exports = mongoose.model('StudentSkill', studentSkillSchema);
