import React, { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar({ currentPage, setCurrentPage, user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-brand" onClick={() => setCurrentPage('home')}>
        🍄FungiFinder
      </div>

      <div className="nav-links">
        <button
          className={currentPage === 'home' ? 'active' : ''}
          onClick={() => setCurrentPage('home')}
        >
          Home
        </button>
        <button
          className={currentPage === 'identify' ? 'active' : ''}
          onClick={() => setCurrentPage('identify')}
        >
          Identify
        </button>
        <button
          className={currentPage === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentPage('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={currentPage === 'map' ? 'active' : ''}
          onClick={() => setCurrentPage('map')}
        >
          Map
        </button>
        <button
          className={currentPage === 'history' ? 'active' : ''}
          onClick={() => setCurrentPage('history')}
        >
          Records
        </button>
        <button
          className={currentPage === 'chatbot' ? 'active' : ''}
          onClick={() => setCurrentPage('chatbot')}
        >
          🤖 Assistant
        </button>

        {/* Admin Panel - admins only */}
        {user && user.role === 'admin' && (
          <button
            className={currentPage === 'admin' ? 'active' : ''}
            onClick={() => setCurrentPage('admin')}
          >
            🛠️ Admin
          </button>
        )}
      </div>

      <div className="nav-auth">
        {user ? (
          <>
            <span className="user-name">
              👤 {user.name}
              {user.role !== 'user' && (
                <span style={{
                  fontSize: '0.68rem',
                  marginLeft: '6px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: user.role === 'admin'
                    ? 'rgba(255, 118, 117, 0.25)'
                    : 'rgba(116, 185, 255, 0.25)',
                  color: user.role === 'admin' ? '#ff7675' : '#74b9ff'
                }}>
                  {user.role.toUpperCase()}
                </span>
              )}
            </span>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setCurrentPage('login')}>Login</button>
            <button className="register-btn" onClick={() => setCurrentPage('register')}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;