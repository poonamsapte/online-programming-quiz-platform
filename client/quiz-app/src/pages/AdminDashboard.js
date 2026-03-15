import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

// Admin Dashboard Overview
const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading admin statistics..." />;

  return (
    <div className="admin-overview">
      <h2>Admin Dashboard Overview</h2>
      
      {stats && (
        <>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalUsers}</span>
                <span className="stat-label">Total Users</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">❓</div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalQuestions}</span>
                <span className="stat-label">Total Questions</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalQuizzes}</span>
                <span className="stat-label">Quizzes Taken</span>
              </div>
            </div>
          </div>

          <div className="admin-sections">
            <div className="questions-by-language">
              <h3>Questions by Language</h3>
              <div className="language-stats">
                {stats.questionsByLanguage.map((lang, index) => (
                  <div key={index} className="language-stat">
                    <span className="language-name">{lang._id}</span>
                    <span className="question-count">{lang.count} questions</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recent-results">
              <h3>Recent Quiz Results</h3>
              <div className="results-list">
                {stats.recentResults.map((result, index) => (
                  <div key={index} className="result-item">
                    <div className="result-user">{result.user.name}</div>
                    <div className="result-details">
                      <span className="result-language">{result.language}</span>
                      <span className="result-score">{result.percentage}%</span>
                      <span className="result-date">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Question Management Component
const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    language: '',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 'Medium'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/admin/questions');
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.options.every(option => option.trim())) {
      alert('All options must be filled');
      return;
    }

    if (!formData.options.includes(formData.correctAnswer)) {
      alert('Correct answer must be one of the options');
      return;
    }

    try {
      let response;
      if (editingQuestion) {
        response = await api.put(`/admin/questions/${editingQuestion._id}`, formData);
      } else {
        response = await api.post('/admin/questions', formData);
      }

      if (response.data.success) {
        fetchQuestions();
        resetForm();
        alert(editingQuestion ? 'Question updated!' : 'Question created!');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      language: question.language,
      questionText: question.questionText,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await api.delete(`/admin/questions/${questionId}`);
        if (response.data.success) {
          fetchQuestions();
          alert('Question deleted!');
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      language: '',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      difficulty: 'Medium'
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) return <LoadingSpinner message="Loading questions..." />;

  return (
    <div className="question-management">
      <div className="management-header">
        <h2>Question Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="add-question-btn"
        >
          {showForm ? 'Cancel' : 'Add New Question'}
        </button>
      </div>

      {showForm && (
        <div className="question-form-container">
          <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
          <form onSubmit={handleSubmit} className="question-form">
            <div className="form-row">
              <div className="form-group">
                <label>Language:</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  required
                >
                  <option value="">Select Language</option>
                  <option value="C">C</option>
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="HTML">HTML</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Difficulty:</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Question Text:</label>
              <textarea
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                required
                rows={3}
                placeholder="Enter your question here..."
              />
            </div>

            <div className="options-section">
              <label>Options:</label>
              {formData.options.map((option, index) => (
                <div key={index} className="option-input">
                  <span className="option-label">{String.fromCharCode(65 + index)}:</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Correct Answer:</label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                required
              >
                <option value="">Select Correct Answer</option>
                {formData.options.map((option, index) => (
                  option.trim() && (
                    <option key={index} value={option}>
                      {String.fromCharCode(65 + index)}: {option}
                    </option>
                  )
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingQuestion ? 'Update Question' : 'Create Question'}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="questions-list">
        <h3>Existing Questions ({questions.length})</h3>
        {questions.map((question, index) => (
          <div key={question._id} className="question-item">
            <div className="question-header">
              <span className="question-number">Q{index + 1}</span>
              <span className="question-language">{question.language}</span>
              <span className="question-difficulty">{question.difficulty}</span>
            </div>
            
            <div className="question-content">
              <div className="question-text">{question.questionText}</div>
              <div className="question-options">
                {question.options.map((option, optIndex) => (
                  <div 
                    key={optIndex} 
                    className={`option ${option === question.correctAnswer ? 'correct' : ''}`}
                  >
                    <span className="option-label">{String.fromCharCode(65 + optIndex)}:</span>
                    {option}
                    {option === question.correctAnswer && <span className="correct-mark">✓</span>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="question-actions">
              <button onClick={() => handleEdit(question)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(question._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-nav">
          <h2>Admin Panel</h2>
          <nav className="admin-menu">
            <Link 
              to="/admin" 
              className={currentPath === '/admin' ? 'active' : ''}
            >
              📊 Overview
            </Link>
            <Link 
              to="/admin/questions" 
              className={currentPath === '/admin/questions' ? 'active' : ''}
            >
              ❓ Questions
            </Link>
            <Link 
              to="/admin/users" 
              className={currentPath === '/admin/users' ? 'active' : ''}
            >
              👥 Users
            </Link>
          </nav>
        </div>
      </div>

      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/questions" element={<QuestionManagement />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div className="user-management">
      <h2>User Management</h2>
      
      <div className="users-table">
        <div className="table-header">
          <div className="header-cell">Name</div>
          <div className="header-cell">Email</div>
          <div className="header-cell">Role</div>
          <div className="header-cell">Joined</div>
        </div>
        
        <div className="table-body">
          {users.map((user, index) => (
            <div key={user._id} className="table-row">
              <div className="table-cell">{user.name}</div>
              <div className="table-cell">{user.email}</div>
              <div className="table-cell">
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <div className="table-cell">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;