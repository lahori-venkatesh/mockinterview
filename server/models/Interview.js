const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['interviewer', 'interviewee'],
      required: true
    }
  }],
  domain: {
    type: String,
    required: true
  },
  selectedQuestions: [{
    question: String,
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard']
    },
    category: String
  }],
  status: {
    type: String,
    enum: ['pending', 'waiting', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  duration: {
    type: Number,
    default: 45 // minutes
  },
  startTime: Date,
  endTime: Date,
  feedback: [{
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    skills: [{
      skill: String,
      rating: Number
    }]
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);