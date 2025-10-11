const mongoose = require('mongoose');
require('dotenv').config();

const removeTestDatabase = async () => {
  try {
    // Connect to MongoDB without specifying database
    const baseUri = process.env.MONGODB_URI.split('/')[0] + '//' + process.env.MONGODB_URI.split('//')[1].split('/')[0];
    await mongoose.connect(baseUri + '/test');
    
    console.log('🗑️  Connected to test database');
    
    // Drop the test database
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Test database removed successfully');
    
    // Verify by listing databases
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    
    console.log('\n📁 Remaining databases:');
    databases.databases.forEach((db, index) => {
      console.log(`${index + 1}. ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Uncomment to run
// removeTestDatabase();

console.log('⚠️  Test database removal script ready');
console.log('⚠️  Uncomment the last line to remove test database');
console.log('⚠️  Make sure your production is using student-interview database first!');