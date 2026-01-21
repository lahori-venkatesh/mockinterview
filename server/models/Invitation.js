const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  invitationId: {
    type: String,
    required: true,
    unique: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  selectedQuestions: [
    {
      question: String,
      difficulty: String,
      category: String
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired'],
    default: 'pending'
  },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);







