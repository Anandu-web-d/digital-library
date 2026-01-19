const ResearcherVerification = require('../models/ResearcherVerification');
const User = require('../models/User');
const { sendVerificationStatusEmail } = require('../utils/emailService');
const path = require('path');
const fs = require('fs');

// @desc    Submit researcher verification request
// @route   POST /api/verification/submit
// @access  Private
exports.submitVerification = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user already has a pending/approved verification
        const existingVerification = await ResearcherVerification.findOne({ user: userId });

        if (existingVerification) {
            if (existingVerification.status === 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'You are already verified as a researcher',
                });
            }
            if (existingVerification.status === 'pending' || existingVerification.status === 'under_review') {
                return res.status(400).json({
                    success: false,
                    message: 'You already have a pending verification request',
                });
            }
        }

        const {
            fullName,
            dateOfBirth,
            idType,
            idNumber,
            institution,
            department,
            position,
            researchAreas,
            orcidId,
            googleScholarId,
            linkedInProfile,
            personalWebsite,
        } = req.body;

        // Validate required fields
        if (!fullName || !idType || !idNumber || !institution) {
            return res.status(400).json({
                success: false,
                message: 'Full name, ID type, ID number, and institution are required',
            });
        }

        // Check for uploaded files
        if (!req.files || !req.files.idDocument || !req.files.profilePhoto) {
            return res.status(400).json({
                success: false,
                message: 'ID document and profile photo are required',
            });
        }

        const idDocumentPath = `/uploads/verification/${req.files.idDocument[0].filename}`;
        const profilePhotoPath = `/uploads/verification/${req.files.profilePhoto[0].filename}`;

        // Parse research areas if it's a string
        let parsedResearchAreas = researchAreas;
        if (typeof researchAreas === 'string') {
            try {
                parsedResearchAreas = JSON.parse(researchAreas);
            } catch {
                parsedResearchAreas = researchAreas.split(',').map(s => s.trim());
            }
        }

        // Create or update verification request
        let verification;
        if (existingVerification && existingVerification.status === 'rejected') {
            // Update rejected verification to pending
            existingVerification.status = 'pending';
            existingVerification.fullName = fullName;
            existingVerification.dateOfBirth = dateOfBirth;
            existingVerification.idType = idType;
            existingVerification.idNumber = idNumber;
            existingVerification.idDocument = idDocumentPath;
            existingVerification.profilePhoto = profilePhotoPath;
            existingVerification.institution = institution;
            existingVerification.department = department;
            existingVerification.position = position;
            existingVerification.researchAreas = parsedResearchAreas;
            existingVerification.orcidId = orcidId;
            existingVerification.googleScholarId = googleScholarId;
            existingVerification.linkedInProfile = linkedInProfile;
            existingVerification.personalWebsite = personalWebsite;
            existingVerification.submittedAt = new Date();
            existingVerification.rejectionReason = undefined;
            existingVerification.reviewNotes = undefined;

            verification = await existingVerification.save();
        } else {
            verification = await ResearcherVerification.create({
                user: userId,
                fullName,
                dateOfBirth,
                idType,
                idNumber,
                idDocument: idDocumentPath,
                profilePhoto: profilePhotoPath,
                institution,
                department,
                position,
                researchAreas: parsedResearchAreas,
                orcidId,
                googleScholarId,
                linkedInProfile,
                personalWebsite,
            });
        }

        // Update user verification status
        await User.findByIdAndUpdate(userId, {
            verificationStatus: 'pending',
            verificationId: verification._id,
        });

        res.status(201).json({
            success: true,
            message: 'Verification request submitted successfully',
            data: {
                id: verification._id,
                status: verification.status,
                submittedAt: verification.submittedAt,
            },
        });
    } catch (error) {
        console.error('Submit verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit verification request',
        });
    }
};

