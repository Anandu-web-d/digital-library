const User = require('../models/User');
const { generateOTP, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// OTP expiration time (10 minutes)
const OTP_EXPIRY_MINUTES = 10;

// @desc    Send email verification OTP
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email',
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Save OTP to user
        user.emailVerificationOTP = otp;
        user.emailVerificationExpires = expiresAt;
        await user.save({ validateBeforeSave: false });

        // Send email
        await sendVerificationEmail(email, otp, user.name);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email',
            expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification code. Please try again.',
        });
    }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
        }

        const user = await User.findOne({ email })
            .select('+emailVerificationOTP +emailVerificationExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email',
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
        }

        // Check if OTP is valid
        if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code',
            });
        }

        // Check if OTP has expired
        if (user.emailVerificationExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.',
            });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailVerificationOTP = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            data: {
                emailVerified: true,
            },
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.',
        });
    }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        const user = await User.findOne({ email })
            .select('+emailVerificationExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email',
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
        }

        // Rate limiting: Check if last OTP was sent less than 1 minute ago
        if (user.emailVerificationExpires) {
            const timeSinceLastOTP = Date.now() - (user.emailVerificationExpires.getTime() - OTP_EXPIRY_MINUTES * 60 * 1000);
            if (timeSinceLastOTP < 60000) { // 1 minute
                const waitTime = Math.ceil((60000 - timeSinceLastOTP) / 1000);
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitTime} seconds before requesting a new code`,
                    waitTime,
                });
            }
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        user.emailVerificationOTP = otp;
        user.emailVerificationExpires = expiresAt;
        await user.save({ validateBeforeSave: false });

        await sendVerificationEmail(email, otp, user.name);

        res.status(200).json({
            success: true,
            message: 'New verification code sent to your email',
            expiresIn: OTP_EXPIRY_MINUTES * 60,
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code',
        });
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if email exists
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a reset code has been sent',
            });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        user.passwordResetOTP = otp;
        user.passwordResetExpires = expiresAt;
        await user.save({ validateBeforeSave: false });

        await sendPasswordResetEmail(email, otp, user.name);

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a reset code has been sent',
            expiresIn: OTP_EXPIRY_MINUTES * 60,
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request',
        });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        const user = await User.findOne({ email })
            .select('+passwordResetOTP +passwordResetExpires +password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
            });
        }

        if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset code',
            });
        }

        if (user.passwordResetExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Reset code has expired',
            });
        }

        user.password = newPassword;
        user.passwordResetOTP = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
        });
    }
};
