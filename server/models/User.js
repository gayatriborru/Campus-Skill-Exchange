const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid college email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: [
        'Computer Science & Engineering',
        'Information Technology',
        'Electronics & Communication',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Data Science & AI',
        'Design & Media',
        'Business Administration',
        'Other',
      ],
      default: 'Computer Science & Engineering',
    },
    year: {
      type: String,
      required: [true, 'College year is required'],
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'],
      default: '2nd Year',
    },
    bio: {
      type: String,
      trim: true,
      default: 'Passionate student eager to share skills and learn from campus peers.',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    skillPoints: {
      type: Number,
      default: 50, // Starting bonus points
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    completedSessionsCount: {
      type: Number,
      default: 0,
    },
    availability: {
      type: String,
      enum: ['Flexible', 'Weekdays', 'Weekends', 'Evenings'],
      default: 'Flexible',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Search indexes
userSchema.index({ name: 'text', department: 'text', bio: 'text' });
userSchema.index({ role: 1, isBlocked: 1, averageRating: -1 });

module.exports = mongoose.model('User', userSchema);
