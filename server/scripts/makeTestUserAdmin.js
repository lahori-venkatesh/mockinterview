const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const makeTestUserAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database...');
    
    // Make the existing test user an admin
    const testUser = await User.findOne({ email: 'test@test.com' });
    if (testUser) {
      testUser.role = 'admin';
      await testUser.save();
      console.log('✅ Test user is now admin');
      console.log('Login with: test@test.com / 123456');
    }
    
    // Also try to create your admin user
    const adminEmail = 'lahorivenkatesh@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Venkatesh Lahori',
        email: adminEmail,
        password: '12345678',
        role: 'admin',
        domain: 'Full Stack',
        experience: '5+ years',
        gender: 'Male',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        isPremium: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created');
      console.log('Login with: lahorivenkatesh@gmail.com / 12345678');
    } else {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Existing admin user updated');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

makeTestUserAdmin();