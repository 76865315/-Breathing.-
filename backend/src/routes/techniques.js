const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Load techniques data
const techniquesPath = path.join(__dirname, '../../data/breathing-techniques.json');
let techniquesData = { techniques: [] };

try {
  if (fs.existsSync(techniquesPath)) {
    techniquesData = JSON.parse(fs.readFileSync(techniquesPath, 'utf8'));
  }
} catch (error) {
  console.error('Error loading techniques:', error);
}

// @route   GET /api/techniques
// @desc    Get all techniques
// @access  Public
router.get('/', (req, res) => {
  const { category, difficulty, sort } = req.query;

  let techniques = [...techniquesData.techniques];

  // Filter by category
  if (category) {
    techniques = techniques.filter(t => t.category === category);
  }

  // Filter by difficulty
  if (difficulty) {
    techniques = techniques.filter(t => t.difficulty === difficulty);
  }

  // Sort
  if (sort === 'health-impact' || !sort) {
    techniques.sort((a, b) => a.healthImpactRank - b.healthImpactRank);
  } else if (sort === 'name') {
    techniques.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'difficulty') {
    const order = { beginner: 1, intermediate: 2, advanced: 3 };
    techniques.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
  }

  res.json({
    success: true,
    data: techniques
  });
});

// @route   GET /api/techniques/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', (req, res) => {
  const categories = [...new Set(techniquesData.techniques.map(t => t.category))];

  res.json({
    success: true,
    data: categories.map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1)
    }))
  });
});

// @route   GET /api/techniques/:id
// @desc    Get a specific technique
// @access  Public
router.get('/:id', (req, res) => {
  const technique = techniquesData.techniques.find(t => t.id === req.params.id);

  if (!technique) {
    return res.status(404).json({
      success: false,
      message: 'Technique not found'
    });
  }

  res.json({
    success: true,
    data: technique
  });
});

// @route   GET /api/techniques/recommend
// @desc    Get recommended techniques based on goal
// @access  Public
router.get('/recommend/:goal', (req, res) => {
  const { goal } = req.params;

  let recommended = techniquesData.techniques.filter(t => {
    if (goal === 'stress-reduction') {
      return t.primaryBenefits?.includes('stress-relief') || t.primaryBenefits?.includes('anxiety-reduction');
    }
    if (goal === 'sleep') {
      return t.primaryBenefits?.includes('better-sleep') || t.category === 'relaxation';
    }
    if (goal === 'performance') {
      return t.primaryBenefits?.includes('focus') || t.primaryBenefits?.includes('mental-clarity');
    }
    if (goal === 'energy') {
      return t.primaryBenefits?.includes('energy-boost') || t.category === 'energizing';
    }
    return true;
  });

  // Sort by health impact and return top 5
  recommended.sort((a, b) => a.healthImpactRank - b.healthImpactRank);
  recommended = recommended.slice(0, 5);

  res.json({
    success: true,
    data: recommended
  });
});

module.exports = router;
