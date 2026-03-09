import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Map() {
  // Sri Lanka center coordinates
  const center = [7.8731, 80.7718];
  
  // Sample mushroom sightings
  const sightings = [
    {
      id: 1,
      position: [6.9271, 79.8612],
      species: 'Agaricus bisporus',
      toxicity: 'edible',
      date: '2026-02-04'
    },
    {
      id: 2,
      position: [7.2906, 80.6337],
      species: 'Amanita phalloides',
      toxicity: 'poisonous',
      date: '2026-02-03'
    },
    {
      id: 3,
      position: [6.9344, 80.6115],
      species: 'Boletus edulis',
      toxicity: 'edible',
      date: '2026-02-02'
    }
  ];

  const getToxicityColor = (toxicity) => {
    switch (toxicity) {
      case 'edible': return '#4CAF50';
      case 'poisonous': return '#f44336';
      default: return '#FF9800';
    }
  };

  return (
    <div className="map-page">
      <h1>🗺️ Mushroom Sightings Map</h1>
      <p className="subtitle">View mushroom discoveries across Sri Lanka</p>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot edible"></span>
          <span>Edible</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot suspicious"></span>
          <span>Suspicious</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot poisonous"></span>
          <span>Poisonous</span>
        </div>
      </div>

      <div className="map-container">
        <MapContainer 
          center={center} 
          zoom={8} 
          style={{ height: '500px', width: '100%', borderRadius: '15px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {sightings.map((sighting) => (
            <Marker key={sighting.id} position={sighting.position}>
              <Popup>
                <div className="popup-content">
                  <h4>{sighting.species}</h4>
                  <p style={{ color: getToxicityColor(sighting.toxicity) }}>
                    <strong>{sighting.toxicity.toUpperCase()}</strong>
                  </p>
                  <p>Date: {sighting.date}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-stats">
        <div className="map-stat">
          <h3>{sightings.length}</h3>
          <p>Total Sightings</p>
        </div>
        <div className="map-stat">
          <h3>{sightings.filter(s => s.toxicity === 'edible').length}</h3>
          <p>Edible Found</p>
        </div>
        <div className="map-stat">
          <h3>{sightings.filter(s => s.toxicity === 'poisonous').length}</h3>
          <p>Poisonous Found</p>
        </div>
      </div>
    </div>
  );
}

export default Map;