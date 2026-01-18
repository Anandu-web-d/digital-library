const axios = require('axios');
const Document = require('../models/Document');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message',
      });
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
      const response = await axios.post(`${aiServiceUrl}/api/ai/chat`, {
        message,
        context,
        userId: req.user.id,
        userRole: req.user.role,
      });

      res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (aiError) {
      res.status(500).json({
        success: false,
        message: 'AI service unavailable',
        error: aiError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Summarize document
// @route   POST /api/ai/summarize/:documentId
// @access  Private
exports.summarizeDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
      const response = await axios.post(`${aiServiceUrl}/api/ai/summarize`, {
        documentId: document._id.toString(),
        text: document.extractedText,
      });

      // Update document with summary
      document.summary = response.data.summary;
      await document.save();

      res.status(200).json({
        success: true,
        data: {
          summary: response.data.summary,
        },
      });
    } catch (aiError) {
      res.status(500).json({
        success: false,
        message: 'AI service unavailable',
        error: aiError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate citation
// @route   POST /api/ai/citation
// @access  Private
exports.generateCitation = async (req, res) => {
  try {
    const { documentId, style } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const citationStyle = style || req.user.preferences?.preferredCitationStyle || 'APA';

    // Simple citation generation (can be enhanced with AI)
    const citation = generateCitation(document, citationStyle);

    res.status(200).json({
      success: true,
      data: {
        citation,
        style: citationStyle,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

function generateCitation(document, style) {
  switch (style) {
    case 'APA':
      return `${document.author || 'Unknown'}. (${new Date(document.metadata?.publicationDate || document.createdAt).getFullYear()}). ${document.title}. ${document.metadata?.publisher || ''}.`;
    case 'MLA':
      return `${document.author || 'Unknown'}. "${document.title}." ${document.metadata?.publisher || ''}, ${new Date(document.metadata?.publicationDate || document.createdAt).getFullYear()}.`;
    case 'Chicago':
      return `${document.author || 'Unknown'}. "${document.title}." ${document.metadata?.publisher || ''}, ${new Date(document.metadata?.publicationDate || document.createdAt).getFullYear()}.`;
    default:
      return `${document.title} by ${document.author || 'Unknown'}`;
  }
}

