const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Interview = require('../models/Interview');
const auth = require('../middleware/auth');

// Admin middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // req.user is already populated by auth middleware
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users with pagination (optimized)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Run queries in parallel
    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role domain experience isPremium createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all questions with pagination
router.get('/questions', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category || '';

    const query = category ? { category } : {};

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);
    const categories = await Question.distinct('category');

    res.json({
      questions,
      categories,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new question
router.post('/questions', auth, adminAuth, async (req, res) => {
  try {
    const { question, category, difficulty, type, options, correctAnswer } = req.body;

    const newQuestion = new Question({
      question,
      category,
      difficulty: difficulty || 'medium',
      type: type || 'multiple-choice',
      options: options || [],
      correctAnswer
    });

    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update question
router.put('/questions/:id', auth, adminAuth, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete question
router.delete('/questions/:id', auth, adminAuth, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics data (optimized)
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    // Run all queries in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      totalInterviews,
      completedInterviews,
      totalQuestions,
      questionsByCategory,
      userRegistrations,
      interviewStats
    ] = await Promise.all([
      // User statistics
      User.countDocuments(),
      User.countDocuments({ 
        lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      User.countDocuments({ isPremium: true }),
      
      // Interview statistics
      Interview.countDocuments(),
      Interview.countDocuments({ status: 'completed' }),
      
      // Questions statistics
      Question.countDocuments(),
      Question.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $limit: 10 } // Limit for performance
      ]),
      
      // User registrations (last 7 days for faster loading)
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 7 }
      ]),
      
      // Interview stats (last 7 days for faster loading)
      Interview.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 7 }
      ])
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        premium: premiumUsers,
        registrations: userRegistrations
      },
      interviews: {
        total: totalInterviews,
        completed: completedInterviews,
        completionRate: totalInterviews > 0 ? (completedInterviews / totalInterviews * 100).toFixed(2) : 0,
        avgRating: 0, // Simplified for performance
        stats: interviewStats
      },
      questions: {
        total: totalQuestions,
        byCategory: questionsByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Report user (for future implementation)
router.post('/reports', auth, adminAuth, async (req, res) => {
  try {
    const { userId, reason, description } = req.body;
    
    // For now, just mark user as reported
    await User.findByIdAndUpdate(userId, { 
      $push: { 
        reports: { 
          reason, 
          description, 
          reportedAt: new Date(),
          reportedBy: req.userId 
        } 
      } 
    });

    res.json({ message: 'User reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reported users
router.get('/reports', auth, adminAuth, async (req, res) => {
  try {
    const reportedUsers = await User.find({ 
      'reports.0': { $exists: true } 
    }).select('-password');

    res.json({ reportedUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all admins
router.get('/admins', auth, adminAuth, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('name email domain experience createdAt lastActive')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ admins });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Promote user to admin
router.put('/promote-user/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.role = 'admin';
    user.isPremium = true; // Give admin premium access
    await user.save();

    res.json({ 
      message: `${user.name} has been promoted to admin`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Demote admin to user
router.put('/demote-admin/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent self-demotion
    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot demote yourself' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({ message: 'User is not an admin' });
    }

    user.role = 'user';
    await user.save();

    res.json({ 
      message: `${user.name} has been demoted to regular user`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new admin user
router.post('/create-admin', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, password, domain, experience } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new admin user
    const adminUser = new User({
      name,
      email,
      password,
      role: 'admin',
      domain: domain || 'Full Stack',
      experience: experience || '5+ years',
      gender: 'Not specified',
      skills: ['Admin', 'Management'],
      isPremium: true
    });

    await adminUser.save();

    res.status(201).json({
      message: `Admin user ${name} created successfully`,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        domain: adminUser.domain
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug endpoint to check database connection
router.get('/debug-db', auth, adminAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbName = mongoose.connection.db.databaseName;
    
    // Get collection info
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Count documents
    const userCount = await User.countDocuments();
    const questionCount = await Question.countDocuments();
    const interviewCount = await Interview.countDocuments();
    
    // Sample users
    const sampleUsers = await User.find({}, 'name email role').limit(5);
    
    res.json({
      database: dbName,
      collections: collectionNames,
      counts: {
        users: userCount,
        questions: questionCount,
        interviews: interviewCount
      },
      sampleUsers: sampleUsers,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
});

module.exports = router;