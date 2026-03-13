const mongoose = require('mongoose');

const identificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  imagePath: {
    type: String,
    required: true
  },
  species: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  toxicity: {
    type: String,
    enum: ['edible', 'poisonous', 'suspicious', 'unknown'],
    required: true
  },
  allPredictions: [{
    species: String,
    confidence: Number,
    toxicity: String
  }],
  safetyWarning: {
    type: String
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: 'Unknown' }
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Identification', identificationSchema);