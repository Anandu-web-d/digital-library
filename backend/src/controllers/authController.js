const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOTP, sendVerificationEmail } = require('../utils/emailService');

// OTP expiration time (10 minutes)
const OTP_EXPIRY_MINUTES = 10;

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Create user with verification OTP
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      emailVerificationOTP: otp,
      emailVerificationExpires: expiresAt,
    });

    if (user) {
      // Send verification email (non-blocking)
      sendVerificationEmail(email, otp, name).catch(err => {
        console.error('Failed to send verification email:', err);
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please verify your email.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          verificationStatus: user.verificationStatus,
          token: generateToken(user._id),
        },
        requiresVerification: true,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.loginHistory.push({
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });

    // Keep only last 10 login entries
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
        profileImage: user.profileImage,
        institution: user.institution,
        token: generateToken(user._id),
      },
      requiresVerification: !user.emailVerified,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('verificationId');

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
        profileImage: user.profileImage,
        institution: user.institution,
        department: user.department,
        position: user.position,
        biography: user.biography,
        orcidId: user.orcidId,
        googleScholarId: user.googleScholarId,
        linkedInProfile: user.linkedInProfile,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        notifications: user.notifications,
        savedDocuments: user.savedDocuments,
        profileComplete: user.profileComplete,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


