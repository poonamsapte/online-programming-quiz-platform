const express = require('express');
const {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminStats,
  getAllUsers,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Question management routes
router.route('/questions')
  .get(getAllQuestions)
  .post(createQuestion);

router.route('/questions/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);

// Admin statistics
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAllUsers);

module.exports = router;