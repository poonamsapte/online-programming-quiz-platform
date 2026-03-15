const Question = require('../models/Question');
const User = require('../models/User');
const Result = require('../models/Result');

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const { language, page = 1, limit = 10 } = req.query;
    const query = language ? { language } : {};
    
    const questions = await Question.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get all questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
    });
  }
};

// Create new question
exports.createQuestion = async (req, res) => {
  try {
    const { language, questionText, options, correctAnswer, difficulty } = req.body;

    const question = await Question.create({
      language,
      questionText,
      options,
      correctAnswer,
      difficulty,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question,
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating question',
    });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { language, questionText, options, correctAnswer, difficulty } = req.body;

    const question = await Question.findByIdAndUpdate(
      id,
      { language, questionText, options, correctAnswer, difficulty },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      question,
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating question',
    });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
    });
  }
};

// Get admin statistics
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalQuestions = await Question.countDocuments();
    const totalQuizzes = await Result.countDocuments();

    // Questions by language
    const questionsByLanguage = await Question.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent quiz results
    const recentResults = await Result.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalQuestions,
        totalQuizzes,
        questionsByLanguage,
        recentResults,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics',
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role: 'user' });

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
    });
  }
};