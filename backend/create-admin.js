// ============================================================
// Usage: node create-admin.js
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const ADMIN_EMAIL = 'admin@mushroom.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'System Admin';

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existing) {
      // Update to admin role
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ User "${ADMIN_EMAIL}" promoted to admin!`);
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log(`✅ Admin user created!`);
    }

    console.log('\n📋 Admin Login Details:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Change the password after first login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
