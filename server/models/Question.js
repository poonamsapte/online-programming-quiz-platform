const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['C', 'C++', 'Java', 'Python', 'HTML'],
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function (options) {
        return options.length === 4;
      },
      message: 'Question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    validate: {
      validator: function (answer) {
        return this.options.includes(answer);
      },
      message: 'Correct answer must be one of the options'
    }
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
questionSchema.index({ language: 1, difficulty: 1 });

module.exports = mongoose.model('questions', questionSchema);