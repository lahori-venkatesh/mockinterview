const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const makeUserAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database...');
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      console.log('Available users:');
      const users = await User.find({}, 'name email role').limit(5);
      users.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role || 'user'}`));
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role || 'user'}`);
    
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ User ${user.name} (${user.email}) is now an admin!`);
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.log('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

makeUserAdmin(email);