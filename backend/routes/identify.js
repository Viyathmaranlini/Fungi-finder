const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Identification = require('../models/Identification');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Helper: Extract userId from token (optional - doesn't block if no token)
const extractUserId = (req) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId;
    }
  } catch (err) {
    console.log('No valid token, proceeding without userId');
  }

  // Fallback to body userId
  return req.body.userId || null;
};

// POST /api/identify - Identify mushroom and save to database
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log('📷 Image received:', req.file.filename);

    // Extract userId from token or body
    const userId = extractUserId(req);
    console.log('👤 User ID:', userId || 'anonymous');

    // Call AI service
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    let aiResponse;
    try {
      aiResponse = await axios.post('http://localhost:5001/predict', formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });
      console.log('🤖 AI Response:', aiResponse.data);
    } catch (aiError) {
      console.error('AI Service Error:', aiError.message);
      return res.status(500).json({ 
        error: 'AI service unavailable',
        message: 'Please make sure the AI service is running on port 5001'
      });
    }

    const prediction = aiResponse.data;

    // Get location from request body (optional)
    const location = {
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
      address: req.body.address || 'Unknown'
    };

    // Create identification record
    const identification = new Identification({
      userId: userId,
      imagePath: `/uploads/${req.file.filename}`,
      species: prediction.top_prediction.species,
      confidence: prediction.top_prediction.confidence,
      toxicity: prediction.top_prediction.toxicity,
      allPredictions: prediction.predictions,
      safetyWarning: prediction.safety_warning,
      location: location,
      notes: req.body.notes || ''
    });

    await identification.save();
    console.log('💾 Saved to database:', identification._id, '| User:', userId || 'anonymous');

    res.json({
      success: true,
      identification: identification,
      predictions: prediction.predictions,
      top_prediction: prediction.top_prediction,
      safety_warning: prediction.safety_warning,
      mode: prediction.mode
    });

  } catch (error) {
    console.error('Identification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/identify/history - Get all identifications
router.get('/history', async (req, res) => {
  try {
    const identifications = await Identification.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: identifications.length,
      data: identifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/identify/user/:userId - Get user's identifications
router.get('/user/:userId', async (req, res) => {
  try {
    const identifications = await Identification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: identifications.length,
      data: identifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/identify/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await Identification.countDocuments();
    const edible = await Identification.countDocuments({ toxicity: 'edible' });
    const poisonous = await Identification.countDocuments({ toxicity: 'poisonous' });
    const suspicious = await Identification.countDocuments({ toxicity: 'suspicious' });

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Identification.countDocuments({
      createdAt: { $gte: today }
    });

    // Get this week's count
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = await Identification.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Get species distribution
    const speciesDistribution = await Identification.aggregate([
      { $group: { _id: '$species', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get daily counts for last 7 days
    const dailyCounts = await Identification.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent activity
    const recentActivity = await Identification.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('species toxicity createdAt');

    // Get total users count
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      stats: {
        total,
        edible,
        poisonous,
        suspicious,
        todayCount,
        weekCount,
        totalUsers,
        speciesDistribution,
        dailyCounts,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/identify/map - Get data for map
router.get('/map', async (req, res) => {
  try {
    const identifications = await Identification.find({
      'location.latitude': { $ne: null },
      'location.longitude': { $ne: null }
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .select('species toxicity location createdAt');

    res.json({
      success: true,
      count: identifications.length,
      data: identifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/identify/:id - Delete identification
router.delete('/:id', async (req, res) => {
  try {
    const identification = await Identification.findByIdAndDelete(req.params.id);
    if (!identification) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '..', identification.imagePath);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;