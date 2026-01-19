const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'researcher', 'admin'],
    default: 'student',
  },

  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationOTP: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },

  // Password Reset
  passwordResetOTP: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },

  // Researcher Verification Status
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'under_review', 'verified', 'rejected'],
    default: 'unverified',
  },
  verificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearcherVerification',
  },

  // Enhanced Profile Fields
  profileImage: {
    type: String,
  },
  institution: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  biography: {
    type: String,
    maxLength: 500,
  },
  orcidId: {
    type: String,
    trim: true,
  },
  googleScholarId: {
    type: String,
    trim: true,
  },
  linkedInProfile: {
    type: String,
    trim: true,
  },

  // Social Links
  socialLinks: {
    twitter: String,
    github: String,
    website: String,
  },

  // Library Features
  savedDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  searchHistory: [{
    query: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],

  // Preferences
  preferences: {
    preferredCitationStyle: {
      type: String,
      enum: ['APA', 'MLA', 'Chicago'],
      default: 'APA',
    },
  },

  // Notification Settings
  notifications: {
    email: { type: Boolean, default: true },
    newDocuments: { type: Boolean, default: true },
    verificationUpdates: { type: Boolean, default: true },
  },

  // Security & Activity
  lastLoginAt: {
    type: Date,
  },
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  profileComplete: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if email verification OTP is valid
userSchema.methods.isEmailOTPValid = function (otp) {
  return this.emailVerificationOTP === otp &&
    this.emailVerificationExpires > Date.now();
};

// Check if password reset OTP is valid
userSchema.methods.isPasswordResetOTPValid = function (otp) {
  return this.passwordResetOTP === otp &&
    this.passwordResetExpires > Date.now();
};

module.exports = mongoose.model('User', userSchema);


