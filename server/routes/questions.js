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

    // First check if any questions exist for this domain
    const totalQuestions = await Question.countDocuments({ domain });
    console.log(`Total questions for ${domain}: ${totalQuestions}`);
    
    if (totalQuestions === 0) {
      // Try without domain filter to see if questions exist at all
      const allQuestions = await Question.countDocuments({});
      console.log(`Total questions in database: ${allQuestions}`);
      
      if (allQuestions === 0) {
        return res.json([]);
      }
      
      // If no questions for specific domain, get from any domain
      const questions = await Question.aggregate([
        { $match: { isActive: { $ne: false } } }, // Get active questions or questions without isActive field
        { $sample: { size: parseInt(count) } },
        { $project: { question: 1, difficulty: 1, category: 1, tags: 1, domain: 1 } }
      ]);
      
      console.log(`Found ${questions.length} questions from any domain`);
      return res.json(questions);
    }

    const questions = await Question.aggregate([
      { $match: { domain, isActive: { $ne: false } } }, // Match domain and active questions
      { $sample: { size: parseInt(count) } },
      { $project: { question: 1, difficulty: 1, category: 1, tags: 1, domain: 1 } }
    ]);

    console.log(`Found ${questions.length} questions for domain ${domain}`);
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