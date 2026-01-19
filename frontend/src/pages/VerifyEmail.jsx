import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, refreshUser } = useAuth();

    const email = location.state?.email || user?.email;

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        // Countdown timer for resend
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
            setOtp(newOtp.slice(0, 6));
            // Focus last filled input or last input
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            toast.error('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-email', {
                email,
                otp: otpString,
            });

            if (response.data.success) {
                toast.success('Email verified successfully!');
                // Refresh user data
                if (refreshUser) {
                    await refreshUser();
                }
                // Redirect based on user role
                if (user?.role === 'researcher') {
                    navigate('/researcher-verification');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
            // Clear OTP on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            const response = await axios.post('/api/auth/resend-otp', { email });

            if (response.data.success) {
                toast.success('New verification code sent!');
                setCountdown(60); // 60 second cooldown
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();
            }
        } catch (error) {
            if (error.response?.data?.waitTime) {
                setCountdown(error.response.data.waitTime);
            }
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 animate-fade-in">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-black tracking-tight text-text-primary mb-2">
                        INTELLI<span className="text-text-muted">LIB</span>
                    </h1>
                    <div className="mt-6 bg-bg-card border-2 border-border-primary rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                        <span className="text-4xl">📧</span>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-text-primary">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-text-muted">
                        We've sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-text-primary">{email}</p>
                </div>

                {/* OTP Form */}
                <div className="bg-bg-card border-2 border-border-primary rounded-lg p-8 shadow-dark">
                    <form onSubmit={handleVerify} className="space-y-6">
                        {/* OTP Input Boxes */}
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-bg-secondary border-2 border-border-primary rounded-lg text-text-primary focus:border-text-primary focus:outline-none transition-all"
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="spinner h-5 w-5"></span>
                                    Verifying...
                                </span>
                            ) : (
                                'Verify Email'
                            )}
                        </button>
                    </form>

                    {/* Resend Section */}
                    <div className="mt-6 text-center">
                        <p className="text-text-muted text-sm mb-2">
                            Didn't receive the code?
                        </p>
                        {countdown > 0 ? (
                            <p className="text-text-dim text-sm">
                                Resend available in <span className="font-semibold text-text-primary">{countdown}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="text-accent-primary hover:text-accent-hover font-semibold transition-colors"
                            >
                                {resendLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-text-muted hover:text-text-primary transition-colors"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
