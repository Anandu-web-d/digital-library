const express = require('express');
const router = express.Router();
const {
  getAuthors,
  getTopAuthors,
  getAuthor,
  createOrGetAuthor,
} = require('../controllers/authorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/top', getTopAuthors);
router.get('/:id', getAuthor);
router.get('/', getAuthors);
router.post('/', protect, authorize('admin'), createOrGetAuthor);

module.exports = router;

