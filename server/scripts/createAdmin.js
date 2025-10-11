const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database...');
    
    const adminEmail = 'lahorivenkatesh@gmail.com';
    const adminPassword = '12345678';
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log('User already exists, updating to admin role...');
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`✅ User ${existingUser.name} (${existingUser.email}) is now an admin!`);
      return;
    }
    
    // Create new admin user
    const adminUser = new User({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      domain: 'Full Stack',
      experience: '5+ years',
      gender: 'Male',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      isPremium: true
    });
    
    await adminUser.save();
    console.log(`✅ Admin user created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role: admin`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();