import React, { useEffect, useState } from 'react';
import './Home.css';

function Home({ setCurrentPage }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`home ${isVisible ? 'visible' : ''}`}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🧬</span>
            <span>AI-Powered Technology</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">Mushroom</span>
            <span className="title-line gradient-text">Safety System</span>
          </h1>
          
          <p className="hero-description">
            Advanced artificial intelligence for accurate mushroom identification 
            and toxicity analysis. Protect yourself with instant safety assessments.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary btn-large" onClick={() => setCurrentPage('identify')}>
              <span>🔍</span> Start Identification
            </button>
            <button className="btn-secondary" onClick={() => setCurrentPage('map')}>
              <span>🗺️</span> Explore Map
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">8,611</div>
              <div className="stat-label">Training Images</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">12</div>
              <div className="stat-label">Species</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">80.7%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-circle circle-1"></div>
          <div className="visual-circle circle-2"></div>
          <div className="visual-circle circle-3"></div>
          <div className="mushroom-emoji">🍄</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2>Powerful Capabilities</h2>
          <p>Everything you need for safe mushroom identification</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <span>📷</span>
            </div>
            <h3>Image Recognition</h3>
            <p>Upload any mushroom photo and get instant AI-powered species identification</p>
            <div className="feature-glow"></div>
          </div>

          <div className="feature-card featured">
            <div className="feature-icon">
              <span>⚠️</span>
            </div>
            <h3>Toxicity Analysis</h3>
            <p>Real-time safety warnings with detailed toxicity levels and recommendations</p>
            <div className="feature-glow"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span>🗺️</span>
            </div>
            <h3>Location Mapping</h3>
            <p>Interactive map showing mushroom sightings and danger zones in your area</p>
            <div className="feature-glow"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span>📊</span>
            </div>
            <h3>History Tracking</h3>
            <p>Keep detailed records of all your identifications with timestamps and locations</p>
            <div className="feature-glow"></div>
          </div>
        </div>
      </section>

      {/* Toxicity Guide Section */}
      <section className="toxicity-section">
        <div className="section-header">
          <span className="section-badge">Safety Guide</span>
          <h2>Toxicity Classification</h2>
          <p>Understanding our three-tier safety system</p>
        </div>

        <div className="toxicity-grid">
          <div className="toxicity-card edible">
            <div className="toxicity-header">
              <span className="toxicity-icon">✅</span>
              <h3>Edible</h3>
            </div>
            <p>Safe for consumption when properly identified. Always verify with an expert before eating wild mushrooms.</p>
            <div className="toxicity-bar">
              <div className="bar-fill edible-fill"></div>
            </div>
            <span className="toxicity-level">SAFE</span>
          </div>

          <div className="toxicity-card suspicious">
            <div className="toxicity-header">
              <span className="toxicity-icon">⚠️</span>
              <h3>Suspicious</h3>
            </div>
            <p>Requires expert verification. Do not consume without professional confirmation from a mycologist.</p>
            <div className="toxicity-bar">
              <div className="bar-fill suspicious-fill"></div>
            </div>
            <span className="toxicity-level">CAUTION</span>
          </div>

          <div className="toxicity-card poisonous">
            <div className="toxicity-header">
              <span className="toxicity-icon">☠️</span>
              <h3>Poisonous</h3>
            </div>
            <p>Dangerous! Do not touch or consume under any circumstances. Can cause severe illness or death.</p>
            <div className="toxicity-bar">
              <div className="bar-fill poisonous-fill"></div>
            </div>
            <span className="toxicity-level">DANGER</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Identify?</h2>
          <p>Upload your first mushroom image and experience the power of AI identification</p>
          <button className="btn-primary btn-large" onClick={() => setCurrentPage('identify')}>
            Get Started Now <span>→</span>
          </button>
        </div>
        <div className="cta-decoration">
          <div className="deco-circle"></div>
          <div className="deco-circle"></div>
        </div>
      </section>
    </div>
  );
}

export default Home;