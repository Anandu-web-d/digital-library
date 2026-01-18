const Author = require('../models/Author');
const Document = require('../models/Document');

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
exports.getAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'citationCount', search } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    if (sort === 'citationCount') {
      sortOptions.citationCount = -1;
    } else if (sort === 'hIndex') {
      sortOptions.hIndex = -1;
    } else if (sort === 'name') {
      sortOptions.name = 1;
    } else {
      sortOptions.citationCount = -1;
    }

    const authors = await Author.find(query)
      .populate('publications', 'title author publicationDate viewCount')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Author.countDocuments(query);

    res.status(200).json({
      success: true,
      data: authors,
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

// @desc    Get top authors
// @route   GET /api/authors/top
// @access  Public
exports.getTopAuthors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const authors = await Author.find()
      .populate('publications', 'title author publicationDate viewCount')
      .sort({ citationCount: -1, hIndex: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: authors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single author
// @route   GET /api/authors/:id
// @access  Public
exports.getAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
      .populate({
        path: 'publications',
        select: 'title author description category tags publicationDate viewCount downloadCount metadata',
        sort: { publicationDate: -1 },
      });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }

    res.status(200).json({
      success: true,
      data: author,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get or create author by name
// @route   POST /api/authors
// @access  Private (Admin)
exports.createOrGetAuthor = async (req, res) => {
  try {
    const { name, email, affiliation, bio, researchInterests } = req.body;

    let author = await Author.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (!author) {
      author = await Author.create({
        name,
        email,
        affiliation,
        bio,
        researchInterests: researchInterests ? researchInterests.split(',').map(r => r.trim()) : [],
      });
    }

    res.status(200).json({
      success: true,
      data: author,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

