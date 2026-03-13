const express = require('express');
const Identification = require('../models/Identification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's identification history
router.get('/', auth, async (req, res) => {
    try {
        const records = await Identification.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            count: records.length,
            records
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all records (for map - public)
router.get('/all', async (req, res) => {
    try {
        const records = await Identification.find({
            'location.latitude': { $exists: true },
            'location.longitude': { $exists: true }
        }).select('species toxicity location createdAt');

        res.json({
            count: records.length,
            records
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get statistics
router.get('/stats', async (req, res) => {
    try {
        const totalIdentifications = await Identification.countDocuments();
        
        const toxicityStats = await Identification.aggregate([
            { $group: { _id: '$toxicity', count: { $sum: 1 } } }
        ]);

        const speciesStats = await Identification.aggregate([
            { $group: { _id: '$species', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            totalIdentifications,
            toxicityStats,
            topSpecies: speciesStats
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;