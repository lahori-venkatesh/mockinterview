import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Star,
  Bolt,
  Security,
  Support,
  TrendingUp,
  Close
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Premium = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, plan: null });
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment/plans`);
      setPlans(response.data.plans);
    } catch (error) {
      setError('Failed to fetch pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planType) => {
    try {
      setPaymentLoading(true);
      setError('');

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const orderResponse = await axios.post(`${API_BASE_URL}/api/payment/create-order`, {
        planType
      });

      const { orderId, amount, currency, planName } = orderResponse.data;

      // Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        amount: amount,
        currency: currency,
        name: 'InterviewAce',
        description: `${planName} Subscription`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(`${API_BASE_URL}/api/payment/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: planType
            });

            setSuccess(verifyResponse.data.message);
            updateUser(verifyResponse.data.user);
            setConfirmDialog({ open: false, plan: null });
            
            // Redirect to dashboard after success
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } catch (error) {
            setError(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#1976d2'
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const premiumFeatures = [
    { icon: <Bolt />, text: 'Unlimited mock interviews' },
    { icon: <Star />, text: 'Priority matching with top interviewers' },
    { icon: <Security />, text: 'Advanced analytics and insights' },
    { icon: <Support />, text: '24/7 premium support' },
    { icon: <TrendingUp />, text: 'Detailed performance reports' },
    { icon: <CheckCircle />, text: 'Access to premium question bank' }
  ];

  if (user?.isPremium) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Star sx={{ fontSize: 64, color: 'gold', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            You're Already Premium!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Enjoy all the premium features and benefits.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            size="large"
          >
            Go to Dashboard
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Upgrade to Premium
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
          Unlock advanced features and accelerate your interview preparation
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Premium Features */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Premium Features
        </Typography>
        <Grid container spacing={2}>
          {premiumFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box display="flex" alignItems="center" p={1}>
                <Box color="primary.main" mr={2}>
                  {feature.icon}
                </Box>
                <Typography variant="body1">{feature.text}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Pricing Plans */}
      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={5} key={plan.type}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.type === 'yearly' ? '2px solid' : '1px solid',
                borderColor: plan.type === 'yearly' ? 'primary.main' : 'divider',
                '&:hover': {
                  boxShadow: 8,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {plan.type === 'yearly' && (
                <Chip
                  label="BEST VALUE"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold'
                  }}
                />
              )}
              
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  {plan.name}
                </Typography>
                
                <Box sx={{ my: 3 }}>
                  <Typography variant="h3" component="div" fontWeight="bold" color="primary">
                    ₹{plan.price}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    per {plan.type === 'monthly' ? 'month' : 'year'}
                  </Typography>
                  {plan.savings > 0 && (
                    <Chip
                      label={`Save ₹${plan.savings}`}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>

                <List dense>
                  {premiumFeatures.slice(0, 4).map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature.text}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  variant={plan.type === 'yearly' ? 'contained' : 'outlined'}
                  size="large"
                  fullWidth
                  onClick={() => setConfirmDialog({ open: true, plan })}
                  disabled={paymentLoading}
                  sx={{ mt: 3, py: 1.5 }}
                >
                  {paymentLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, plan: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Confirm Upgrade
            <Button
              onClick={() => setConfirmDialog({ open: false, plan: null })}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {confirmDialog.plan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {confirmDialog.plan.name}
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                ₹{confirmDialog.plan.price}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                You will be charged ₹{confirmDialog.plan.price} for the {confirmDialog.plan.name.toLowerCase()} subscription.
              </Typography>
              <Alert severity="info">
                Payment is processed securely through Razorpay. Your premium access will be activated immediately after successful payment.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setConfirmDialog({ open: false, plan: null })}
            disabled={paymentLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUpgrade(confirmDialog.plan?.type)}
            variant="contained"
            disabled={paymentLoading}
            startIcon={paymentLoading ? <CircularProgress size={20} /> : null}
          >
            {paymentLoading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Premium;