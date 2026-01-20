const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', [
  body('techniqueId').notEmpty().withMessage('Technique ID is required'),
  body('duration').isInt({ min: 0 }).withMessage('Duration must be a positive number'),
  body('completed').isBoolean().optional(),
  body('preMood').isInt({ min: 1, max: 5 }).optional(),
  body('postMood').isInt({ min: 1, max: 5 }).optional(),
  body('rating').isInt({ min: 1, max: 5 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const session = await Session.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sessions
// @desc    Get user sessions
// @access  Private
router.get('/', [
  query('limit').isInt({ min: 1, max: 100 }).optional(),
  query('page').isInt({ min: 1 }).optional(),
  query('techniqueId').optional()
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.techniqueId) {
      filter.techniqueId = req.query.techniqueId;
    }

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sessions/stats
// @desc    Get user session stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const [stats, streak] = await Promise.all([
      Session.getUserStats(req.user._id),
      Session.getStreak(req.user._id)
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        currentStreak: streak
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sessions/weekly
// @desc    Get weekly session data
// @access  Private
router.get('/weekly', async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sessions = await Session.find({
      user: req.user._id,
      createdAt: { $gte: weekAgo }
    }).lean();

    // Initialize weekly data
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();

    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays < 7) {
        weeklyData[6 - diffDays] += Math.floor(session.duration / 60);
      }
    });

    res.json({
      success: true,
      data: weeklyData
    });
  } catch (error) {
    console.error('Get weekly error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific session
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
