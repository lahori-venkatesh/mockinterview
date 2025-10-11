const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const setupProductionAdmin = async () => {
  try {
    // Connect to the production database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database:', mongoose.connection.db.databaseName);
    
    const adminEmail = 'lahorivenkatesh@gmail.com';
    const adminPassword = '12345678';
    
    // Check if admin user exists
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('✅ Admin user found, updating role...');
      adminUser.role = 'admin';
      adminUser.isPremium = true;
      await adminUser.save();
      console.log(`✅ ${adminUser.name} is now an admin!`);
    } else {
      console.log('❌ Admin user not found, creating new admin...');
      adminUser = new User({
        name: 'Venkatesh Lahori',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        domain: 'Full Stack',
        experience: '5+ years',
        gender: 'Male',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        isPremium: true
      });
      
      await adminUser.save();
      console.log('✅ New admin user created successfully!');
    }
    
    // List all users to verify
    const allUsers = await User.find({}, 'name email role domain createdAt').sort({ createdAt: -1 });
    console.log(`\n📊 Total users in production database: ${allUsers.length}`);
    
    console.log('\n👥 Recent users:');
    allUsers.slice(0, 10).forEach((user, index) => {
      const roleLabel = user.role === 'admin' ? '🔐 ADMIN' : '👤 USER';
      console.log(`${index + 1}. ${roleLabel} ${user.name} (${user.email}) - ${user.domain} - ${user.createdAt.toLocaleDateString()}`);
    });
    
    // Count admins
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`\n🔐 Total admins: ${adminCount}`);
    
    console.log('\n🎯 Admin login credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
};

setupProductionAdmin();