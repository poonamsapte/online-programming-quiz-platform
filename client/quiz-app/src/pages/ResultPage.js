import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ResultPage.css';

const ResultPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await api.get(`/quizzes/result/${resultId}`);
        if (response.data.success) {
          setResult(response.data.result);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching result:', error);
        setError('Failed to load quiz result');

      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Outstanding! 🏆';
    if (percentage >= 80) return 'Excellent work! 🌟';
    if (percentage >= 70) return 'Great job! 👏';
    if (percentage >= 60) return 'Good effort! 👍';
    if (percentage >= 50) return 'Keep practicing! 📚';
    return 'Don\'t give up! 💪';
  };

  if (loading) {
    return <LoadingSpinner message="Loading your results..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Result Not Found</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="retry-button"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">
      <div className="result-container">
        {/* Result Header */}
        <div className="result-header">
          <div className="result-icon">
            {result.percentage >= 80 ? '🏆' : result.percentage >= 60 ? '🌟' : '📚'}
          </div>
          <h1>Quiz Complete!</h1>
          <p className="result-message">{getScoreMessage(result.percentage)}</p>
        </div>

        {/* Score Summary */}
        <div className="score-summary">
          <div className="score-circle">
            <div className={`circular-progress ${getScoreColor(result.percentage)}`}>
              <div className="score-display">
                <span className="percentage">{result.percentage}%</span>
                <span className="score-text">
                  {result.correctAnswers}/{result.totalQuestions}
                </span>
              </div>
            </div>
          </div>

          <div className="score-details">
            <div className="detail-item">
              <span className="detail-label">Language</span>
              <span className="detail-value">{result.language}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Correct Answers</span>
              <span className="detail-value">{result.correctAnswers}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Questions</span>
              <span className="detail-value">{result.totalQuestions}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Time Taken</span>
              <span className="detail-value">{formatTime(result.timeTaken)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date</span>
              <span className="detail-value">
                {new Date(result.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="performance-analysis">
          <h3>Performance Analysis</h3>
          <div className="analysis-grid">
            <div className="analysis-card">
              <div className="analysis-icon">✅</div>
              <div className="analysis-content">
                <span className="analysis-number">{result.correctAnswers}</span>
                <span className="analysis-label">Correct</span>
              </div>
            </div>
            <div className="analysis-card">
              <div className="analysis-icon">❌</div>
              <div className="analysis-content">
                <span className="analysis-number">{result.totalQuestions - result.correctAnswers}</span>
                <span className="analysis-label">Incorrect</span>
              </div>
            </div>
            <div className="analysis-card">
              <div className="analysis-icon">⚡</div>
              <div className="analysis-content">
                <span className="analysis-number">
                  {Math.round(result.timeTaken / result.totalQuestions)}s
                </span>
                <span className="analysis-label">Avg Time</span>
              </div>
            </div>
            <div className="analysis-card">
              <div className="analysis-icon">🎯</div>
              <div className="analysis-content">
                <span className="analysis-number">{result.percentage}%</span>
                <span className="analysis-label">Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Answers Section */}
        <div className="review-section">
          <div className="review-header">
            <h3>Answer Review</h3>
            <button
              onClick={() => setShowReview(!showReview)}
              className="review-toggle"
            >
              {showReview ? 'Hide Review' : 'Show Review'}
            </button>
          </div>

          {showReview && (
            <div className="answers-review">
              {result.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className={`answer-status ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                      {answer.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                    </span>
                  </div>

                  <div className="question-text">
                    {answer.questionId.questionText}
                  </div>

                  <div className="answer-options">
                    {answer.questionId.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`option-review ${option === answer.correctAnswer ? 'correct-answer' : ''
                          } ${option === answer.selectedAnswer && !answer.isCorrect ? 'wrong-answer' : ''
                          } ${option === answer.selectedAnswer && answer.isCorrect ? 'selected-correct' : ''
                          }`}
                      >
                        <span className="option-label">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="option-text">{option}</span>
                        {option === answer.correctAnswer && (
                          <span className="correct-indicator">✓</span>
                        )}
                        {option === answer.selectedAnswer && !answer.isCorrect && (
                          <span className="wrong-indicator">✗</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {!answer.isCorrect && (
                    <div className="explanation">
                      <strong>Correct Answer:</strong> {answer.correctAnswer}
                      <br />
                      <strong>Your Answer:</strong> {answer.selectedAnswer || 'No answer selected'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <Link to={`/quiz/${encodeURIComponent(result.language)}`} className="action-button primary">
            Take Quiz Again
          </Link>
          <Link to="/languages" className="action-button secondary">
            Try Another Language
          </Link>
          <Link to="/dashboard" className="action-button secondary">
            View Dashboard
          </Link>
          <Link to="/leaderboard" className="action-button secondary">
            Check Leaderboard
          </Link>
        </div>

        {/* Motivational Message */}
        <div className="motivation-message">
          {result.percentage >= 80 ? (
            <p>🎉 Excellent performance! You're mastering {result.language} programming. Keep up the great work!</p>
          ) : result.percentage >= 60 ? (
            <p>👍 Good job! You're on the right track. Review the incorrect answers and try again to improve your score.</p>
          ) : (
            <p>💪 Don't worry! Every expert was once a beginner. Keep practicing and you'll see improvement soon!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;