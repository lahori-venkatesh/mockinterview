# 🚀 Deployment Guide

This guide covers various deployment options for InterviewAce platform.

## 📋 Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database setup completed
- [ ] SSL certificates ready (for production)
- [ ] Domain name configured
- [ ] Email service configured (for password reset)
- [ ] File storage configured (for profile pictures)

## 🌐 Deployment Options

### 1. Heroku (Recommended for beginners)

#### Prerequisites
- Heroku account
- Heroku CLI installed
- MongoDB Atlas account

#### Steps
```bash
# 1. Login to Heroku
heroku login

# 2. Create Heroku app
heroku create your-app-name

# 3. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secure-jwt-secret
heroku config:set MONGODB_URI=your-mongodb-atlas-uri

# 4. Deploy
git push heroku main

# 5. Open app
heroku open
```

#### Heroku Configuration
Create `Procfile` in root:
```
web: cd server && npm start
```

### 2. Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from client directory
cd client
vercel

# 3. Set environment variables in Vercel dashboard
# REACT_APP_API_URL=https://your-backend-url.railway.app
```

#### Backend on Railway
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

### 3. DigitalOcean Droplet

#### Server Setup
```bash
# 1. Create Ubuntu droplet
# 2. SSH into server
ssh root@your-server-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 5. Install PM2
sudo npm install -g pm2

# 6. Clone repository
git clone https://github.com/your-username/interview-platform.git
cd interview-platform

# 7. Install dependencies
npm run install-all

# 8. Build client
cd client
npm run build
cd ..

# 9. Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

#### PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'interview-platform',
    cwd: './server',
    script: 'index.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001
    }
  }]
};
```

### 4. Docker Deployment

#### Dockerfile (Backend)
```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
```

#### Dockerfile (Frontend)
```dockerfile
# client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: interview-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123

  backend:
    build: ./server
    container_name: interview-backend
    restart: unless-stopped
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password123@mongodb:27017/interview?authSource=admin
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mongodb

  frontend:
    build: ./client
    container_name: interview-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Essential
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/interview
JWT_SECRET=very-secure-random-string-min-32-chars

# Optional but recommended
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key

# Security
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com

# File Storage (if using cloud storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-s3-bucket
AWS_REGION=us-east-1
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/interview-platform
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/interview-platform/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor processes
pm2 monit

# Restart app
pm2 restart interview-platform

# View status
pm2 status
```

### Log Management
```bash
# Rotate logs
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm ci
        cd client && npm ci
        cd ../server && npm ci
        
    - name: Run tests
      run: |
        cd client && npm test -- --coverage --watchAll=false
        cd ../server && npm test
        
    - name: Build client
      run: |
        cd client && npm run build
        
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/interview-platform
          git pull origin main
          npm ci
          cd client && npm ci && npm run build
          cd ../server && npm ci
          pm2 restart interview-platform
```

## 🚨 Troubleshooting

### Common Issues

**Port already in use**
```bash
sudo lsof -ti:5001 | xargs sudo kill -9
```

**MongoDB connection issues**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

**PM2 process not starting**
```bash
# Check logs
pm2 logs interview-platform

# Delete and restart
pm2 delete interview-platform
pm2 start ecosystem.config.js --env production
```

**Nginx configuration issues**
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

## 📈 Performance Optimization

### Backend Optimizations
- Enable gzip compression
- Implement Redis caching
- Use connection pooling for MongoDB
- Add rate limiting
- Optimize database queries

### Frontend Optimizations
- Enable code splitting
- Implement lazy loading
- Optimize images
- Use CDN for static assets
- Enable service worker caching

### Database Optimizations
- Create proper indexes
- Implement data archiving
- Use read replicas for scaling
- Monitor query performance

## 🔐 Security Hardening

### Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh
```

### Application Security
- Use HTTPS everywhere
- Implement rate limiting
- Validate all inputs
- Use security headers
- Regular security audits
- Keep dependencies updated

---

For additional help with deployment, please check our [Contributing Guide](CONTRIBUTING.md) or create an issue on GitHub.