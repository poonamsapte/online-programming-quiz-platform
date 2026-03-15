const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/AuthController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', getCurrentUser);

module.exports = router;