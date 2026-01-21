const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  skills: [{
    type: String
  }],
  domain: {
    type: String,
    enum: ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Mobile', 'DevOps', 'UI/UX', 'Not specified'],
    default: 'Not specified'
  },
  experience: {
    type: String,
    enum: ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years', 'Not specified'],
    default: 'Not specified'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say', 'Not specified'],
    default: 'Not specified'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiryDate: {
    type: Date
  },
  premiumPlan: {
    type: String,
    enum: ['monthly', 'yearly']
  },
  paymentHistory: [{
    orderId: String,
    paymentId: String,
    amount: Number,
    currency: String,
    planType: String,
    status: String,
    paidAt: Date
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalInterviews: {
    type: Number,
    default: 0
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  reports: [{
    reason: String,
    description: String,
    reportedAt: Date,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    interviewReminders: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    profileVisibility: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);