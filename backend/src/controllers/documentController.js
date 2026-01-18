const Document = require('../models/Document');
const User = require('../models/User');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (Admin only)
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const { title, description, author, category, tags, publisher, publicationDate, doi, isbn } = req.body;

    // Determine status based on user role
    let status = 'pending';
    let approvalStatus = 'pending';
    
    if (req.user.role === 'admin') {
      // Admins can publish directly
      status = 'published';
      approvalStatus = 'approved';
    } else if (req.user.role === 'researcher') {
      // Researchers need approval
      status = 'pending_approval';
      approvalStatus = 'pending';
    } else {
      // Students need approval
      status = 'pending_approval';
      approvalStatus = 'pending';
    }

    // Create document record
    const document = await Document.create({
      title: title || req.file.originalname,
      description,
      author,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      status,
      approvalStatus,
      metadata: {
        publisher: publisher || undefined,
        publicationDate: publicationDate ? new Date(publicationDate) : undefined,
        doi: doi || undefined,
        isbn: isbn || undefined,
      },
    });

    // Send to AI service for processing
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const filePath = req.file.path;
      
      // Read file and send to AI service
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: req.file.originalname,
        contentType: 'application/pdf',
      });
      formData.append('documentId', document._id.toString());

      await axios.post(`${aiServiceUrl}/api/ai/process-document`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      document.status = 'processed';
      await document.save();
    } catch (aiError) {
      console.error('AI processing error:', aiError.message);
      // Document is still saved, but processing failed
    }

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sort } = req.query;
    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Determine sort order
    let sortOptions = { createdAt: -1 }; // Default: most recent
    if (sort === 'views') {
      sortOptions = { viewCount: -1 };
    } else if (sort === 'downloads') {
      sortOptions = { downloadCount: -1 };
    } else if (sort === 'recent') {
      sortOptions = { createdAt: -1 };
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.status(200).json({
      success: true,
      data: documents,
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

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Increment view count
    document.viewCount += 1;
    await document.save();

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Semantic search
// @route   POST /api/documents/search or /api/documents/articles/search
// @access  Private or Public
exports.semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
    }

    // Call AI service for semantic search
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
      const response = await axios.post(`${aiServiceUrl}/api/ai/semantic-search`, {
        query,
        userId: req.user?.id || null, // Optional user ID for public searches
      });

      // Get document IDs from AI service
      const documentIds = response.data.documentIds || [];
      
      // Fetch documents from MongoDB
      const documents = await Document.find({
        _id: { $in: documentIds },
        status: 'published',
      }).populate('uploadedBy', 'name email');

      // Save search history only if user is authenticated
      if (req.user && req.user.id) {
        try {
          await User.findByIdAndUpdate(req.user.id, {
            $push: {
              searchHistory: {
                query,
                timestamp: new Date(),
              },
            },
          });
        } catch (historyError) {
          // Don't fail the request if history save fails
          console.error('Error saving search history:', historyError);
        }
      }

      res.status(200).json({
        success: true,
        data: documents,
        query,
      });
    } catch (aiError) {
      // Fallback to keyword search
      const documents = await Document.find({
        $text: { $search: query },
        status: 'published',
      })
        .populate('uploadedBy', 'name email')
        .limit(20);

      res.status(200).json({
        success: true,
        data: documents,
        query,
        fallback: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get recommendations
// @route   GET /api/documents/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
      const response = await axios.get(`${aiServiceUrl}/api/ai/recommendations`, {
        params: {
          userId: req.user.id,
        },
      });

      const documentIds = response.data.documentIds || [];
      const documents = await Document.find({
        _id: { $in: documentIds },
        status: 'published',
      }).populate('uploadedBy', 'name email');

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (aiError) {
      // Fallback to recent documents
      const documents = await Document.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('uploadedBy', 'name email');

      res.status(200).json({
        success: true,
        data: documents,
        fallback: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get pending documents for approval
// @route   GET /api/documents/pending
// @access  Private (Admin only)
exports.getPendingDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      status: 'pending_approval',
      approvalStatus: 'pending',
    })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: documents,
      count: documents.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve document
// @route   POST /api/documents/:id/approve
// @access  Private (Admin only)
exports.approveDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    document.status = 'published';
    document.approvalStatus = 'approved';
    document.approvedBy = req.user.id;
    document.approvedAt = new Date();
    await document.save();

    res.status(200).json({
      success: true,
      data: document,
      message: 'Document approved and published',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject document
// @route   POST /api/documents/:id/reject
// @access  Private (Admin only)
exports.rejectDocument = async (req, res) => {
  try {
    const { reason } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    document.status = 'rejected';
    document.approvalStatus = 'rejected';
    document.rejectionReason = reason || 'No reason provided';
    await document.save();

    res.status(200).json({
      success: true,
      data: document,
      message: 'Document rejected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

