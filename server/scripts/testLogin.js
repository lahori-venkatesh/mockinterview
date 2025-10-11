const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
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
    
    console.log('User found:', user.name, user.email, 'Role:', user.role);
    
    // Test password comparison
    const isValid = await user.comparePassword(password);
    console.log('Password comparison result:', isValid);
    
    if (!isValid) {
      console.log('Resetting password...');
      user.password = password;
      await user.save();
      console.log('Password reset complete');
      
      // Test again
      const updatedUser = await User.findOne({ email });
      const isValidNow = await updatedUser.comparePassword(password);
      console.log('New password test:', isValidNow);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testLogin();