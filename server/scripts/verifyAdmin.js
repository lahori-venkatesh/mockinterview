const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const verifyAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database...');
    
    const email = 'lahorivenkatesh@gmail.com';
    const password = '12345678';
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Created: ${user.createdAt}`);
    
    // Test password
    const isPasswordValid = await user.comparePassword(password);
    console.log(`Password valid: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log('🔧 Updating password...');
      user.password = password;
      await user.save();
      console.log('✅ Password updated');
      
      // Test again
      const updatedUser = await User.findOne({ email });
      const isNewPasswordValid = await updatedUser.comparePassword(password);
      console.log(`New password valid: ${isNewPasswordValid}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

verifyAdminUser();