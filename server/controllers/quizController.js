const Question = require('../models/Question');
const Result = require('../models/Result');

// Get quiz questions by language
exports.getQuizQuestions = async (req, res) => {
  try {
    const { language } = req.params;
    const { limit = 10 } = req.query;

    // Escape special regex characters (handles C++, etc.)
    const escapedLanguage = language.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Get random questions for the specified language
    const questions = await Question.aggregate([
      { $match: { language: { $regex: new RegExp(`^${escapedLanguage}$`, 'i') } } },
      { $sample: { size: parseInt(limit) } },
      { $project: { correctAnswer: 0, createdBy: 0 } }
    ]);

    // const questions = await Question.aggregate([
    //   { $match: { language: language } },
    //   { $sample: { size: parseInt(limit) } },
    //   { $project: { correctAnswer: 0, createdBy: 0 } } // Hide correct answers
    // ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for ${language}`,
      });
    }

    res.json({
      success: true,
      questions,
      language,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('Get quiz questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz questions',
    });
  }
};

// Submit quiz and calculate results
exports.submitQuiz = async (req, res) => {
  try {
    const { language, answers, timeTaken } = req.body;
    const userId = req.user._id || req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers format',
      });
    }

    // Get the correct answers from database
    const questionIds = answers.map(answer => answer.questionId);
    const questions = await Question.find({
      _id: { $in: questionIds }
    });

    // Calculate results
    let correctAnswers = 0;
    const detailedAnswers = [];

    for (let answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) correctAnswers++;

        detailedAnswers.push({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
        });
      }
    }

    const totalQuestions = answers.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const score = correctAnswers;

    // Save result to database
    const result = await Result.create({
      user: userId,
      language,
      totalQuestions,
      correctAnswers,
      score,
      percentage,
      timeTaken: timeTaken || 0,
      answers: detailedAnswers,
    });

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        id: result._id,
        totalQuestions,
        correctAnswers,
        score,
        percentage,
        timeTaken,
        language,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
    });
  }
};

// Get quiz result details
exports.getQuizResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user._id || req.user.id;

    const result = await Result.findOne({
      _id: resultId,
      user: userId,
    }).populate('answers.questionId', 'questionText options');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Quiz result not found',
      });
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Get quiz result error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz result',
    });
  }
};

// Get available languages
exports.getAvailableLanguages = async (req, res) => {
  try {
    const languages = await Question.distinct('language');

    // Get question count for each language
    const languageStats = await Question.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      }
    ]);

    const languagesWithCount = languages.map(lang => {
      const stats = languageStats.find(stat => stat._id === lang);
      return {
        language: lang,
        questionCount: stats ? stats.count : 0
      };
    });

    res.json({
      success: true,
      languages: languagesWithCount,
    });
  } catch (error) {
    console.error('Get available languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available languages',
    });
  }
};