const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create interview room
router.post('/create', auth, async (req, res) => {
  try {
    const { participantId, selectedQuestions, isPremium } = req.body;
    const roomId = uuidv4();

    const interview = new Interview({
      roomId,
      participants: [
        { userId: req.userId, role: 'interviewer' },
        { userId: participantId, role: 'interviewee' }
      ],
      domain: req.body.domain,
      selectedQuestions,
      isPremium: isPremium || false
    });

    await interview.save();
    await interview.populate('participants.userId', 'name email skills domain');

    res.status(201).json({
      message: 'Interview room created',
      interview,
      roomId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join interview
router.post('/join/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const interview = await Interview.findOne({ roomId })
      .populate('participants.userId', 'name email skills domain rating');

    if (!interview) {
      return res.status(404).json({ message: 'Interview room not found' });
    }

    // Check if user is participant
    const isParticipant = interview.participants.some(
      p => p.userId._id.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to join this interview' });
    }

    // Update interview status
    if (interview.status === 'waiting') {
      interview.status = 'active';
      interview.startTime = new Date();
      await interview.save();
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit feedback
router.post('/:roomId/feedback', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { toUserId, rating, comments, skills } = req.body;

    console.log('Feedback submission:', { roomId, toUserId, rating, comments, fromUser: req.userId });

    // Validate required fields
    if (!toUserId || !rating) {
      return res.status(400).json({ message: 'Missing required fields: toUserId and rating' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const interview = await Interview.findOne({ roomId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check if user is a participant
    const isParticipant = interview.participants.some(
      p => p.userId.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this interview' });
    }

    // Add feedback
    interview.feedback.push({
      fromUser: req.userId,
      toUser: toUserId,
      rating: Number(rating),
      comments: comments || '',
      skills: skills || []
    });

    await interview.save();

    // Update user rating
    const feedbacks = await Interview.aggregate([
      { $unwind: '$feedback' },
      { $match: { 'feedback.toUser': new mongoose.Types.ObjectId(toUserId) } },
      { $group: { _id: null, avgRating: { $avg: '$feedback.rating' } } }
    ]);

    if (feedbacks.length > 0) {
      await User.findByIdAndUpdate(toUserId, {
        rating: feedbacks[0].avgRating,
        $inc: { totalInterviews: 1 }
      });
    }

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Report inappropriate behavior
router.post('/:roomId/report', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { reportedUserId, reason } = req.body;

    const interview = await Interview.findOne({ roomId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Add report to interview
    if (!interview.reports) {
      interview.reports = [];
    }
    
    interview.reports.push({
      reportedBy: req.userId,
      reportedUser: reportedUserId,
      reason,
      timestamp: new Date()
    });

    await interview.save();

    // You could also create a separate Report model for better tracking
    // and send notifications to admins

    res.json({ message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug endpoint to check interview data
router.get('/:roomId/debug', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const interview = await Interview.findOne({ roomId })
      .populate('participants.userId', 'name email domain');
    
    res.json({
      interview,
      currentUserId: req.userId,
      participants: interview?.participants
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's interview history
router.get('/history', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({
      'participants.userId': req.userId
    })
    .populate('participants.userId', 'name email domain')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;