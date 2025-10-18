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
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { genderPreference = 'same' } = req.query;

    console.log(`Finding matches for user: ${currentUser.name} (${currentUser.domain}, ${currentUser.gender})`);
    console.log(`Gender preference: ${genderPreference}, Premium: ${currentUser.isPremium}`);

    // Base query - exclude self and users with incomplete profiles
    let baseQuery = {
      _id: { $ne: req.userId },
      domain: { $ne: 'Not specified' },
      experience: { $ne: 'Not specified' },
      gender: { $ne: 'Not specified' },
      role: { $ne: 'admin' } // Exclude admin users from matching
    };

    // Users active in last 2 hours are considered "recently active"
    const recentlyActive = new Date(Date.now() - 2 * 60 * 60 * 1000);

    let matches = [];

    // Strategy 1: STRICT same domain matches with gender preference
    if (currentUser.domain !== 'Not specified') {
      let sameDomainQuery = { 
        ...baseQuery,
        domain: currentUser.domain  // STRICT same domain requirement
      };

      // Apply gender preference logic
      if (currentUser.isPremium) {
        console.log('Premium user matching with preference:', genderPreference);
        
        if (genderPreference === 'same' && currentUser.gender !== 'Not specified') {
          sameDomainQuery.gender = currentUser.gender;
        } else if (genderPreference === 'opposite' && currentUser.gender !== 'Not specified') {
          sameDomainQuery.gender = { $ne: currentUser.gender, $ne: 'Not specified' };
        }
        // 'any' preference doesn't add gender filter
      } else {
        // Free users - same gender only (unless gender is not specified)
        console.log('Free user matching - same gender preference');
        if (currentUser.gender !== 'Not specified') {
          sameDomainQuery.gender = currentUser.gender;
        }
      }

      console.log('Same domain match query:', sameDomainQuery);

      // Find same domain matches first
      matches = await User.find(sameDomainQuery)
        .select('name skills domain experience rating totalInterviews profilePicture isOnline lastActive bio gender')
        .sort({ 
          isOnline: -1,           // Online users first
          lastActive: -1,         // Recently active next
          rating: -1,             // Higher rated users
          totalInterviews: -1     // More experienced users
        })
        .limit(12);

      console.log(`Found ${matches.length} same domain matches`);
    }

    // Strategy 2: If no same domain matches, try relaxed gender matching within same domain
    if (matches.length === 0 && currentUser.domain !== 'Not specified') {
      console.log('No strict matches found, trying relaxed gender matching within same domain');
      
      let relaxedSameDomainQuery = { 
        ...baseQuery,
        domain: currentUser.domain  // Still keep same domain
      };
      
      // Only for premium users, try opposite gender if same gender didn't work
      if (currentUser.isPremium && genderPreference === 'same') {
        // Don't add gender filter - allow any gender within same domain
      }

      matches = await User.find(relaxedSameDomainQuery)
        .select('name skills domain experience rating totalInterviews profilePicture isOnline lastActive bio gender')
        .sort({ 
          isOnline: -1,
          lastActive: -1,
          rating: -1,
          totalInterviews: -1
        })
        .limit(10);

      console.log(`Found ${matches.length} relaxed same domain matches`);
    }

    // Strategy 3: Only if no same domain matches exist, expand to other domains
    if (matches.length < 3) {
      console.log('Very few same domain matches, expanding to other domains');
      
      let expandedQuery = { ...baseQuery };
      // Remove domain restriction but keep gender preference
      
      if (currentUser.isPremium) {
        if (genderPreference === 'same' && currentUser.gender !== 'Not specified') {
          expandedQuery.gender = currentUser.gender;
        } else if (genderPreference === 'opposite' && currentUser.gender !== 'Not specified') {
          expandedQuery.gender = { $ne: currentUser.gender, $ne: 'Not specified' };
        }
      } else {
        if (currentUser.gender !== 'Not specified') {
          expandedQuery.gender = currentUser.gender;
        }
      }

      const additionalMatches = await User.find(expandedQuery)
        .select('name skills domain experience rating totalInterviews profilePicture isOnline lastActive bio gender')
        .sort({ 
          isOnline: -1,
          lastActive: -1,
          rating: -1,
          totalInterviews: -1
        })
        .limit(8);

      // Merge and deduplicate
      const existingIds = matches.map(m => m._id.toString());
      const newMatches = additionalMatches.filter(m => !existingIds.includes(m._id.toString()));
      matches = [...matches, ...newMatches];
      
      console.log(`Added ${newMatches.length} matches from other domains`);
    }

    // Limit final results and sanitize data
    matches = matches.slice(0, 12);

    const sanitizedMatches = matches.map(match => ({
      ...match.toObject(),
      rating: match.rating || 0,
      totalInterviews: match.totalInterviews || 0,
      // Add match score for better sorting
      matchScore: calculateMatchScore(currentUser, match)
    }));

    // Sort by match score
    sanitizedMatches.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Returning ${sanitizedMatches.length} final matches`);

    res.json(sanitizedMatches);
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate match compatibility score
function calculateMatchScore(currentUser, match) {
  let score = 0;
  
  // HEAVILY favor same domain matches
  if (currentUser.domain === match.domain && currentUser.domain !== 'Not specified') {
    score += 100; // Much higher bonus for same domain
  } else {
    score -= 20; // Penalty for different domain
  }
  
  // Gender preference bonus
  if (currentUser.gender === match.gender && currentUser.gender !== 'Not specified') {
    score += 25;
  }
  
  // Experience level compatibility
  const expLevels = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'];
  const currentExp = expLevels.indexOf(currentUser.experience);
  const matchExp = expLevels.indexOf(match.experience);
  
  if (currentExp !== -1 && matchExp !== -1) {
    const expDiff = Math.abs(currentExp - matchExp);
    score += Math.max(0, 25 - (expDiff * 5)); // Closer experience levels get higher score
  }
  
  // Online status bonus (very important for interview matching)
  if (match.isOnline) {
    score += 40;
  } else if (match.lastActive && new Date(match.lastActive) > new Date(Date.now() - 2 * 60 * 60 * 1000)) {
    score += 20; // Active in last 2 hours
  } else if (match.lastActive && new Date(match.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    score += 10; // Active in last 24 hours
  }
  
  // Rating bonus
  score += (match.rating || 0) * 8;
  
  // Interview experience bonus
  score += Math.min((match.totalInterviews || 0) * 3, 30);
  
  return score;
}

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

// Debug endpoint for matching issues
router.get('/debug-matching', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    // Get all users for comparison
    const allUsers = await User.find({ _id: { $ne: req.userId } })
      .select('name email domain experience gender isOnline lastActive role')
      .sort({ createdAt: -1 });
    
    // Count by categories
    const stats = {
      total: allUsers.length,
      byDomain: {},
      byGender: {},
      byExperience: {},
      online: allUsers.filter(u => u.isOnline).length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      complete: allUsers.filter(u => 
        u.domain !== 'Not specified' && 
        u.experience !== 'Not specified' && 
        u.gender !== 'Not specified'
      ).length
    };
    
    // Count by domain
    allUsers.forEach(user => {
      stats.byDomain[user.domain] = (stats.byDomain[user.domain] || 0) + 1;
      stats.byGender[user.gender] = (stats.byGender[user.gender] || 0) + 1;
      stats.byExperience[user.experience] = (stats.byExperience[user.experience] || 0) + 1;
    });
    
    res.json({
      currentUser: {
        name: currentUser.name,
        domain: currentUser.domain,
        experience: currentUser.experience,
        gender: currentUser.gender,
        isPremium: currentUser.isPremium
      },
      availableUsers: allUsers.map(u => ({
        name: u.name,
        domain: u.domain,
        experience: u.experience,
        gender: u.gender,
        isOnline: u.isOnline,
        role: u.role
      })),
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Debug failed', error: error.message });
  }
});

module.exports = router;