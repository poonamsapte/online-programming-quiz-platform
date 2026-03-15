import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available languages
        const languagesResponse = await api.get('/quizzes/languages');
        if (languagesResponse.data.success) {
          setAvailableLanguages(languagesResponse.data.languages);
        }

        // Fetch leaderboard
        await fetchLeaderboard();
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to load leaderboard');
      }
    };

    fetchData();
  }, []);

  const fetchLeaderboard = async (language = selectedLanguage, timeframe = selectedTimeframe) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (language !== 'all') params.append('language', language);
      if (timeframe !== 'all') params.append('timeframe', timeframe);

      const response = await api.get(`/users/leaderboard?${params.toString()}`);
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    fetchLeaderboard(language, selectedTimeframe);
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    fetchLeaderboard(selectedLanguage, timeframe);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  };

  const getCurrentUserRank = () => {
    if (!user) return null;
    const userEntry = leaderboard.find((entry, index) => 
      entry.name === user.name
    );
    if (userEntry) {
      return leaderboard.indexOf(userEntry) + 1;
    }
    return null;
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        {/* Header */}
        <div className="leaderboard-header">
          <h1>🏆 Leaderboard</h1>
          <p>See how you rank against other programmers worldwide</p>
          
          {user && (
            <div className="user-rank-info">
              {getCurrentUserRank() ? (
                <p>Your current rank: <strong>#{getCurrentUserRank()}</strong></p>
              ) : (
                <p>Take more quizzes to appear on the leaderboard!</p>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="leaderboard-filters">
          <div className="filter-group">
            <label htmlFor="language-select">Language:</label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Languages</option>
              {availableLanguages.map((lang, index) => (
                <option key={index} value={lang.language}>
                  {lang.language}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="timeframe-select">Timeframe:</label>
            <select
              id="timeframe-select"
              value={selectedTimeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner message="Loading leaderboard..." />}

        {/* Error State */}
        {error && !loading && (
          <div className="error-container">
            <div className="error-content">
              <h2>Failed to Load Leaderboard</h2>
              <p>{error}</p>
              <button 
                onClick={() => fetchLeaderboard()} 
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Content */}
        {!loading && !error && (
          <>
            {leaderboard.length > 0 ? (
              <>
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                  <div className="podium-section">
                    <div className="podium">
                      {/* Second Place */}
                      <div className="podium-position second">
                        <div className="podium-user">
                          <div className="podium-rank">🥈</div>
                          <div className="podium-name">{leaderboard[1].name}</div>
                          <div className="podium-score">
                            {leaderboard[1].overallPercentage}%
                          </div>
                        </div>
                        <div className="podium-base second-place">2</div>
                      </div>

                      {/* First Place */}
                      <div className="podium-position first">
                        <div className="podium-user">
                          <div className="podium-rank">🥇</div>
                          <div className="podium-name">{leaderboard[0].name}</div>
                          <div className="podium-score">
                            {leaderboard[0].overallPercentage}%
                          </div>
                        </div>
                        <div className="podium-base first-place">1</div>
                      </div>

                      {/* Third Place */}
                      <div className="podium-position third">
                        <div className="podium-user">
                          <div className="podium-rank">🥉</div>
                          <div className="podium-name">{leaderboard[2].name}</div>
                          <div className="podium-score">
                            {leaderboard[2].overallPercentage}%
                          </div>
                        </div>
                        <div className="podium-base third-place">3</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Leaderboard Table */}
                <div className="leaderboard-table-section">
                  <div className="leaderboard-table">
                    <div className="table-header">
                      <div className="header-cell rank">Rank</div>
                      <div className="header-cell name">Name</div>
                      <div className="header-cell quizzes">Quizzes</div>
                      <div className="header-cell accuracy">Accuracy</div>
                      <div className="header-cell best">Best Score</div>
                      <div className="header-cell average">Average</div>
                    </div>

                    <div className="table-body">
                      {leaderboard.map((entry, index) => (
                        <div 
                          key={index} 
                          className={`table-row ${
                            user && entry.name === user.name ? 'current-user' : ''
                          } ${index < 3 ? 'top-three' : ''}`}
                        >
                          <div className="table-cell rank">
                            <span className="rank-display">
                              {getRankIcon(index + 1)}
                            </span>
                          </div>
                          <div className="table-cell name">
                            <span className="user-name">{entry.name}</span>
                            {user && entry.name === user.name && (
                              <span className="you-badge">You</span>
                            )}
                          </div>
                          <div className="table-cell quizzes">
                            {entry.totalQuizzes}
                          </div>
                          <div className="table-cell accuracy">
                            <span className={`accuracy-score ${getPerformanceColor(entry.overallPercentage)}`}>
                              {entry.overallPercentage}%
                            </span>
                          </div>
                          <div className="table-cell best">
                            <span className={`best-score ${getPerformanceColor(entry.bestScore)}`}>
                              {entry.bestScore}%
                            </span>
                          </div>
                          <div className="table-cell average">
                            <span className={`average-score ${getPerformanceColor(entry.averageScore)}`}>
                              {entry.averageScore}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-leaderboard">
                <div className="empty-icon">🎯</div>
                <h3>No Data Available</h3>
                <p>
                  {selectedLanguage !== 'all' || selectedTimeframe !== 'all'
                    ? 'No quiz results found for the selected filters.'
                    : 'No users have taken quizzes yet. Be the first to appear on the leaderboard!'
                  }
                </p>
                {!user && (
                  <div className="login-prompt">
                    <p>Want to compete? <a href="/register">Sign up</a> and start taking quizzes!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;