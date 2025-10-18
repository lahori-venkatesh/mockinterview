const express = require('express');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const router = express.Router();

// Get questions by domain
router.get('/:domain', auth, async (req, res) => {
  try {
    const { domain } = req.params;
    const { difficulty, category, limit = 20 } = req.query;

    let query = { domain, isActive: true };
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const questions = await Question.find(query)
      .select('question difficulty category tags')
      .limit(parseInt(limit))
      .sort({ difficulty: 1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get random questions for interview
router.get('/:domain/random', auth, async (req, res) => {
  try {
    const { domain } = req.params;
    const { count = 10 } = req.query;
    
    console.log(`Fetching random questions for domain: ${domain}, count: ${count}`);

    let questions = [];

    // Strategy 1: Try to get questions for the specific domain
    const domainQuestions = await Question.find({ 
      domain, 
      isActive: { $ne: false } 
    }).select('question difficulty category tags domain');

    console.log(`Found ${domainQuestions.length} questions for domain ${domain}`);

    if (domainQuestions.length >= parseInt(count)) {
      // Randomly sample from domain-specific questions
      const shuffled = domainQuestions.sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, parseInt(count));
    } else if (domainQuestions.length > 0) {
      // Use all domain questions and supplement with others
      questions = [...domainQuestions];
      
      const remainingCount = parseInt(count) - domainQuestions.length;
      console.log(`Need ${remainingCount} more questions, fetching from other domains`);
      
      const otherQuestions = await Question.find({ 
        domain: { $ne: domain },
        isActive: { $ne: false } 
      }).select('question difficulty category tags domain')
        .limit(remainingCount);
      
      questions = [...questions, ...otherQuestions];
    } else {
      // Strategy 2: No domain-specific questions, get from any domain
      console.log(`No questions for ${domain}, fetching from any domain`);
      
      questions = await Question.find({ 
        isActive: { $ne: false } 
      }).select('question difficulty category tags domain')
        .limit(parseInt(count));
    }

    // Final fallback: if still no questions, get any questions (even inactive ones)
    if (questions.length === 0) {
      console.log('No active questions found, trying any questions');
      questions = await Question.find({})
        .select('question difficulty category tags domain')
        .limit(parseInt(count));
    }

    console.log(`Returning ${questions.length} questions`);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching random questions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new question (admin only - simplified for demo)
router.post('/', auth, async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug endpoint to check questions in database
router.get('/debug/all', auth, async (req, res) => {
  try {
    const questions = await Question.find({}).select('question domain category difficulty isActive');
    const summary = await Question.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      total: questions.length,
      summary: summary,
      sampleQuestions: questions.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;