const express = require('express');
const {
  getQuizQuestions,
  submitQuiz,
  getQuizResult,
  getAvailableLanguages,
} = require('../controllers/QuizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - must be before /:language
router.get('/languages', getAvailableLanguages);

// Specific routes MUST come before the wildcard /:language route
router.get('/result/:resultId', protect, getQuizResult);
router.post('/submit', protect, submitQuiz);

// Wildcard route last
router.get('/:language', protect, getQuizQuestions);

module.exports = router;