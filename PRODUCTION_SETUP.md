# Production Setup Guide (No Docker)

This guide will help you deploy the Mock Interview Platform to production using traditional hosting services.

## 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd mock-interview-platform
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

2. **Environment Configuration**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your production values
   ```

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Razorpay account (for payments)
- Domain name (recommended)

## 🔧 Environment Variables

### Server (.env)
```env
# Server Configuration
PORT=5001
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-interview

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-chars

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Payments
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### Client (.env.production)
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_key_id
```

### Admin Panel (.env.production)
```env
REACT_APP_API_URL=https://your-api-domain.com
```

## 🌐 Deployment Options

### Option 1: Render (Recommended)

#### Server Deployment
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables in Render dashboard

#### Client Deployment
1. Create a new Static Site on Render
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/build`
4. Add environment variables

#### Admin Panel Deployment
1. Create another Static Site on Render
2. Set build command: `cd admin-panel && npm run build`
3. Set publish directory: `admin-panel/build`
4. Add environment variables

### Option 2: Vercel + Railway

#### Server (Railway)
1. Connect GitHub repo to Railway
2. Set root directory to `server`
3. Railway will auto-detect Node.js
4. Add environment variables

#### Client & Admin (Vercel)
1. Import project from GitHub
2. Set root directory to `client` for main app
3. Create separate project for `admin-panel`
4. Add environment variables

### Option 3: Netlify + Heroku

#### Server (Heroku)
```bash
# In server directory
echo "web: npm start" > Procfile
git subtree push --prefix server heroku main
```

#### Client & Admin (Netlify)
1. Connect GitHub repository
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/build`

## 🔒 Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong JWT secret (32+ characters)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and logging

## 📊 Performance Optimization

- [ ] Enable gzip compression (built-in)
- [ ] Use CDN for static assets
- [ ] Optimize database queries (implemented)
- [ ] Monitor memory usage
- [ ] Set up health checks

## 🔍 Monitoring

### Health Checks
- Server: `GET /api/health`
- Database: Monitor connection status

### Metrics to Track
- User registrations
- Interview sessions
- Payment success rates
- Server response times

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Verify frontend URL matches exactly

2. **Database Connection**
   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas

3. **Build Failures**
   - Ensure Node.js version is 18+
   - Check for missing dependencies

### Debug Commands
```bash
# Check server health
curl https://your-api-domain.com/api/health

# Test local build
npm run build:all

# Check environment variables
printenv | grep REACT_APP
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (Render/Vercel handle this)
- Deploy multiple server instances
- Use Redis for session storage (optional)

### Performance Monitoring
- Monitor CPU/memory usage
- Track response times
- Monitor database performance

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install and Build
        run: ./scripts/deploy.sh
      - name: Deploy to Render
        # Render auto-deploys on git push
```

## 📞 Support

For production support:
1. Check server logs in hosting dashboard
2. Test health endpoints
3. Review environment variables
4. Check database connection

## 🔗 Useful Links

- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Render Deployment](https://render.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://railway.app/docs)
- [Netlify Deployment](https://docs.netlify.com/)

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Payment gateway configured
- [ ] CORS origins set correctly
- [ ] SSL certificates enabled
- [ ] Health checks working
- [ ] Error monitoring set up
- [ ] Backup strategy in place