// @desc    Get own verification status
// @route   GET /api/verification/status
// @access  Private
exports.getVerificationStatus = async (req, res) => {
    try {
        const verification = await ResearcherVerification.findOne({ user: req.user.id });

        if (!verification) {
            return res.status(200).json({
                success: true,
                data: {
                    status: 'unverified',
                    message: 'No verification request found',
                },
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: verification._id,
                status: verification.status,
                submittedAt: verification.submittedAt,
                reviewedAt: verification.reviewedAt,
                rejectionReason: verification.status === 'rejected' ? verification.rejectionReason : undefined,
                institution: verification.institution,
                position: verification.position,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get pending verification requests (Admin)
// @route   GET /api/verification/pending
// @access  Private/Admin
exports.getPendingVerifications = async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 10 } = req.query;

        const query = {};
        if (status !== 'all') {
            query.status = status;
        }

        const verifications = await ResearcherVerification.find(query)
            .populate('user', 'name email role createdAt')
            .sort({ submittedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ResearcherVerification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: verifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single verification request (Admin)
// @route   GET /api/verification/:id
// @access  Private/Admin
exports.getVerification = async (req, res) => {
    try {
        const verification = await ResearcherVerification.findById(req.params.id)
            .populate('user', 'name email role createdAt emailVerified')
            .populate('reviewedBy', 'name email');

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found',
            });
        }

        res.status(200).json({
            success: true,
            data: verification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Approve researcher verification (Admin)
// @route   POST /api/verification/:id/approve
// @access  Private/Admin
exports.approveVerification = async (req, res) => {
    try {
        const { notes } = req.body;

        const verification = await ResearcherVerification.findById(req.params.id)
            .populate('user', 'name email');

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found',
            });
        }

        if (verification.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'This verification is already approved',
            });
        }

        // Update verification
        verification.status = 'approved';
        verification.reviewedBy = req.user.id;
        verification.reviewedAt = new Date();
        verification.reviewNotes = notes;
        await verification.save();

        // Update user
        await User.findByIdAndUpdate(verification.user._id, {
            verificationStatus: 'verified',
            role: 'researcher',
            institution: verification.institution,
            department: verification.department,
            position: verification.position,
            orcidId: verification.orcidId,
            googleScholarId: verification.googleScholarId,
            linkedInProfile: verification.linkedInProfile,
            profileImage: verification.profilePhoto,
        });

        // Send notification email
        if (verification.user.email) {
            sendVerificationStatusEmail(
                verification.user.email,
                verification.user.name,
                'approved'
            ).catch(err => console.error('Failed to send approval email:', err));
        }

        res.status(200).json({
            success: true,
            message: 'Researcher verification approved successfully',
            data: {
                id: verification._id,
                status: verification.status,
                reviewedAt: verification.reviewedAt,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Reject researcher verification (Admin)
// @route   POST /api/verification/:id/reject
// @access  Private/Admin
exports.rejectVerification = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required',
            });
        }

        const verification = await ResearcherVerification.findById(req.params.id)
            .populate('user', 'name email');

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found',
            });
        }

        // Update verification
        verification.status = 'rejected';
        verification.reviewedBy = req.user.id;
        verification.reviewedAt = new Date();
        verification.rejectionReason = reason;
        await verification.save();

        // Update user
        await User.findByIdAndUpdate(verification.user._id, {
            verificationStatus: 'rejected',
        });

        // Send notification email
        if (verification.user.email) {
            sendVerificationStatusEmail(
                verification.user.email,
                verification.user.name,
                'rejected',
                reason
            ).catch(err => console.error('Failed to send rejection email:', err));
        }

        res.status(200).json({
            success: true,
            message: 'Researcher verification rejected',
            data: {
                id: verification._id,
                status: verification.status,
                rejectionReason: reason,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Mark verification as under review (Admin)
// @route   POST /api/verification/:id/review
// @access  Private/Admin
exports.markUnderReview = async (req, res) => {
    try {
        const verification = await ResearcherVerification.findById(req.params.id)
            .populate('user', 'name email');

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found',
            });
        }

        verification.status = 'under_review';
        verification.reviewedBy = req.user.id;
        await verification.save();

        // Update user
        await User.findByIdAndUpdate(verification.user._id, {
            verificationStatus: 'under_review',
        });

        // Send notification email
        if (verification.user.email) {
            sendVerificationStatusEmail(
                verification.user.email,
                verification.user.name,
                'under_review'
            ).catch(err => console.error('Failed to send review email:', err));
        }

        res.status(200).json({
            success: true,
            message: 'Verification marked as under review',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get verification statistics (Admin)
// @route   GET /api/verification/stats
// @access  Private/Admin
exports.getVerificationStats = async (req, res) => {
    try {
        const stats = await ResearcherVerification.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const formattedStats = {
            pending: 0,
            under_review: 0,
            approved: 0,
            rejected: 0,
            total: 0,
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });

        res.status(200).json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
