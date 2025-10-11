const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const forceStudentInterviewAdmin = async () => {
  try {
    // Force connection to student-interview database
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(mongoUri);
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected to database:', dbName);
    
    if (dbName !== 'student-interview') {
      console.log('❌ ERROR: Not connected to student-interview database!');
      console.log('Current database:', dbName);
      return;
    }
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:', collections.map(c => c.name).join(', '));
    
    // Count documents
    const userCount = await User.countDocuments();
    console.log(`\n👥 Total users: ${userCount}`);
    
    // Check if admin exists
    const adminEmail = 'lahorivenkatesh@gmail.com';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.name);
      console.log('Current role:', adminUser.role || 'user');
      
      // Update to admin
      adminUser.role = 'admin';
      adminUser.isPremium = true;
      await adminUser.save();
      console.log('✅ Updated to admin role');
    } else {
      console.log('❌ Admin user not found, creating...');
      
      adminUser = new User({
        name: 'Venkatesh Lahori',
        email: adminEmail,
        password: '12345678',
        role: 'admin',
        domain: 'Full Stack',
        experience: '5+ years',
        gender: 'Male',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        isPremium: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created');
    }
    
    // Verify admin exists
    const verifyAdmin = await User.findOne({ email: adminEmail });
    console.log('\n🔐 Admin verification:');
    console.log('Name:', verifyAdmin.name);
    console.log('Email:', verifyAdmin.email);
    console.log('Role:', verifyAdmin.role);
    console.log('Premium:', verifyAdmin.isPremium);
    
    // List all users in student-interview database
    const allUsers = await User.find({}, 'name email role domain').sort({ createdAt: -1 });
    console.log(`\n👥 All users in student-interview database (${allUsers.length}):`);
    allUsers.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '🔐' : '👤';
      console.log(`${index + 1}. ${roleIcon} ${user.name} (${user.email}) - ${user.domain} - Role: ${user.role || 'user'}`);
    });
    
    // Check questions and interviews
    const Question = require('../models/Question');
    const Interview = require('../models/Interview');
    
    const questionCount = await Question.countDocuments();
    const interviewCount = await Interview.countDocuments();
    
    console.log(`\n📊 Data summary:`);
    console.log(`Users: ${allUsers.length}`);
    console.log(`Questions: ${questionCount}`);
    console.log(`Interviews: ${interviewCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
  }
};

forceStudentInterviewAdmin();