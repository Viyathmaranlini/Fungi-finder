// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Configure middleware for CORS, JSON parsing, and URL encoding
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded mushroom images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB Atlas cloud database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import and register API route handlers
const authRoutes = require('./routes/auth');
const identifyRoutes = require('./routes/identify');

app.use('/api/auth', authRoutes);
app.use('/api/identify', identifyRoutes);

// Health check endpoint - shows API status and available endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: '🍄 Mushroom Safety API',
    status: 'Running',
    endpoints: {
      auth: '/api/auth',
      identify: '/api/identify',
      history: '/api/identify/history',
      stats: '/api/identify/stats',
      map: '/api/identify/map'
    }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log('🍄 MUSHROOM SAFETY BACKEND');
  console.log('='.repeat(50));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('='.repeat(50) + '\n');
});