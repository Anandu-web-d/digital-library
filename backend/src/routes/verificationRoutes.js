const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const {
    submitVerification,
    getVerificationStatus,
    getPendingVerifications,
    getVerification,
    approveVerification,
    rejectVerification,
    markUnderReview,
    getVerificationStats,
} = require('../controllers/researcherVerificationController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/verification');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.user.id}-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.',
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next();
};

// User routes
router.get('/status', protect, getVerificationStatus);
router.post(
    '/submit',
    protect,
    upload.fields([
        { name: 'idDocument', maxCount: 1 },
        { name: 'profilePhoto', maxCount: 1 },
    ]),
    handleMulterError,
    submitVerification
);

// Admin routes
router.get('/pending', protect, authorize('admin'), getPendingVerifications);
router.get('/stats', protect, authorize('admin'), getVerificationStats);
router.get('/:id', protect, authorize('admin'), getVerification);
router.post('/:id/approve', protect, authorize('admin'), approveVerification);
router.post('/:id/reject', protect, authorize('admin'), rejectVerification);
router.post('/:id/review', protect, authorize('admin'), markUnderReview);

module.exports = router;
