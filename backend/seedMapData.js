const mongoose = require('mongoose');
require('dotenv').config();
const Identification = require('./models/Identification');

mongoose.connect(process.env.MONGODB_URI);

const sampleData = [
  { species: 'Amanita', toxicity: 'poisonous', confidence: 0.92, location: { latitude: 7.2564, longitude: 80.5914, address: 'Kandy, Central Province' } },
  { species: 'Amanita', toxicity: 'poisonous', confidence: 0.88, location: { latitude: 6.0535, longitude: 80.2210, address: 'Galle, Southern Province' } },
  { species: 'Agaricus', toxicity: 'edible', confidence: 0.95, location: { latitude: 7.4818, longitude: 80.3609, address: 'Kurunegala, North Western' } },
  { species: 'Boletus', toxicity: 'edible', confidence: 0.91, location: { latitude: 6.9271, longitude: 79.8612, address: 'Colombo, Western Province' } },
  { species: 'Cortinarius', toxicity: 'poisonous', confidence: 0.87, location: { latitude: 6.8848, longitude: 80.3964, address: 'Ratnapura, Sabaragamuwa' } },
  { species: 'Edible_Fungi', toxicity: 'edible', confidence: 0.94, location: { latitude: 7.8731, longitude: 80.7718, address: 'Matale, Central Province' } },
  { species: 'Hygrocybe', toxicity: 'edible', confidence: 0.89, location: { latitude: 6.9934, longitude: 81.0550, address: 'Badulla, Uva Province' } },
  { species: 'Poisonous_Fungi', toxicity: 'poisonous', confidence: 0.96, location: { latitude: 7.0840, longitude: 80.0098, address: 'Kegalle, Sabaragamuwa' } },
  { species: 'Russula', toxicity: 'suspicious', confidence: 0.78, location: { latitude: 6.5854, longitude: 79.9607, address: 'Kalutara, Western Province' } },
  { species: 'Lactarius', toxicity: 'suspicious', confidence: 0.82, location: { latitude: 7.4675, longitude: 80.6234, address: 'Dambulla, Central Province' } },
  { species: 'Entoloma', toxicity: 'suspicious', confidence: 0.75, location: { latitude: 6.7106, longitude: 80.3862, address: 'Embilipitiya, Sabaragamuwa' } },
  { species: 'Amanita', toxicity: 'poisonous', confidence: 0.93, location: { latitude: 7.3440, longitude: 81.6747, address: 'Batticaloa, Eastern Province' } },
  { species: 'Boletus', toxicity: 'edible', confidence: 0.90, location: { latitude: 6.1240, longitude: 80.1060, address: 'Hikkaduwa, Southern Province' } },
  { species: 'Poisonous_Fungi', toxicity: 'poisonous', confidence: 0.91, location: { latitude: 7.9403, longitude: 81.0188, address: 'Polonnaruwa, North Central' } },
  { species: 'Edible_Fungi', toxicity: 'edible', confidence: 0.88, location: { latitude: 8.3114, longitude: 80.4037, address: 'Anuradhapura, North Central' } },
  { species: 'Suillus', toxicity: 'suspicious', confidence: 0.72, location: { latitude: 6.8211, longitude: 80.9478, address: 'Ella, Uva Province' } },
  { species: 'Cortinarius', toxicity: 'poisonous', confidence: 0.85, location: { latitude: 6.9497, longitude: 80.7891, address: 'Nuwara Eliya, Central Province' } },
  { species: 'Agaricus', toxicity: 'edible', confidence: 0.93, location: { latitude: 7.1016, longitude: 80.5988, address: 'Nawalapitiya, Central Province' } },
  { species: 'Hygrocybe', toxicity: 'edible', confidence: 0.86, location: { latitude: 6.4381, longitude: 80.0028, address: 'Bentota, Southern Province' } },
  { species: 'Amanita', toxicity: 'poisonous', confidence: 0.94, location: { latitude: 7.5645, longitude: 80.4674, address: 'Chilaw, North Western' } },
];

async function seed() {
  for (const data of sampleData) {
    const record = new Identification({
      species: data.species,
      confidence: data.confidence,
      toxicity: data.toxicity,
      location: data.location,
      imagePath: '/uploads/sample.jpg',
      safetyWarning: data.toxicity === 'poisonous' ? 'DANGER: This is a poisonous species!' : data.toxicity === 'edible' ? 'This appears to be edible. Always verify with an expert.' : 'Suspicious species. Do not consume.',
      allPredictions: [{ species: data.species, confidence: data.confidence, toxicity: data.toxicity }],
    });
    await record.save();
    console.log(`Added: ${data.species} at ${data.location.address}`);
  }
  console.log('\nDone! 20 sample records added across Sri Lanka.');
  mongoose.connection.close();
}

seed();