// Admin routes - handles user management, records management, and admin dashboard
// All routes require admin role authentication
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Identification = require('../models/Identification');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Middleware: Verify JWT token and check admin role
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET /api/admin/dashboard - Admin overview statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    // Identification statistics
    const totalIdentifications = await Identification.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Identification.countDocuments({ createdAt: { $gte: today } });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = await Identification.countDocuments({ createdAt: { $gte: weekAgo } });

    const toxicityStats = await Identification.aggregate([
      { $group: { _id: '$toxicity', count: { $sum: 1 } } }
    ]);

    // Top contributors
    const topContributors = await Identification.aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: '$userInfo.name',
          email: '$userInfo.email',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      dashboard: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
          recent: recentUsers
        },
        identifications: {
          total: totalIdentifications,
          today: todayCount,
          thisWeek: weekCount,
          toxicity: toxicityStats
        },
        topContributors
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email role createdAt');

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:userId/role - Change user role
router.put('/users/:userId/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!['user', 'researcher', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('name email role');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:userId - Delete user and all their records
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Delete user's identification records and images
    const userRecords = await Identification.find({ userId });
    for (const record of userRecords) {
      if (record.imagePath) {
        const imagePath = path.join(__dirname, '..', record.imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
    await Identification.deleteMany({ userId });

    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: `User "${user.name}" and all records deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/records - Get all identification records
router.get('/records', adminAuth, async (req, res) => {
  try {
    const records = await Identification.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .limit(100);

    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/records/:recordId - Delete any identification record
router.delete('/records/:recordId', adminAuth, async (req, res) => {
  try {
    const record = await Identification.findByIdAndDelete(req.params.recordId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Delete associated image
    if (record.imagePath) {
      const imagePath = path.join(__dirname, '..', record.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;