const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const makeSpecificUserAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database...');
    
    const email = 'lahorivenkatesh@gmail.com';
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found with email: ${email}`);
      console.log('Creating new admin user...');
      
      // Create new admin user if not exists
      const adminUser = new User({
        name: 'Venkatesh Lahori',
        email: email,
        password: '12345678',
        role: 'admin',
        domain: 'Full Stack',
        experience: '5+ years',
        gender: 'Male',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        isPremium: true
      });
      
      await adminUser.save();
      console.log(`✅ New admin user created!`);
      console.log(`Email: ${email}`);
      console.log(`Password: 12345678`);
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role || 'user'}`);
    
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ User ${user.name} (${user.email}) is now an admin!`);
    console.log(`Login credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: [your existing password]`);
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

makeSpecificUserAdmin();