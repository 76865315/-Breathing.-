const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  techniqueId: {
    type: String,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  preMood: {
    type: Number,
    min: 1,
    max: 5
  },
  postMood: {
    type: Number,
    min: 1,
    max: 5
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
sessionSchema.index({ user: 1, createdAt: -1 });
sessionSchema.index({ user: 1, techniqueId: 1 });

// Static method to get user stats
sessionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: { $divide: ['$duration', 60] } },
        avgMoodImprovement: {
          $avg: {
            $cond: [
              { $and: [{ $gt: ['$postMood', 0] }, { $gt: ['$preMood', 0] }] },
              { $subtract: ['$postMood', '$preMood'] },
              null
            ]
          }
        },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  return stats[0] || {
    totalSessions: 0,
    totalMinutes: 0,
    avgMoodImprovement: 0,
    avgRating: 0
  };
};

// Static method to calculate streak
sessionSchema.statics.getStreak = async function(userId) {
  const sessions = await this.find({ user: userId })
    .select('createdAt')
    .sort({ createdAt: -1 })
    .lean();

  if (sessions.length === 0) return 0;

  const uniqueDates = [...new Set(
    sessions.map(s => s.createdAt.toISOString().split('T')[0])
  )].sort().reverse();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diffDays = (current.getTime() - next.getTime()) / 86400000;

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

module.exports = mongoose.model('Session', sessionSchema);
