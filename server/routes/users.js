const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Get matching users for interview
router.get('/matches', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const { genderPreference } = req.query;

    console.log(`Finding matches for user: ${currentUser.name} (${currentUser.domain})`);

    // Base query - exclude self and match domain
    let matchQuery = {
      _id: { $ne: req.userId },
      domain: currentUser.domain
    };

    // Add online status preference (but don't make it mandatory)
    // Users active in last 30 minutes are considered "available"
    const recentlyActive = new Date(Date.now() - 30 * 60 * 1000);

    // Premium matching logic
    if (currentUser.isPremium) {
      console.log('Premium user matching with preference:', genderPreference);
      
      if (genderPreference === 'same') {
        matchQuery.gender = currentUser.gender;
      } else if (genderPreference === 'opposite') {
        matchQuery.gender = { $ne: currentUser.gender };
      }
      // For premium users, prefer recently active users but don't exclude others
    } else {
      // Free users - more flexible matching
      console.log('Free user matching');
      
      // Don't enforce strict gender matching for better user experience
      if (genderPreference === 'same' && currentUser.gender !== 'Not specified') {
        matchQuery.gender = currentUser.gender;
      }
    }

    console.log('Match query:', matchQuery);

    // First try to find recently active users
    let matches = await User.find({
      ...matchQuery,
      $or: [
        { isOnline: true },
        { lastActive: { $gte: recentlyActive } }
      ]
    })
      .select('name skills domain experience rating totalInterviews profilePicture isOnline lastActive bio')
      .limit(10)
      .sort({ isOnline: -1, lastActive: -1, rating: -1 });

    // If no recently active matches, find any users with same domain
    if (matches.length === 0) {
      console.log('No recently active matches, searching all users with same domain');
      matches = await User.find(matchQuery)
        .select('name skills domain experience rating totalInterviews profilePicture isOnline lastActive bio')
        .limit(10)
        .sort({ rating: -1, totalInterviews: -1 });
    }

    // If still no matches, try broader search (any domain)
    if (matches.length === 0) {
      console.log('No domain matches, searching all users');
      const broadQuery = { _id: { $ne: req.userId } };
      
      if (currentUser.isPremium && genderPreference === 'same') {
        broadQuery.gender = currentUser.gender;
      }
      
      matches = await User.find(broadQuery)
        .select('name skills domain experience rating totalInterviews profilePicture isOnline lastActive bio')
        .limit(5)
        .sort({ rating: -1, totalInterviews: -1 });
    }

    console.log(`Found ${matches.length} matches`);

    // Ensure rating and totalInterviews are never null
    const sanitizedMatches = matches.map(match => ({
      ...match.toObject(),
      rating: match.rating || 0,
      totalInterviews: match.totalInterviews || 0
    }));

    res.json(sanitizedMatches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    console.log('Profile update request:', { userId: req.userId, updates });
    
    // Remove undefined/null values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === null) {
        delete updates[key];
      }
    });
    
    // Validate required fields
    if (updates.domain && !['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Mobile', 'DevOps', 'UI/UX', 'Not specified'].includes(updates.domain)) {
      return res.status(400).json({ message: 'Invalid domain value' });
    }
    
    if (updates.experience && !['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years', 'Not specified'].includes(updates.experience)) {
      return res.status(400).json({ message: 'Invalid experience value' });
    }
    
    if (updates.gender && !['Male', 'Female', 'Other', 'Prefer not to say', 'Not specified'].includes(updates.gender)) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }

    // Validate skills array
    if (updates.skills && !Array.isArray(updates.skills)) {
      return res.status(400).json({ message: 'Skills must be an array' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated successfully:', user._id);
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    // Ensure rating and totalInterviews are never null
    const sanitizedUser = {
      ...user.toObject(),
      rating: user.rating || 0,
      totalInterviews: user.totalInterviews || 0
    };
    
    res.json(sanitizedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update online status
router.put('/status', auth, async (req, res) => {
  try {
    const { isOnline } = req.body;
    await User.findByIdAndUpdate(req.userId, {
      isOnline,
      lastActive: new Date()
    });
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload profile picture
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the user and remove old profile picture if exists
    const user = await User.findById(req.userId);
    if (user.profilePicture) {
      const oldImagePath = path.join(__dirname, '../uploads/profile-pictures', path.basename(user.profilePicture));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile picture URL
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    await User.findByIdAndUpdate(req.userId, { profilePicture: profilePictureUrl });

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl
    });
  } catch (error) {
    // Clean up uploaded file if database update fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove profile picture
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.profilePicture) {
      // Remove file from filesystem
      const imagePath = path.join(__dirname, '../uploads/profile-pictures', path.basename(user.profilePicture));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Update user in database
      await User.findByIdAndUpdate(req.userId, { profilePicture: '' });
    }

    res.json({ message: 'Profile picture removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user settings
router.put('/settings', auth, async (req, res) => {
  try {
    const allowedSettings = [
      'emailNotifications',
      'interviewReminders', 
      'marketingEmails',
      'profileVisibility'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedSettings.includes(key)) {
        updates[`settings.${key}`] = req.body[key];
      }
    });

    await User.findByIdAndUpdate(req.userId, updates);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const onlineUsers = await User.countDocuments({ 
      isOnline: true,
      lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Active in last 5 minutes
    });
    
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    
    res.json({
      onlineUsers,
      totalUsers,
      premiumUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

// Test endpoint for profile updates
router.get('/profile-test', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ 
      message: 'Profile endpoint working',
      user: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Test failed', error: error.message });
  }
});

module.exports = router;