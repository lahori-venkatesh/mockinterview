const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const Interview = require('../models/Interview');
require('dotenv').config();

const checkProductionData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database:', mongoose.connection.db.databaseName);
    
    // Check Users
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`\n👥 Users: ${userCount} total (${adminCount} admins)`);
    
    // Check Questions
    const questionCount = await Question.countDocuments();
    console.log(`❓ Questions: ${questionCount} total`);
    
    if (questionCount > 0) {
      const questionsByDomain = await Question.aggregate([
        { $group: { _id: '$domain', count: { $sum: 1 } } }
      ]);
      console.log('Questions by domain:');
      questionsByDomain.forEach(item => {
        console.log(`  - ${item._id}: ${item.count}`);
      });
      
      const questionsByCategory = await Question.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      console.log('Questions by category:');
      questionsByCategory.forEach(item => {
        console.log(`  - ${item._id}: ${item.count}`);
      });
    }
    
    // Check Interviews
    const interviewCount = await Interview.countDocuments();
    console.log(`🎤 Interviews: ${interviewCount} total`);
    
    if (interviewCount > 0) {
      const interviewsByStatus = await Interview.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      console.log('Interviews by status:');
      interviewsByStatus.forEach(item => {
        console.log(`  - ${item._id}: ${item.count}`);
      });
    }
    
    // Sample recent users (excluding test users)
    const recentUsers = await User.find({
      email: { $not: /test|example\.com/ }
    }, 'name email domain createdAt').sort({ createdAt: -1 }).limit(5);
    
    console.log('\n🔥 Recent real users:');
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.domain}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkProductionData();