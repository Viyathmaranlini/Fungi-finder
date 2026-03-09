import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Identify from './pages/Identify';
import History from './pages/History';
import Map from './pages/Map';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'identify':
        return <Identify token={token} user={user} setCurrentPage={setCurrentPage} />;
      case 'history':
        return <History token={token} user={user} />;
      case 'map':
        return <Map />;
      case 'dashboard':
        return <Dashboard token={token} user={user} />;
      case 'chatbot':
        return <Chatbot />;
      case 'login':
        return <Login onLogin={handleLogin} setCurrentPage={setCurrentPage} />;
      case 'register':
        return <Register onLogin={handleLogin} setCurrentPage={setCurrentPage} />;
      case 'admin':
        return <AdminPanel user={user} token={token} setCurrentPage={setCurrentPage} />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  if (loading) {
    return (
      <div className="App" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: '#fff', flexDirection: 'column', gap: '15px'
      }}>
        <div className="spinner"></div>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading Mushroom Safety System...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content" key={currentPage}>
        {renderPage()}
      </main>

      {/* Footer - show on most pages */}
      {!['login', 'register', 'chatbot'].includes(currentPage) && (
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>🍄 Mushroom Safety System</h3>
              <p>
                AI-powered mushroom identification and toxicity detection system.
                Helping keep foragers safe with advanced machine learning technology.
              </p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <p onClick={() => setCurrentPage('identify')}>🔍 Identify</p>
              <p onClick={() => setCurrentPage('map')}>🗺️ Sightings Map</p>
              <p onClick={() => setCurrentPage('history')}>📋 Records</p>
              <p onClick={() => setCurrentPage('chatbot')}>🤖 Assistant</p>
            </div>
            <div className="footer-section">
              <h4>Emergency</h4>
              <p>🚨 Emergency: 119</p>
              <p>🚑 Ambulance: 1990</p>
              <p>☎️ Poison Centre:</p>
              <p>   +94 12 3456789</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Mushroom Safety System. Final Year Project.</span>
            <span>Built with React, Node.js & TensorFlow</span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;

























