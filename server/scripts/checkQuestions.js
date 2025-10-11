const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

const checkQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database:', mongoose.connection.db.databaseName);
    
    // Check total questions
    const totalQuestions = await Question.countDocuments();
    console.log(`\n📊 Total questions: ${totalQuestions}`);
    
    if (totalQuestions === 0) {
      console.log('❌ No questions found in database');
      return;
    }
    
    // Check questions by domain
    const questionsByDomain = await Question.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📋 Questions by domain:');
    questionsByDomain.forEach(item => {
      console.log(`  ${item._id}: ${item.count} questions`);
    });
    
    // Check sample questions
    const sampleQuestions = await Question.find({}).limit(3).select('question domain category difficulty');
    console.log('\n📝 Sample questions:');
    sampleQuestions.forEach((q, index) => {
      console.log(`${index + 1}. [${q.domain}] ${q.question.substring(0, 50)}...`);
    });
    
    // Test specific domain query
    const frontendQuestions = await Question.find({ domain: 'Frontend' }).limit(2);
    console.log(`\n🔍 Frontend questions found: ${frontendQuestions.length}`);
    
    // Check for isActive field
    const activeQuestions = await Question.countDocuments({ isActive: true });
    const inactiveQuestions = await Question.countDocuments({ isActive: false });
    const noActiveField = await Question.countDocuments({ isActive: { $exists: false } });
    
    console.log('\n🔄 Question status:');
    console.log(`  Active: ${activeQuestions}`);
    console.log(`  Inactive: ${inactiveQuestions}`);
    console.log(`  No isActive field: ${noActiveField}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
};

checkQuestions();