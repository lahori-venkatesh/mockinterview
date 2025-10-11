# Render Environment Variables Setup

## Required Environment Variables for Production

Add these environment variables in your Render dashboard:

### Backend Service Environment Variables:

1. **RAZORPAY_KEY_ID**
   - Value: `rzp_test_1234567890` (for testing)
   - For production: Get from https://dashboard.razorpay.com

2. **RAZORPAY_KEY_SECRET**
   - Value: `test_secret_key_1234567890` (for testing)
   - For production: Get from https://dashboard.razorpay.com

### Frontend Service Environment Variables:

1. **REACT_APP_RAZORPAY_KEY_ID**
   - Value: `rzp_test_1234567890` (for testing)
   - For production: Same as backend key ID

## How to Set Environment Variables in Render:

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add the variables listed above
6. Save and redeploy

## Development Mode Features:

- The system automatically detects development mode
- In development, payments are simulated (no real money charged)
- Users get premium access immediately for testing
- All payment flows work without actual Razorpay setup

## Production Setup:

1. Create Razorpay account at https://razorpay.com
2. Get your live API keys from dashboard
3. Replace test keys with live keys in Render environment
4. Test with small amounts first

## Testing the Payment System:

1. Go to `/premium` page
2. Click "Choose Monthly Premium" or "Choose Yearly Premium"
3. In development mode, payment will be simulated
4. User will get premium access immediately
5. Check payment history in account settings