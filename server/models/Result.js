const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['C', 'C++', 'Java', 'Python', 'JavaScript', 'HTML', 'c', 'c++', 'java', 'python', 'javascript', 'html'],
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'questions',
      required: true,
    },
    selectedAnswer: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

// Index for faster queries
resultSchema.index({ user: 1, language: 1, createdAt: -1 });

module.exports = mongoose.model('Result', resultSchema);