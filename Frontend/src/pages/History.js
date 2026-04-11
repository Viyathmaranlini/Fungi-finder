import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';

const API_URL = 'http://localhost:5000/api';

function History({ token, user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;

      if (user && user.id) {
        // Fetch logged-in user's records
        response = await axios.get(`${API_URL}/identify/user/${user.id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
      } else {
        // Fetch all records (public)
        response = await axios.get(`${API_URL}/identify/history`);
      }

      setRecords(response.data.data);
    } catch (err) {
      setError('Failed to load history. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/identify/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setRecords(records.filter(record => record._id !== id));
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const getToxicityIcon = (toxicity) => {
    switch (toxicity) {
      case 'edible': return '✅';
      case 'poisonous': return '☠️';
      default: return '⚠️';
    }
  };

  const getToxicityClass = (toxicity) => {
    switch (toxicity) {
      case 'edible': return 'toxicity-edible';
      case 'poisonous': return 'toxicity-poisonous';
      default: return 'toxicity-suspicious';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="history">
      <div className="history-header">
        <div>
          <h1>📋 Identification Records</h1>
          <p className="subtitle">
            {user ? `${user.name}'s identification history` : 'All identification history'}
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchHistory}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading records...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <span>❌</span>
          <p>{error}</p>
          <button onClick={fetchHistory}>Try Again</button>
        </div>
      ) : records.length === 0 ? (
        <div className="no-records">
          <span>🍄</span>
          <h3>No Records Yet</h3>
          <p>{user ? 'Start by identifying your first mushroom!' : 'No identifications have been made yet.'}</p>
        </div>
      ) : (
        <>
          <div className="records-stats">
            <div className="stat">
              <span className="stat-number">{records.length}</span>
              <span className="stat-label">Total Records</span>
            </div>
            <div className="stat">
              <span className="stat-number">{records.filter(r => r.toxicity === 'edible').length}</span>
              <span className="stat-label">Edible</span>
            </div>
            <div className="stat">
              <span className="stat-number">{records.filter(r => r.toxicity === 'poisonous').length}</span>
              <span className="stat-label">Poisonous</span>
            </div>
            <div className="stat">
              <span className="stat-number">{records.filter(r => r.toxicity === 'suspicious').length}</span>
              <span className="stat-label">Suspicious</span>
            </div>
          </div>

          <div className="records-grid">
            {records.map((record) => (
              <div key={record._id} className={`record-card ${getToxicityClass(record.toxicity)}`}>
                <div className="record-image">
                  <img 
                    src={`http://localhost:5000${record.imagePath}`} 
                    alt={record.species}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span className={`toxicity-badge ${record.toxicity}`}>
                    {getToxicityIcon(record.toxicity)} {record.toxicity}
                  </span>
                </div>
                <div className="record-content">
                  <h3>{record.species}</h3>
                  <div className="record-details">
                    <p><strong>Confidence:</strong> {(record.confidence * 100).toFixed(1)}%</p>
                    <p><strong>Date:</strong> {formatDate(record.createdAt)}</p>
                    {record.location && record.location.latitude && (
                      <p><strong>Location:</strong> {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}</p>
                    )}
                  </div>
                  <div className="record-actions">
                    <button className="delete-btn" onClick={() => handleDelete(record._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default History;