# 🎯 InterviewAce - Student Interview Platform

A comprehensive peer-to-peer interview practice platform built with React and Node.js, designed to help students and developers improve their technical interview skills through real-time mock interviews.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Registration/Login** - JWT-based authentication
- **Profile Setup** - Guided onboarding process
- **Forgot Password** - Email-based password recovery
- **Account Settings** - Password change, account deletion, privacy settings

### 👤 User Profiles
- **Complete Profile System** - Skills, experience, domain, bio
- **Profile Picture Upload** - Image upload with validation
- **Smart Matching** - Algorithm-based partner matching
- **Online Status** - Real-time availability tracking

### 🎥 Live Interview System
- **Real-time Video/Audio** - WebRTC-based communication
- **Automatic Role Assignment** - Interviewer/Interviewee rotation
- **Question Bank** - Domain-specific technical questions
- **Screen Recording Prevention** - Security measures against cheating
- **Interview Guidelines** - Strict behavioral rules enforcement

### 🛡️ Safety & Security
- **Reporting System** - Report inappropriate behavior
- **Content Moderation** - Automated behavior monitoring
- **Privacy Controls** - Profile visibility settings
- **Secure File Handling** - Safe image upload and storage

### 📊 Analytics & History
- **Interview History** - Track past interviews
- **Rating System** - Peer feedback and ratings
- **Performance Analytics** - Progress tracking
- **Premium Features** - Advanced matching options

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Material-UI (MUI)** - Professional UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Webcam** - Camera integration
- **Simple Peer** - WebRTC implementation

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-interview-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/student-interview
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-interview

JWT_SECRET=your-super-secret-jwt-key-here-make-this-more-secure-in-production
NODE_ENV=development
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/student-interview`

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 5. Populate Sample Data (Optional)
```bash
cd server
node add-dummy-data.js
```

This creates sample users for testing:
- Email: `alex.johnson@example.com`, Password: `password123`
- Email: `sarah.chen@example.com`, Password: `password123`
- And 6 more test accounts...

## 🏃‍♂️ Running the Application

### Development Mode (Recommended)
```bash
# From root directory - runs both client and server
npm run dev
```

### Manual Start
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm start
```

### Production Mode
```bash
# Build client
cd client
npm run build

# Start server
cd ../server
npm start
```

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 📱 Usage Guide

### Getting Started
1. **Register** - Create a new account
2. **Profile Setup** - Complete the 4-step onboarding
3. **Find Matches** - Browse available interview partners
4. **Start Interview** - Select questions and begin session

### Interview Process
1. **Role Assignment** - Automatic interviewer/interviewee assignment
2. **Video Setup** - Camera and microphone permissions
3. **Question Phase** - 45 minutes per role
4. **Role Switch** - Automatic role reversal
5. **Feedback** - Rate and review your partner

### Account Management
- **Profile Settings** - Update skills, experience, bio
- **Account Settings** - Change password, privacy settings
- **Security** - Two-factor authentication (coming soon)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/delete-account` - Delete account

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/matches` - Find interview partners
- `PUT /api/users/status` - Update online status
- `POST /api/users/upload-profile-picture` - Upload avatar
- `PUT /api/users/settings` - Update user settings

### Interviews
- `POST /api/interviews/create` - Create interview room
- `POST /api/interviews/join/:roomId` - Join interview
- `POST /api/interviews/:roomId/feedback` - Submit feedback
- `POST /api/interviews/:roomId/report` - Report user
- `GET /api/interviews/history` - Interview history

### Questions
- `GET /api/questions/:domain` - Get questions by domain
- `GET /api/questions/:domain/random` - Random questions

## 🏗️ Project Structure

```
student-interview-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── theme.js        # MUI theme
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads
│   └── index.js           # Server entry point
├── package.json           # Root package.json
└── README.md
```

## 🔒 Security Features

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- Secure password reset flow

### Interview Security
- Screen recording prevention
- Tab switching monitoring
- Behavioral guidelines enforcement
- Reporting system for violations

### Data Protection
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Rate limiting (recommended for production)

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-very-secure-jwt-secret-key
```

### Deployment Platforms
- **Heroku** - Easy deployment with MongoDB Atlas
- **Vercel** - Frontend deployment
- **Railway** - Full-stack deployment
- **DigitalOcean** - VPS deployment

### Production Checklist
- [ ] Set strong JWT secret
- [ ] Configure MongoDB Atlas
- [ ] Enable HTTPS
- [ ] Set up email service for password reset
- [ ] Configure file storage (AWS S3, Cloudinary)
- [ ] Add rate limiting
- [ ] Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongosh
# Or check Atlas connection string
```

**Port Already in Use**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

**Camera/Microphone Issues**
- Ensure HTTPS in production
- Check browser permissions
- Test with different browsers

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting guide

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] AI-powered question generation
- [ ] Advanced analytics dashboard
- [ ] Integration with coding platforms
- [ ] Group interview sessions
- [ ] Whiteboard collaboration
- [ ] Interview scheduling system
- [ ] Payment integration for premium features

---

**Built with ❤️ for the developer community**