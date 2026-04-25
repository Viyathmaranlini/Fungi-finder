import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Identify.css';

const API_URL = 'http://localhost:5000/api';

function Identify({ token, user, setCurrentPage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null, address: '' });
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location'
          });
        },
        (error) => {
          console.log('Location not available:', error);
        }
      );
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Show disclaimer before identifying
  const handleIdentifyClick = () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }
    setShowDisclaimer(true);
  };

  // Proceed with identification after disclaimer accepted
  const handleConfirmIdentify = async () => {
    setShowDisclaimer(false);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);
    formData.append('address', location.address);

    if (user && user.id) {
      formData.append('userId', user.id);
    }

    try {
      const response = await axios.post(`${API_URL}/identify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        timeout: 60000,
      });

      console.log('Response:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Error:', err);
      if (err.response) {
        setError(err.response.data.error || 'Failed to identify mushroom');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to connect to server. Make sure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setShowDisclaimer(false);
  };

  const getToxicityClass = (toxicity) => {
    switch (toxicity) {
      case 'edible': return 'toxicity-edible';
      case 'poisonous': return 'toxicity-poisonous';
      default: return 'toxicity-suspicious';
    }
  };

  const getToxicityIcon = (toxicity) => {
    switch (toxicity) {
      case 'edible': return '✅';
      case 'poisonous': return '☠️';
      default: return '⚠️';
    }
  };

  return (
    <div className="identify">
      <div className="identify-header">
        <h1>🔍 Identify Mushroom</h1>
        <p className="subtitle">Upload a mushroom image for AI-powered identification</p>
        {!user && (
          <p style={{ color: '#fdcb6e', fontSize: '0.9rem', marginTop: '10px' }}>
            ⚠️ <span 
              style={{ cursor: 'pointer', textDecoration: 'underline' }} 
              onClick={() => setCurrentPage('login')}
            >
              Login
            </span> to save identifications to your account
          </p>
        )}
      </div>

      {/* AI Disclaimer Banner */}
      <div className="ai-disclaimer-banner">
        <span className="disclaimer-icon">🤖</span>
        <div className="disclaimer-text">
          <strong>AI-Powered Identification</strong>
          <p>This system uses artificial intelligence with 80.7% training accuracy. 
          Results should NOT be used as the sole basis for determining mushroom safety. 
          Always consult a qualified mycologist before consuming any wild mushroom.</p>
        </div>
      </div>

      <div className="identify-container">
        <div className="upload-section">
          <div 
            className={`drop-zone ${preview ? 'has-image' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="preview-image" />
            ) : (
              <div className="drop-content">
                <span className="upload-icon">📷</span>
                <p>Drag & Drop or Click to Upload</p>
                <span className="upload-hint">Supports: JPG, PNG, WEBP</span>
              </div>
            )}
          </div>

          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {location.latitude && (
            <div className="location-info">
              📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          )}

          <div className="button-group">
            {preview && (
              <button className="reset-btn" onClick={handleReset}>
                🔄 Reset
              </button>
            )}
            <button 
              className="identify-btn" 
              onClick={handleIdentifyClick}
              disabled={!selectedFile || loading}
            >
              {loading ? '🔄 Analyzing...' : '🔍 Identify Mushroom'}
            </button>
          </div>

          {error && <div className="error-message">❌ {error}</div>}
        </div>

        {/* Disclaimer Confirmation Modal */}
        {showDisclaimer && (
          <div className="disclaimer-modal-overlay" onClick={() => setShowDisclaimer(false)}>
            <div className="disclaimer-modal" onClick={(e) => e.stopPropagation()}>
              <div className="disclaimer-modal-icon">⚠️</div>
              <h3>Important Disclaimer</h3>
              <p>
                This AI identification system is a <strong>research tool</strong> and should 
                <strong> NOT</strong> be used as the sole method to determine if a mushroom 
                is safe to eat.
              </p>
              <ul className="disclaimer-list">
                <li>AI accuracy is approximately 80.7% on training data</li>
                <li>Some species may be visually similar and misidentified</li>
                <li>Always verify with a qualified mycologist or expert</li>
                <li>When in doubt, do NOT consume the mushroom</li>
              </ul>
              <div className="disclaimer-modal-actions">
                <button className="disclaimer-cancel" onClick={() => setShowDisclaimer(false)}>
                  Cancel
                </button>
                <button className="disclaimer-accept" onClick={handleConfirmIdentify}>
                  I Understand, Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="result-section">
            <h2>🎯 Identification Result</h2>
            
            <div className={`main-result ${getToxicityClass(result.top_prediction.toxicity)}`}>
              <span className="toxicity-icon">{getToxicityIcon(result.top_prediction.toxicity)}</span>
              <div className="result-details">
                <h3>{result.top_prediction.species}</h3>
                <p className="confidence">
                  Confidence: <strong>{(result.top_prediction.confidence * 100).toFixed(1)}%</strong>
                </p>
                <p className="toxicity-label">
                  Status: <strong>{result.top_prediction.toxicity.toUpperCase()}</strong>
                </p>
              </div>
            </div>

            <div className="safety-warning">
              {result.safety_warning}
            </div>

            {/* Responsible AI Notice */}
            <div className="responsible-ai-notice">
              <span>🔬</span>
              <p>
                <strong>Responsible AI Notice:</strong> This prediction is generated by a 
                MobileNetV2 deep learning model. The confidence score indicates the model's 
                certainty level. For your safety, always seek expert verification regardless 
                of the confidence score shown.
              </p>
            </div>

            {result.predictions && result.predictions.length > 1 && (
              <div className="other-predictions">
                <h4>Other Possibilities:</h4>
                {result.predictions.slice(1).map((pred, index) => (
                  <div key={index} className={`prediction-item ${getToxicityClass(pred.toxicity)}`}>
                    <span>{getToxicityIcon(pred.toxicity)}</span>
                    <span className="pred-name">{pred.species}</span>
                    <span className="pred-confidence">{(pred.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}

            <div className="result-saved">
              {user ? '✅ Result saved to your account!' : '⚠️ Login to save results to your account'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Identify;