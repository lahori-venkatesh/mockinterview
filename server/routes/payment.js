const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Initialize Razorpay (with fallback for development)
let razorpay = null;
const isDevelopment = process.env.NODE_ENV === 'development';

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !isDevelopment) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.log('Razorpay initialization failed, using mock mode');
  }
}

// Payment plans
const PLANS = {
  monthly: {
    amount: 29900, // 299 INR in paise
    currency: 'INR',
    duration: 30, // days
    name: 'Monthly Premium'
  },
  yearly: {
    amount: 199900, // 1999 INR in paise
    currency: 'INR',
    duration: 365, // days
    name: 'Yearly Premium'
  }
};

// Create payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { planType } = req.body;
    
    if (!PLANS[planType]) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const plan = PLANS[planType];
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPremium) {
      return res.status(400).json({ message: 'User is already premium' });
    }

    // Development mode - create mock order
    if (isDevelopment || !razorpay) {
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: plan.amount,
        currency: plan.currency,
        receipt: `receipt_${user._id}_${Date.now()}`,
        status: 'created'
      };

      return res.json({
        orderId: mockOrder.id,
        amount: mockOrder.amount,
        currency: mockOrder.currency,
        planType: planType,
        planName: plan.name,
        user: {
          name: user.name,
          email: user.email
        },
        isDevelopment: true
      });
    }

    // Production mode - create actual Razorpay order
    const options = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: `receipt_${user._id}_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        planType: planType,
        userEmail: user.email,
        userName: user.name
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planType: planType,
      planName: plan.name,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
});

// Verify payment and upgrade user
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planType,
      isDevelopment: clientDevelopment
    } = req.body;

    // Development mode - skip verification and directly upgrade
    if (isDevelopment || clientDevelopment || !razorpay) {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const plan = PLANS[planType];
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.duration);

      user.isPremium = true;
      user.premiumExpiryDate = expiryDate;
      user.premiumPlan = planType;
      user.paymentHistory = user.paymentHistory || [];
      user.paymentHistory.push({
        orderId: razorpay_order_id || `mock_order_${Date.now()}`,
        paymentId: razorpay_payment_id || `mock_payment_${Date.now()}`,
        amount: plan.amount,
        currency: plan.currency,
        planType: planType,
        status: 'success',
        paidAt: new Date()
      });

      await user.save();

      return res.json({
        message: 'Payment successful! You are now a premium user. (Development Mode)',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
          premiumExpiryDate: user.premiumExpiryDate,
          premiumPlan: user.premiumPlan,
          role: user.role
        }
      });
    }

    // Production mode - verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Payment not captured' });
    }

    // Update user to premium
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = PLANS[planType];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    user.isPremium = true;
    user.premiumExpiryDate = expiryDate;
    user.premiumPlan = planType;
    user.paymentHistory = user.paymentHistory || [];
    user.paymentHistory.push({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: payment.amount,
      currency: payment.currency,
      planType: planType,
      status: 'success',
      paidAt: new Date()
    });

    await user.save();

    res.json({
      message: 'Payment successful! You are now a premium user.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumExpiryDate: user.premiumExpiryDate,
        premiumPlan: user.premiumPlan,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('paymentHistory isPremium premiumExpiryDate premiumPlan');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      isPremium: user.isPremium,
      premiumExpiryDate: user.premiumExpiryDate,
      premiumPlan: user.premiumPlan,
      paymentHistory: user.paymentHistory || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
});

// Get pricing plans
router.get('/plans', (req, res) => {
  const plans = Object.keys(PLANS).map(key => ({
    type: key,
    name: PLANS[key].name,
    amount: PLANS[key].amount,
    currency: PLANS[key].currency,
    duration: PLANS[key].duration,
    price: PLANS[key].amount / 100, // Convert paise to rupees
    savings: key === 'yearly' ? Math.round(((PLANS.monthly.amount * 12) - PLANS[key].amount) / 100) : 0
  }));

  res.json({ plans });
});

module.exports = router;