const mongoose = require('mongoose');

const researcherVerificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    // Verification Status
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending',
    },

    // Personal Information
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    dateOfBirth: {
        type: Date,
    },

    // Identity Verification
    idType: {
        type: String,
        enum: ['national_id', 'passport', 'university_id', 'drivers_license'],
        required: [true, 'ID type is required'],
    },
    idNumber: {
        type: String,
        required: [true, 'ID number is required'],
        trim: true,
    },
    idDocument: {
        type: String, // File path to uploaded ID document
        required: [true, 'ID document is required'],
    },
    profilePhoto: {
        type: String, // File path to profile photo
        required: [true, 'Profile photo is required'],
    },

    // Academic Information
    institution: {
        type: String,
        required: [true, 'Institution is required'],
        trim: true,
    },
    department: {
        type: String,
        trim: true,
    },
    position: {
        type: String,
        enum: [
            'Professor',
            'Associate Professor',
            'Assistant Professor',
            'Lecturer',
            'Research Fellow',
            'Postdoctoral Researcher',
            'PhD Student',
            'Research Assistant',
            'Other',
        ],
    },
    researchAreas: [{
        type: String,
        trim: true,
    }],

    // Academic Links & IDs
    orcidId: {
        type: String,
        trim: true,
        match: [/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 'Please enter a valid ORCID ID'],
    },
    googleScholarId: {
        type: String,
        trim: true,
    },
    linkedInProfile: {
        type: String,
        trim: true,
    },
    personalWebsite: {
        type: String,
        trim: true,
    },

    // Supporting Documents
    additionalDocuments: [{
        name: String,
        path: String,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    }],

    // Verification Process
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: {
        type: Date,
    },
    reviewNotes: {
        type: String,
    },
    rejectionReason: {
        type: String,
    },

    // History
    statusHistory: [{
        status: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        changedAt: {
            type: Date,
            default: Date.now,
        },
        notes: String,
    }],
});

// Index for efficient querying
researcherVerificationSchema.index({ status: 1, submittedAt: -1 });
researcherVerificationSchema.index({ user: 1 });

// Pre-save middleware to track status changes
researcherVerificationSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            notes: this.status === 'rejected' ? this.rejectionReason : this.reviewNotes,
        });
    }
    next();
});

module.exports = mongoose.model('ResearcherVerification', researcherVerificationSchema);
