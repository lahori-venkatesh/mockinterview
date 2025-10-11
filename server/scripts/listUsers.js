const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database...');
    
    const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role || 'user'} - Created: ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

listUsers();