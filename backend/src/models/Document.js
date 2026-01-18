const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  author: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
    default: 'application/pdf',
  },
  extractedText: {
    type: String,
  },
  summary: {
    type: String,
  },
  embeddingId: {
    type: String, // Reference to vector DB
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  metadata: {
    pages: Number,
    publicationDate: Date,
    publisher: String,
    isbn: String,
    doi: String,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'pending_approval', 'approved', 'processed', 'published', 'rejected', 'archived'],
    default: 'pending',
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

documentSchema.index({ title: 'text', description: 'text', extractedText: 'text' });
documentSchema.index({ category: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);

