const express = require('express');
const router = express.Router();
const { chat, summarizeDocument, generateCitation } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, chat);
router.post('/summarize/:documentId', protect, summarizeDocument);
router.post('/citation', protect, generateCitation);

module.exports = router;

