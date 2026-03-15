import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          <span className="logo-icon">🧠</span>
          QuizMaster
        </Link>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          
          <Link to="/leaderboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Leaderboard
          </Link>

          {user ? (
            <>
              <Link to="/languages" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Take Quiz
              </Link>
              
              <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}
              
              <div className="nav-user-info">
                <span className="user-name">Hi, {user.name}</span>
                <button onClick={handleLogout} className="nav-button logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-button" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-button primary" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;