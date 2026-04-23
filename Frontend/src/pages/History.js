import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';

const API_URL = 'http://localhost:5000/api';

function History({ token, user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterToxicity, setFilterToxicity] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (user && user.id) {
        response = await axios.get(`${API_URL}/identify/user/${user.id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
      } else {
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
    if (!window.confirm('Are you sure you want to delete this record?')) return;
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter, Search, Sort
  const filteredRecords = records
    .filter(r => {
      if (filterToxicity !== 'all' && r.toxicity !== filterToxicity) return false;
      if (searchTerm && !r.species.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'confidence-desc': return b.confidence - a.confidence;
        case 'confidence-asc': return a.confidence - b.confidence;
        case 'species-asc': return a.species.localeCompare(b.species);
        case 'species-desc': return b.species.localeCompare(a.species);
        default: return 0;
      }
    });

  return (
    <div className="history">
      <div className="history-header">
        <div>
          <h1>📋 Identification Records</h1>
          <p className="subtitle">
            {user ? `${user.name}'s identification history` : 'All identification history'}
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchHistory}>🔄 Refresh</button>
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
          {/* Stats */}
          <div className="records-stats">
            <div className="stat">
              <span className="stat-number">{records.length}</span>
              <span className="stat-label">Total Records</span>
            </div>
            <div className="stat">
              <span className="stat-number edible-num">{records.filter(r => r.toxicity === 'edible').length}</span>
              <span className="stat-label">Edible</span>
            </div>
            <div className="stat">
              <span className="stat-number poisonous-num">{records.filter(r => r.toxicity === 'poisonous').length}</span>
              <span className="stat-label">Poisonous</span>
            </div>
            <div className="stat">
              <span className="stat-number suspicious-num">{records.filter(r => r.toxicity === 'suspicious').length}</span>
              <span className="stat-label">Suspicious</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="records-controls">
            {/* Search */}
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search species..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterToxicity === 'all' ? 'active' : ''}`}
                onClick={() => setFilterToxicity('all')}
              >All</button>
              <button
                className={`filter-btn edible ${filterToxicity === 'edible' ? 'active' : ''}`}
                onClick={() => setFilterToxicity('edible')}
              >✅ Edible</button>
              <button
                className={`filter-btn poisonous ${filterToxicity === 'poisonous' ? 'active' : ''}`}
                onClick={() => setFilterToxicity('poisonous')}
              >☠️ Poisonous</button>
              <button
                className={`filter-btn suspicious ${filterToxicity === 'suspicious' ? 'active' : ''}`}
                onClick={() => setFilterToxicity('suspicious')}
              >⚠️ Suspicious</button>
            </div>

            {/* Sort & View */}
            <div className="sort-view">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="confidence-desc">Highest Confidence</option>
                <option value="confidence-asc">Lowest Confidence</option>
                <option value="species-asc">Species A-Z</option>
                <option value="species-desc">Species Z-A</option>
              </select>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >▦</button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >☰</button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="results-count">
            Showing {filteredRecords.length} of {records.length} records
            {searchTerm && ` matching "${searchTerm}"`}
            {filterToxicity !== 'all' && ` (${filterToxicity})`}
          </p>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="records-grid">
              {filteredRecords.map((record) => (
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
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="records-list">
              <div className="list-header">
                <span className="list-col species-col">Species</span>
                <span className="list-col toxicity-col">Toxicity</span>
                <span className="list-col confidence-col">Confidence</span>
                <span className="list-col date-col">Date</span>
                <span className="list-col location-col">Location</span>
                <span className="list-col action-col">Action</span>
              </div>
              {filteredRecords.map((record) => (
                <div key={record._id} className={`list-row ${record.toxicity}`}>
                  <span className="list-col species-col">
                    <img
                      src={`http://localhost:5000${record.imagePath}`}
                      alt={record.species}
                      className="list-thumb"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {record.species}
                  </span>
                  <span className="list-col toxicity-col">
                    <span className={`list-toxicity-badge ${record.toxicity}`}>
                      {getToxicityIcon(record.toxicity)} {record.toxicity}
                    </span>
                  </span>
                  <span className="list-col confidence-col">{(record.confidence * 100).toFixed(1)}%</span>
                  <span className="list-col date-col">{formatDate(record.createdAt)}</span>
                  <span className="list-col location-col">
                    {record.location && record.location.latitude
                      ? `${record.location.latitude.toFixed(4)}, ${record.location.longitude.toFixed(4)}`
                      : 'N/A'}
                  </span>
                  <span className="list-col action-col">
                    <button className="delete-btn-sm" onClick={() => handleDelete(record._id)}>🗑️</button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredRecords.length === 0 && (
            <div className="no-results">
              <p>No records match your search or filter.</p>
              <button onClick={() => { setSearchTerm(''); setFilterToxicity('all'); }}>Clear Filters</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default History;