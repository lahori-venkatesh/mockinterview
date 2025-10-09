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

    let matchQuery = {
      _id: { $ne: req.userId },
      domain: currentUser.domain,
      isOnline: true
    };

    // Premium matching logic
    if (currentUser.isPremium) {
      if (genderPreference === 'same') {
        matchQuery.gender = currentUser.gender;
      } else if (genderPreference === 'opposite') {
        matchQuery.gender = { $ne: currentUser.gender };
      }
      // High rated users only for premium
      matchQuery.rating = { $gte: 4.0 };
    } else {
      // Free users can only match with same gender
      matchQuery.gender = currentUser.gender;
    }

    const matches = await User.find(matchQuery)
      .select('name skills domain experience rating totalInterviews profilePicture isOnline lastActive')
      .limit(10)
      .sort({ isOnline: -1, rating: -1, totalInterviews: -1 });

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
    
    // Validate required fields
    if (updates.domain && !['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Mobile', 'DevOps', 'UI/UX'].includes(updates.domain)) {
      return res.status(400).json({ message: 'Invalid domain value' });
    }
    
    if (updates.experience && !['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'].includes(updates.experience)) {
      return res.status(400).json({ message: 'Invalid experience value' });
    }
    
    if (updates.gender && !['Male', 'Female', 'Other', 'Prefer not to say'].includes(updates.gender)) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;