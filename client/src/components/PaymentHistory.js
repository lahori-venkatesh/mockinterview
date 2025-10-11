import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Payment
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const PaymentHistory = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment/history`);
      setPaymentData(response.data);
    } catch (error) {
      setError('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'failed': return <Error />;
      default: return <Payment />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment History
      </Typography>

      {/* Premium Status */}
      {paymentData?.isPremium && (
        <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">Premium Active</Typography>
                <Typography variant="body2">
                  Plan: {paymentData.premiumPlan} | 
                  Expires: {formatDate(paymentData.premiumExpiryDate)}
                </Typography>
              </Box>
              <CheckCircle fontSize="large" />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Payment History Table */}
      {paymentData?.paymentHistory?.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment ID</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentData.paymentHistory.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(payment.paidAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.planType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatAmount(payment.amount)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {payment.paymentId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(payment.status)}
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          No payment history found. Upgrade to premium to see your payment records.
        </Alert>
      )}
    </Box>
  );
};

export default PaymentHistory;