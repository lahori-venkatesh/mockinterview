const mongoose = require('mongoose');
require('dotenv').config();

const checkDatabases = async () => {
  try {
    // Connect to the database specified in .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database:', mongoose.connection.db.databaseName);
    
    // List all collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in current database:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Check if we're in the right database
    const dbName = mongoose.connection.db.databaseName;
    if (dbName !== 'student-interview') {
      console.log(`\n❌ WARNING: Connected to '${dbName}' but should be 'student-interview'`);
    } else {
      console.log(`\n✅ Correctly connected to 'student-interview' database`);
    }
    
    // Count documents in each collection
    console.log('\n📊 Document counts:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkDatabases();