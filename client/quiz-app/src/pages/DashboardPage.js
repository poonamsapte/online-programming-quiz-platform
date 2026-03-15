import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('/users/progress');
        if (response.data.success) {
          setProgress(response.data.progress);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Dashboard Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Here's your learning progress overview</p>
          </div>
          
          <div className="quick-actions">
            <Link to="/languages" className="quick-action-btn primary">
              Take New Quiz
            </Link>
            <Link to="/leaderboard" className="quick-action-btn secondary">
              View Leaderboard
            </Link>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="stats-section">
          <h2>Overall Performance</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-number">{progress.overall.totalQuizzes}</span>
                <span className="stat-label">Quizzes Taken</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">❓</div>
              <div className="stat-content">
                <span className="stat-number">{progress.overall.totalQuestions}</span>
                <span className="stat-label">Questions Answered</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-number">{progress.overall.totalCorrect}</span>
                <span className="stat-label">Correct Answers</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className={`stat-number ${getPerformanceColor(progress.overall.overallPercentage)}`}>
                  {progress.overall.overallPercentage}%
                </span>
                <span className="stat-label">Overall Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Language Performance */}
        <div className="language-performance-section">
          <h2>Performance by Language</h2>
          {Object.keys(progress.byLanguage).length > 0 ? (
            <div className="language-cards">
              {Object.entries(progress.byLanguage).map(([language, stats]) => (
                <div key={language} className="language-card">
                  <div className="language-header">
                    <h3>{language}</h3>
                    <span className="language-icon">
                      {language === 'C' && '🔧'}
                      {language === 'Java' && '☕'}
                      {language === 'Python' && '🐍'}
                      {language === 'JavaScript' && '⚡'}
                      {language === 'HTML' && '🌐'}
                    </span>
                  </div>
                  
                  <div className="language-stats">
                    <div className="stat-row">
                      <span className="stat-label">Quizzes Taken:</span>
                      <span className="stat-value">{stats.totalQuizzes}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Best Score:</span>
                      <span className={`stat-value ${getPerformanceColor(stats.bestScore)}`}>
                        {stats.bestScore}%
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Average:</span>
                      <span className={`stat-value ${getPerformanceColor(stats.averagePercentage)}`}>
                        {stats.averagePercentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="language-actions">
                    <Link 
                      to={`/quiz/${language.toLowerCase()}`}
                      className="practice-btn"
                    >
                      Practice More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No quizzes taken yet</h3>
              <p>Start taking quizzes to see your performance by language</p>
              <Link to="/languages" className="cta-button">
                Take Your First Quiz
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="recent-activity-section">
          <h2>Recent Quiz Activity</h2>
          {progress.recentActivity.length > 0 ? (
            <div className="activity-list">
              {progress.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <span className={getPerformanceColor(activity.score)}>
                      {activity.score >= 80 ? '🏆' : activity.score >= 60 ? '🌟' : '📚'}
                    </span>
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-main">
                      <span className="activity-title">{activity.language} Quiz</span>
                      <span className={`activity-score ${getPerformanceColor(activity.score)}`}>
                        {activity.score}%
                      </span>
                    </div>
                    <div className="activity-details">
                      <span className="activity-result">
                        {activity.correctAnswers}/{activity.totalQuestions} correct
                      </span>
                      <span className="activity-date">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="activity-actions">
                    <Link 
                      to={`/result/${activity.id}`}
                      className="view-result-btn"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-activity">
              <p>No recent activity. Take a quiz to see your progress!</p>
            </div>
          )}
        </div>

        {/* Motivational Section */}
        <div className="motivation-section">
          <div className="motivation-card">
            <div className="motivation-icon">🚀</div>
            <div className="motivation-content">
              <h3>Keep Learning!</h3>
              {progress.overall.totalQuizzes === 0 ? (
                <p>Ready to start your programming quiz journey? Take your first quiz now!</p>
              ) : progress.overall.overallPercentage >= 80 ? (
                <p>Excellent work! You're mastering programming concepts. Challenge yourself with more quizzes!</p>
              ) : progress.overall.overallPercentage >= 60 ? (
                <p>You're doing great! Keep practicing to reach the next level.</p>
              ) : (
                <p>Every expert was once a beginner. Keep practicing and you'll see improvement!</p>
              )}
            </div>
            <Link to="/languages" className="motivation-btn">
              Continue Learning
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;