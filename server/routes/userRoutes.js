const express = require('express');
const {
  getUserProgress,
  getUserQuizHistory,
  updateProfile,
  getLeaderboard,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.get('/progress', protect, getUserProgress);
router.get('/history', protect, getUserQuizHistory);
router.put('/profile', protect, updateProfile);

// Public route (but can use auth if available)
router.get('/leaderboard', optionalAuth, getLeaderboard);

module.exports = router;