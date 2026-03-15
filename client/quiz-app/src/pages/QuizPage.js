import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './QuizPage.css';

const QuizPage = () => {
  const { language } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const quizStartTime = useRef(null);
  const timerRef = useRef(null);
  const answersRef = useRef([]);

  // Move to next question or submit — stable reference via useCallback
  const advanceQuestion = useCallback((currentIndex, currentAnswers, currentSelected, questions) => {
    const answer = {
      questionId: questions[currentIndex]._id,
      selectedAnswer: currentSelected || '',
    };
    const newAnswers = [...currentAnswers, answer];
    answersRef.current = newAnswers;

    if (currentIndex === questions.length - 1) {
      // Last question — submit
      submitQuiz(newAnswers);
    } else {
      setUserAnswers(newAnswers);
      setCurrentQuestionIndex(currentIndex + 1);
      setSelectedAnswer('');
      setTimeLeft(120);
    }
  }, []); // eslint-disable-line

  // Start/restart the 2-minute timer whenever question changes
  useEffect(() => {
    if (loading || questions.length === 0) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(120);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Auto advance — read latest state from refs
          setCurrentQuestionIndex(ci => {
            setSelectedAnswer(sa => {
              advanceQuestion(ci, answersRef.current, sa, questions);
              return sa;
            });
            return ci;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, loading, questions]); // eslint-disable-line

  // Fetch quiz questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get(`/quizzes/${encodeURIComponent(language)}?limit=10`);
        if (response.data.success) {
          setQuestions(response.data.questions);
          quizStartTime.current = Date.now();
        } else {
          setError(response.data.message || 'No questions found for this language');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load quiz questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [language]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    advanceQuestion(currentQuestionIndex, answersRef.current, selectedAnswer, questions);
  };

  const submitQuiz = async (answers) => {
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - quizStartTime.current) / 1000);

      const response = await api.post('/quizzes/submit', {
        language,
        answers,
        timeTaken,
      });

      if (response.data.success) {
        // Backend returns result.id (not result._id)
        const resultId = response.data.result.id || response.data.result._id;
        navigate(`/result/${resultId}`);
      } else {
        setError('Failed to submit quiz. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (loading) {
    return <LoadingSpinner message="Loading quiz questions..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Quiz Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/languages')}
            className="retry-button"
          >
            Back to Language Selection
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>No Questions Available</h2>
          <p>Sorry, there are no questions available for {language} at this time.</p>
          <button
            onClick={() => navigate('/languages')}
            className="retry-button"
          >
            Choose Another Language
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        {/* Quiz Header */}
        <div className="quiz-header">
          <div className="quiz-info">
            <h2>{language} Programming Quiz</h2>
            <div className="quiz-meta">
              <span className="question-counter">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className={`timer ${timeLeft <= 30 ? 'urgent' : ''}`}>
                ⏰ {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Question Content */}
        <div className="question-content">
          <div className="question-text">
            <h3>{currentQuestion.questionText}</h3>
          </div>

          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`option ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
              >
                <span className="option-label">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Controls */}
        <div className="quiz-controls">
          <div className="control-info">
            {!selectedAnswer && (
              <p className="no-answer-warning">
                ⚠️ No answer selected. The question will be marked as incorrect.
              </p>
            )}
          </div>

          <div className="control-buttons">
            <button
              onClick={handleNextQuestion}
              disabled={submitting}
              className="next-button"
            >
              {submitting ? (
                <>
                  <span className="spinner small"></span>
                  Submitting...
                </>
              ) : currentQuestionIndex === questions.length - 1 ? (
                'Finish Quiz ✓'
              ) : (
                'Next Question →'
              )}
            </button>
          </div>
        </div>

        {/* Quiz Instructions */}
        <div className="quiz-instructions">
          <p>💡 <strong>Tip:</strong> You have 2 minutes per question. Select an answer and click "Next Question" to continue.</p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;