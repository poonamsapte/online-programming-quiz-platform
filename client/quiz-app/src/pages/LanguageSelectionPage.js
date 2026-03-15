import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './LanguageSelectionPage.css';

const LanguageSelectionPage = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await api.get('/quizzes/languages');
        if (response.data.success) {
          setLanguages(response.data.languages);
        } else {
          setError('Failed to fetch languages');
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const handleLanguageSelect = (language) => {
    // Use encodeURIComponent to safely handle special chars like C++
    navigate(`/quiz/${encodeURIComponent(language)}`);
  };

  const getLanguageIcon = (language) => {
    const icons = {
      'C': '🔧',
      'C++': '⚙️',
      'Java': '☕',
      'Python': '🐍',
      'JavaScript': '⚡',
      'HTML': '🌐',
    };
    return icons[language] || '💻';
  };

  const getLanguageDescription = (language) => {
    const descriptions = {
      'C': 'Test your knowledge of C programming fundamentals, pointers, and memory management.',
      'C++': 'Explore C++ concepts including OOP, templates, STL, and memory management.',
      'Java': 'Challenge yourself with Java concepts including OOP, collections, and multithreading.',
      'Python': 'Explore Python syntax, data structures, and popular libraries.',
      'JavaScript': 'Master JavaScript ES6+, DOM manipulation, and asynchronous programming.',
      'HTML': 'Validate your understanding of HTML5, semantic elements, and web standards.',
    };
    return descriptions[language] || 'Test your programming knowledge with this language.';
  };

  if (loading) {
    return <LoadingSpinner message="Loading available languages..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Oops! Something went wrong</h2>
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
    <div className="language-selection-page">
      <div className="container">
        <div className="page-header">
          <h1>Choose Your Programming Language</h1>
          <p>Select a language to start your quiz. Each quiz contains 10 random questions.</p>
        </div>

        <div className="languages-grid">
          {languages.map((lang, index) => (
            <div
              key={index}
              className="language-card"
              onClick={() => handleLanguageSelect(lang.language)}
            >
              <div className="language-icon">
                {getLanguageIcon(lang.language)}
              </div>

              <div className="language-info">
                <h3>{lang.language}</h3>
                <p className="language-description">
                  {getLanguageDescription(lang.language)}
                </p>

                <div className="language-stats">
                  <span className="question-count">
                    📝 {lang.questionCount} questions available
                  </span>
                </div>
              </div>

              <div className="language-actions">
                <button className="start-quiz-btn">
                  Start Quiz →
                </button>
              </div>
            </div>
          ))}
        </div>

        {languages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Languages Available</h3>
            <p>It looks like no quiz questions have been added yet. Please check back later!</p>
          </div>
        )}

        <div className="quiz-info">
          <div className="info-card">
            <h3>📋 Quiz Format</h3>
            <ul>
              <li>10 random questions per quiz</li>
              <li>Multiple choice questions</li>
              <li>Instant feedback on answers</li>
              <li>Detailed results at the end</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>⏰ Time Limit</h3>
            <ul>
              <li>2 minutes per question</li>
              <li>Auto-submit when time expires</li>
              <li>Track your completion time</li>
              <li>No penalties for fast completion</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>🏆 Scoring</h3>
            <ul>
              <li>1 point per correct answer</li>
              <li>Percentage score calculation</li>
              <li>Results saved to your profile</li>
              <li>Compare with leaderboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionPage;
