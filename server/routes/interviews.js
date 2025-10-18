const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Store pending invitations in memory (in production, use Redis)
const pendingInvitations = new Map();

// Send interview invitation
router.post('/send-invitation', auth, async (req, res) => {
  try {
    const { participantId, selectedQuestions, domain } = req.body;
    const invitationId = uuidv4();
    
    // Get interviewer and participant details
    const interviewer = await User.findById(req.userId).select('name email skills domain profilePicture');
    const participant = await User.findById(participantId).select('name email skills domain profilePicture');
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    console.log('Sending interview invitation:', {
      invitationId,
      from: interviewer.name,
      to: participant.name,
      domain
    });

    // Store invitation details
    const invitation = {
      id: invitationId,
      interviewer: {
        id: interviewer._id,
        name: interviewer.name,
        email: interviewer.email,
        skills: interviewer.skills,
        domain: interviewer.domain,
        profilePicture: interviewer.profilePicture
      },
      participant: {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        skills: participant.skills,
        domain: participant.domain,
        profilePicture: participant.profilePicture
      },
      selectedQuestions,
      domain,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
    };

    pendingInvitations.set(invitationId, invitation);

    // Persist invitation for sender/participant visibility
    try {
      await Invitation.create({
        invitationId,
        interviewer: interviewer._id,
        participant: participant._id,
        domain,
        selectedQuestions,
        status: 'pending',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });
    } catch (e) {
      console.warn('Failed to persist invitation:', e.message);
    }

    // Send real-time invitation via Socket.io
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    if (io && connectedUsers.has(participantId)) {
      io.to(participantId).emit('interview-invitation', invitation);
      console.log('Interview invitation sent via socket to:', participant.name);
    }

    res.status(201).json({
      message: 'Interview invitation sent',
      invitationId,
      invitation
    });
  } catch (error) {
    console.error('Invitation sending error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Respond to interview invitation
router.post('/respond-invitation/:invitationId', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { response } = req.body; // 'accept' or 'reject'
    
    const invitation = pendingInvitations.get(invitationId);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or expired' });
    }

    // Check if user is the intended participant
    if (invitation.participant.id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this invitation' });
    }

    console.log(`Invitation ${response} by ${invitation.participant.name}`);

    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    if (response === 'accept') {
      // Create interview room
      const roomId = uuidv4();
      
      const interview = new Interview({
        roomId,
        participants: [
          { userId: invitation.interviewer.id, role: 'interviewer' },
          { userId: invitation.participant.id, role: 'interviewee' }
        ],
        domain: invitation.domain,
        selectedQuestions: invitation.selectedQuestions,
        status: 'waiting'
      });

      await interview.save();
      await interview.populate('participants.userId', 'name email skills domain profilePicture');

      // Remove invitation from pending
      pendingInvitations.delete(invitationId);

      // Update persisted invitation status
      await Invitation.findOneAndUpdate({ invitationId }, { status: 'accepted' });

      // Notify interviewer about acceptance
      if (io && connectedUsers.has(invitation.interviewer.id.toString())) {
        io.to(invitation.interviewer.id.toString()).emit('invitation-accepted', {
          roomId,
          interview,
          message: `${invitation.participant.name} accepted your interview invitation!`
        });
      }

      res.json({
        message: 'Invitation accepted',
        roomId,
        interview
      });
    } else {
      // Remove invitation from pending
      pendingInvitations.delete(invitationId);

      // Update persisted invitation status
      await Invitation.findOneAndUpdate({ invitationId }, { status: 'rejected' });

      // Notify interviewer about rejection
      if (io && connectedUsers.has(invitation.interviewer.id.toString())) {
        io.to(invitation.interviewer.id.toString()).emit('invitation-rejected', {
          message: `${invitation.participant.name} declined your interview invitation.`
        });
      }

      res.json({ message: 'Invitation rejected' });
    }
  } catch (error) {
    console.error('Invitation response error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending invitations for user
router.get('/pending-invitations', auth, async (req, res) => {
  try {
    const userInvitations = [];
    const now = new Date();
    
    // Clean expired invitations and find user's invitations
    for (const [id, invitation] of pendingInvitations.entries()) {
      if (invitation.expiresAt < now) {
        pendingInvitations.delete(id);
      } else if (invitation.participant.id.toString() === req.userId) {
        userInvitations.push(invitation);
      }
    }

    res.json({ invitations: userInvitations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List sent invitations for current user
router.get('/sent-invitations', auth, async (req, res) => {
  try {
    const invites = await Invitation.find({ interviewer: req.userId })
      .populate('participant', 'name email domain profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ invitations: invites.map((inv) => ({
      id: inv.invitationId,
      recipient: {
        id: inv.participant._id,
        name: inv.participant.name,
        domain: inv.participant.domain,
        profilePicture: inv.participant.profilePicture
      },
      domain: inv.domain,
      selectedQuestions: inv.selectedQuestions,
      status: inv.status,
      createdAt: inv.createdAt
    })) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel a pending invitation sent by current user
router.post('/cancel-invitation/:invitationId', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const inv = await Invitation.findOne({ invitationId });
    if (!inv) return res.status(404).json({ message: 'Invitation not found' });
    if (inv.interviewer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (inv.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending invitations can be cancelled' });
    }
    inv.status = 'cancelled';
    await inv.save();
    // Remove from in-memory pending map too
    pendingInvitations.delete(invitationId);
    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept interview invitation
router.post('/accept/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const interview = await Interview.findOne({ roomId })
      .populate('participants.userId', 'name email skills domain');

    if (!interview) {
      return res.status(404).json({ message: 'Interview invitation not found' });
    }

    // Check if user is the invited participant
    const isInvitedParticipant = interview.participants.some(
      p => p.userId._id.toString() === req.userId && p.role === 'interviewee'
    );

    if (!isInvitedParticipant) {
      return res.status(403).json({ message: 'Not authorized to accept this invitation' });
    }

    // Update interview status to waiting (ready to start)
    interview.status = 'waiting';
    await interview.save();

    console.log('Interview invitation accepted:', roomId);

    res.json({
      message: 'Interview invitation accepted',
      interview,
      roomId
    });
  } catch (error) {
    console.error('Interview acceptance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject interview invitation
router.post('/reject/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const interview = await Interview.findOne({ roomId });

    if (!interview) {
      return res.status(404).json({ message: 'Interview invitation not found' });
    }

    // Check if user is the invited participant
    const isInvitedParticipant = interview.participants.some(
      p => p.userId._id.toString() === req.userId && p.role === 'interviewee'
    );

    if (!isInvitedParticipant) {
      return res.status(403).json({ message: 'Not authorized to reject this invitation' });
    }

    // Update interview status to rejected
    interview.status = 'rejected';
    await interview.save();

    console.log('Interview invitation rejected:', roomId);

    res.json({
      message: 'Interview invitation rejected',
      roomId
    });
  } catch (error) {
    console.error('Interview rejection error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join interview
router.post('/join/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`User ${req.userId} attempting to join interview room: ${roomId}`);
    
    const interview = await Interview.findOne({ roomId })
      .populate('participants.userId', 'name email skills domain rating profilePicture bio');

    if (!interview) {
      console.log('Interview room not found:', roomId);
      return res.status(404).json({ message: 'Interview room not found' });
    }

    console.log('Interview found:', {
      roomId: interview.roomId,
      status: interview.status,
      participants: interview.participants.map(p => ({ id: p.userId._id, name: p.userId.name }))
    });

    // Check if user is participant
    const isParticipant = interview.participants.some(
      p => p.userId._id.toString() === req.userId
    );

    if (!isParticipant) {
      console.log('User not authorized for this interview');
      return res.status(403).json({ message: 'Not authorized to join this interview' });
    }

    // Update interview status
    if (interview.status === 'waiting') {
      interview.status = 'active';
      interview.startTime = new Date();
      await interview.save();
      console.log('Interview status updated to active');
    }

    res.json(interview);
  } catch (error) {
    console.error('Interview join error:', error);
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