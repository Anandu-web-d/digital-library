const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const {
    sendEmailOTP,
    verifyEmailOTP,
    resendOTP,
    forgotPassword,
    resetPassword
} = require('../controllers/verificationController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Email verification routes
router.post('/send-otp', sendEmailOTP);
router.post('/verify-email', verifyEmailOTP);
router.post('/resend-otp', resendOTP);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;


