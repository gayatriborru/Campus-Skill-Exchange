const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      maxlength: [60, 'Skill name cannot exceed 60 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Programming',
        'Web Development',
        'Data & AI',
        'Design',
        'Media & Arts',
        'Business',
        'Communication',
        'Academics',
        'Other',
      ],
      default: 'Programming',
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    popularityCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

skillSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
