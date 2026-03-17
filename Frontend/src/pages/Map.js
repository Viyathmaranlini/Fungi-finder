import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './Map.css';

const API_URL = 'http://localhost:5000/api';

function Map() {
  const center = [7.8731, 80.7718];
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    edible: true,
    suspicious: true,
    poisonous: true
  });

  const fetchMapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/identify/map`);
      if (response.data.success) {
        setSightings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError('Failed to load map data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const toggleFilter = (toxicity) => {
    setFilters(prev => ({ ...prev, [toxicity]: !prev[toxicity] }));
  };

  const getToxicityColor = (toxicity) => {
    switch (toxicity) {
      case 'edible': return '#00b894';
      case 'poisonous': return '#ff7675';
      default: return '#fdcb6e';
    }
  };

  const getToxicityIcon = (toxicity) => {
    switch (toxicity) {
      case 'edible': return '✅';
      case 'poisonous': return '☠️';
      default: return '⚠️';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredSightings = sightings.filter(s => filters[s.toxicity]);

  const totalEdible = sightings.filter(s => s.toxicity === 'edible').length;
  const totalPoisonous = sightings.filter(s => s.toxicity === 'poisonous').length;
  const totalSuspicious = sightings.filter(s => s.toxicity === 'suspicious').length;

  return (
    <div className="map-page">
      <div className="map-header">
        <div>
          <h1>🗺️ Mushroom Sightings Map</h1>
          <p className="subtitle">GPS-tagged mushroom discoveries across Sri Lanka</p>
        </div>
        <button className="map-refresh-btn" onClick={fetchMapData}>🔄 Refresh</button>
      </div>

      {/* Filter Toggles */}
      <div className="map-filters">
        <span className="filter-label">Filter by toxicity:</span>
        <button
          className={`filter-btn edible ${filters.edible ? 'active' : ''}`}
          onClick={() => toggleFilter('edible')}
        >
          <span className="filter-dot edible"></span>
          Edible ({totalEdible})
        </button>
        <button
          className={`filter-btn suspicious ${filters.suspicious ? 'active' : ''}`}
          onClick={() => toggleFilter('suspicious')}
        >
          <span className="filter-dot suspicious"></span>
          Suspicious ({totalSuspicious})
        </button>
        <button
          className={`filter-btn poisonous ${filters.poisonous ? 'active' : ''}`}
          onClick={() => toggleFilter('poisonous')}
        >
          <span className="filter-dot poisonous"></span>
          Poisonous ({totalPoisonous})
        </button>
      </div>

      {/* Map */}
      <div className="map-wrapper">
        {loading ? (
          <div className="map-loading">
            <div className="map-spinner"></div>
            <p>Loading map data...</p>
          </div>
        ) : error ? (
          <div className="map-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchMapData}>Try Again</button>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={8}
            style={{ height: '550px', width: '100%', borderRadius: '16px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {filteredSightings.map((sighting) => (
              <CircleMarker
                key={sighting._id}
                center={[sighting.location.latitude, sighting.location.longitude]}
                radius={10}
                fillColor={getToxicityColor(sighting.toxicity)}
                color={getToxicityColor(sighting.toxicity)}
                weight={2}
                opacity={0.9}
                fillOpacity={0.6}
              >
                <Popup>
                  <div className="popup-content">
                    <div className="popup-header" style={{ borderBottomColor: getToxicityColor(sighting.toxicity) }}>
                      <span className="popup-icon">{getToxicityIcon(sighting.toxicity)}</span>
                      <h4>{sighting.species}</h4>
                    </div>
                    <div className="popup-body">
                      <div className="popup-toxicity" style={{ color: getToxicityColor(sighting.toxicity), background: getToxicityColor(sighting.toxicity) + '20' }}>
                        {sighting.toxicity.toUpperCase()}
                      </div>
                      {sighting.location.address && sighting.location.address !== 'Unknown' && (
                        <p className="popup-location">📍 {sighting.location.address}</p>
                      )}
                      <p className="popup-date">🕐 {formatDate(sighting.createdAt)}</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Stats */}
      <div className="map-stats">
        <div className="map-stat total">
          <div className="map-stat-icon">🍄</div>
          <h3>{sightings.length}</h3>
          <p>Total Sightings</p>
        </div>
        <div className="map-stat edible">
          <div className="map-stat-icon">✅</div>
          <h3>{totalEdible}</h3>
          <p>Edible</p>
        </div>
        <div className="map-stat suspicious">
          <div className="map-stat-icon">⚠️</div>
          <h3>{totalSuspicious}</h3>
          <p>Suspicious</p>
        </div>
        <div className="map-stat poisonous">
          <div className="map-stat-icon">☠️</div>
          <h3>{totalPoisonous}</h3>
          <p>Poisonous</p>
        </div>
        <div className="map-stat showing">
          <div className="map-stat-icon">👁️</div>
          <h3>{filteredSightings.length}</h3>
          <p>Showing</p>
        </div>
      </div>
    </div>
  );
}

export default Map;