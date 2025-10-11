const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const cleanTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database:', mongoose.connection.db.databaseName);
    
    // Find test/example users (but keep the admin)
    const testUsers = await User.find({
      $and: [
        { email: { $regex: /example\.com|test@/ } },
        { role: { $ne: 'admin' } }
      ]
    }, 'name email');
    
    console.log(`\n🧹 Found ${testUsers.length} test/example users to clean:`);
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });
    
    if (testUsers.length > 0) {
      // Remove test users
      const result = await User.deleteMany({
        $and: [
          { email: { $regex: /example\.com|test@/ } },
          { role: { $ne: 'admin' } }
        ]
      });
      
      console.log(`✅ Removed ${result.deletedCount} test users`);
    }
    
    // Show remaining users
    const remainingUsers = await User.find({}, 'name email role domain createdAt').sort({ createdAt: -1 });
    console.log(`\n👥 Remaining users: ${remainingUsers.length}`);
    
    remainingUsers.forEach((user, index) => {
      const roleLabel = user.role === 'admin' ? '🔐 ADMIN' : '👤 USER';
      console.log(`${index + 1}. ${roleLabel} ${user.name} (${user.email}) - ${user.domain}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
};

// Uncomment the line below to run the cleanup
// cleanTestData();

console.log('⚠️  Test data cleanup script ready.');
console.log('⚠️  Uncomment the last line in the script to run cleanup.');
console.log('⚠️  This will remove all users with @example.com or test@ emails (except admins).');