import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [languages, setLanguages] = useState([
    { language: 'Java', questionCount: '100+' },
    { language: 'C++', questionCount: '150+' },
    { language: 'Python', questionCount: '200+' },
    { language: 'HTML', questionCount: '80+' }
  ]);
  const [stats, setStats] = useState({
    totalUsers: 500,
    totalLanguages: 4,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available languages
        const languagesResponse = await api.get('/quizzes/languages');
        const fetchedLanguages = languagesResponse.data.success && languagesResponse.data.languages.length > 0
          ? languagesResponse.data.languages
          : [
            { language: 'Java', questionCount: '100+' },
            { language: 'C++', questionCount: '150+' },
            { language: 'Python', questionCount: '200+' },
            { language: 'HTML', questionCount: '80+' }
          ];
        setLanguages(fetchedLanguages);

        // Fetch basic stats for homepage
        const statsResponse = await api.get('/users/leaderboard?timeframe=all');
        if (statsResponse.data.success) {
          setStats({
            totalUsers: statsResponse.data.leaderboard.length || 500,
            totalLanguages: fetchedLanguages.length,
          });
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 className="hero-title" variants={itemVariants}>
            Master Programming with
            <span className="highlight"> Interactive Quizzes</span>
          </motion.h1>
          <motion.p className="hero-description" variants={itemVariants}>
            Test your programming knowledge across multiple languages.
            Track your progress, compete with others, and improve your coding skills.
          </motion.p>

          <motion.div className="hero-buttons" variants={itemVariants}>
            {user ? (
              <Link to="/languages" className="cta-button primary">
                Start Taking Quizzes
              </Link>
            ) : (
              <>
                <Link to="/register" className="cta-button primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="cta-button secondary">
                  Login
                </Link>
              </>
            )}
          </motion.div>

          {stats && (
            <motion.div className="hero-stats" variants={itemVariants}>
              <div className="stat">
                <span className="stat-number">{stats.totalUsers}+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">{stats.totalLanguages}</span>
                <span className="stat-label">Programming Languages</span>
              </div>
              <div className="stat">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Practice Questions</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="code-illustration glass-panel">
            <div className="code-line">
              <span className="code-keyword">function</span>
              <span className="code-function"> masterSkills</span>
              <span className="code-bracket">(</span>
              <span className="code-parameter">developer</span>
              <span className="code-bracket">) </span>
              <span className="code-keyword">&#123;</span>
            </div>
            <div className="code-line indent">
              <span className="code-keyword">const</span>
              <span className="code-function"> languages</span>
              <span className="code-keyword"> = </span>
              <span className="code-bracket">[</span>
              <span className="code-string">"Java"</span>
              <span className="code-bracket">, </span>
              <span className="code-string">"C++"</span>
              <span className="code-bracket">, </span>
              <span className="code-string">"HTML"</span>
              <span className="code-bracket">, </span>
              <span className="code-string">"Python"</span>
              <span className="code-bracket">];</span>
            </div>
            <div className="code-line indent">
              <span className="code-keyword">return</span>
              <span className="code-function"> successEngine</span>
              <span className="code-bracket">.</span>
              <span className="code-function">run</span>
              <span className="code-bracket">(</span>
              <span className="code-parameter">languages</span>
              <span className="code-bracket">);</span>
            </div>
            <div className="code-line">
              <span className="code-keyword">&#125;</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Languages Section */}
      <section className="languages-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Available Programming Languages
          </motion.h2>

          <div className="languages-grid">
            {languages.map((lang, index) => (
              <motion.div
                key={index}
                className="language-card glass-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="language-icon">
                  {lang.language === 'C' && '🔧'}
                  {lang.language === 'C++' && '⚙️'}
                  {lang.language === 'Java' && '☕'}
                  {lang.language === 'Python' && '🐍'}
                  {lang.language === 'JavaScript' && '⚡'}
                  {lang.language === 'HTML' && '🌐'}
                </div>
                <h3>{lang.language}</h3>
                <p>{lang.questionCount} Questions Available</p>
                {user && (
                  <Link
                    to={`/quiz/${lang.language.toLowerCase()}`}
                    className="language-link"
                  >
                    Start Quiz →
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose QuizMaster?
          </motion.h2>

          <div className="features-grid">
            {[
              { icon: '📚', title: 'Multiple Languages', desc: 'Practice with Java, C++, Python, HTML and more programming languages.' },
              { icon: '⏱️', title: 'Timed Quizzes', desc: 'Challenge yourself with time-limited questions to simulate real exam conditions.' },
              { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your learning progress with detailed analytics and performance insights.' },
              { icon: '🏆', title: 'Leaderboards', desc: 'Compete with other learners and see how you rank on the global leaderboard.' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Practice anywhere, anytime with our responsive design that works on all devices.' },
              { icon: '🎯', title: 'Instant Results', desc: 'Get immediate feedback on your answers with detailed explanations and solutions.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="feature-card glass-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="cta-content glass-panel cta-glass">
            <h2>Ready to Test Your Programming Skills?</h2>
            <p>Join thousands of developers improving their coding knowledge every day.</p>
            {!user ? (
              <div className="cta-buttons">
                <Link to="/register" className="cta-button primary large">
                  Sign Up Free
                </Link>
                <Link to="/leaderboard" className="cta-button secondary large">
                  View Leaderboard
                </Link>
              </div>
            ) : (
              <Link to="/languages" className="cta-button primary large">
                Start Your Next Quiz
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;