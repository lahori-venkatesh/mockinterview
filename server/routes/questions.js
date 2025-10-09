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

    const questions = await Question.aggregate([
      { $match: { domain, isActive: true } },
      { $sample: { size: parseInt(count) } },
      { $project: { question: 1, difficulty: 1, category: 1, tags: 1 } }
    ]);

    res.json(questions);
  } catch (error) {
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

module.exports = router;