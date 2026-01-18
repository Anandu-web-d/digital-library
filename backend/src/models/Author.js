const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide author name'],
    trim: true,
    index: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  affiliation: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
  },
  researchInterests: [{
    type: String,
    trim: true,
  }],
  publications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  citationCount: {
    type: Number,
    default: 0,
  },
  hIndex: {
    type: Number,
    default: 0,
  },
  orcid: {
    type: String,
    trim: true,
  },
  googleScholarId: {
    type: String,
    trim: true,
  },
  website: {
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

// Index for search
authorSchema.index({ name: 'text', affiliation: 'text', researchInterests: 'text' });
authorSchema.index({ citationCount: -1 });
authorSchema.index({ hIndex: -1 });

module.exports = mongoose.model('Author', authorSchema);

