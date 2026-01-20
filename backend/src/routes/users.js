const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('name').optional().trim().isLength({ max: 50 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', [
  body('notifications').optional().isBoolean(),
  body('darkMode').optional().isBoolean(),
  body('reminderTime').optional().isString()
], async (req, res) => {
  try {
    const { notifications, darkMode, reminderTime } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'settings.notifications': notifications ?? req.user.settings?.notifications,
          'settings.darkMode': darkMode ?? req.user.settings?.darkMode,
          'settings.reminderTime': reminderTime ?? req.user.settings?.reminderTime
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user favorites
// @access  Private
router.get('/favorites', async (req, res) => {
  res.json({
    success: true,
    data: req.user.favorites || []
  });
});

// @route   POST /api/users/favorites/:techniqueId
// @desc    Add favorite
// @access  Private
router.post('/favorites/:techniqueId', async (req, res) => {
  try {
    const { techniqueId } = req.params;

    if (req.user.favorites?.includes(techniqueId)) {
      return res.json({
        success: true,
        data: req.user.favorites
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: techniqueId } },
      { new: true }
    );

    res.json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/favorites/:techniqueId
// @desc    Remove favorite
// @access  Private
router.delete('/favorites/:techniqueId', async (req, res) => {
  try {
    const { techniqueId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: techniqueId } },
      { new: true }
    );

    res.json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
