const Result = require('../models/Result');
const User = require('../models/User');

// Get user progress/dashboard data
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user results
    const results = await Result.find({ user: userId })
      .sort({ createdAt: -1 });

    // Calculate statistics by language
    const languageStats = {};
    
    results.forEach(result => {
      if (!languageStats[result.language]) {
        languageStats[result.language] = {
          totalQuizzes: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          bestScore: 0,
          averagePercentage: 0,
          recentScores: [],
        };
      }
      
      const stats = languageStats[result.language];
      stats.totalQuizzes++;
      stats.totalQuestions += result.totalQuestions;
      stats.totalCorrect += result.correctAnswers;
      stats.bestScore = Math.max(stats.bestScore, result.percentage);
      stats.recentScores.push({
        score: result.percentage,
        date: result.createdAt,
        timeTaken: result.timeTaken,
      });
    });

    // Calculate average percentages
    Object.keys(languageStats).forEach(language => {
      const stats = languageStats[language];
      stats.averagePercentage = stats.totalQuestions > 0 
        ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
        : 0;
      
      // Keep only recent 10 scores
      stats.recentScores = stats.recentScores.slice(0, 10);
    });

    // Overall statistics
    const totalQuizzes = results.length;
    const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
    const totalCorrect = results.reduce((sum, result) => sum + result.correctAnswers, 0);
    const overallPercentage = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    // Recent activity (last 10 quizzes)
    const recentActivity = results.slice(0, 10).map(result => ({
      id: result._id,
      language: result.language,
      score: result.percentage,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken,
      date: result.createdAt,
    }));

    res.json({
      success: true,
      progress: {
        overall: {
          totalQuizzes,
          totalQuestions,
          totalCorrect,
          overallPercentage,
        },
        byLanguage: languageStats,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user progress',
    });
  }
};

// Get user quiz history
exports.getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, page = 1, limit = 10 } = req.query;
    
    const query = { user: userId };
    if (language) {
      query.language = language;
    }

    const results = await Result.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-answers'); // Exclude detailed answers for performance

    const total = await Result.countDocuments(query);

    res.json({
      success: true,
      history: results,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get user quiz history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz history',
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken',
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { language, timeframe = 'all' } = req.query;
    
    let dateFilter = {};
    if (timeframe === 'week') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'month') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const matchStage = { ...dateFilter };
    if (language) {
      matchStage.language = language;
    }

    const leaderboard = await Result.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          totalQuizzes: { $sum: 1 },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrect: { $sum: '$correctAnswers' },
          bestScore: { $max: '$percentage' },
          averageScore: { $avg: '$percentage' },
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          totalQuizzes: 1,
          totalQuestions: 1,
          totalCorrect: 1,
          bestScore: 1,
          averageScore: { $round: ['$averageScore', 1] },
          overallPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$totalCorrect', '$totalQuestions'] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      { $sort: { overallPercentage: -1, bestScore: -1 } },
      { $limit: 50 }
    ]);

    res.json({
      success: true,
      leaderboard,
      timeframe,
      language: language || 'all',
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
    });
  }
};