const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocument,
  semanticSearch,
  getRecommendations,
  getPendingDocuments,
  approveDocument,
  rejectDocument,
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Public routes for articles
router.get('/articles', getDocuments);
router.get('/articles/:id', getDocument);
router.post('/articles/search', semanticSearch); // Public semantic search for articles

// Protected routes
router.get('/', protect, getDocuments);
router.get('/recommendations', protect, getRecommendations);
router.post('/search', protect, semanticSearch);
router.get('/pending', protect, authorize('admin'), getPendingDocuments);
router.post('/:id/approve', protect, authorize('admin'), approveDocument);
router.post('/:id/reject', protect, authorize('admin'), rejectDocument);
router.get('/:id', protect, getDocument);
router.post('/upload', protect, upload.single('file'), uploadDocument); // Allow researchers and admins

module.exports = router;

