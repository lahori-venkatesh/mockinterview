# 🎯 MockInterview - Peer-to-Peer Interview Platform

A comprehensive full-stack platform for conducting mock interviews between peers, featuring real-time video calls with WebRTC, Socket.io-powered live invitations, domain-specific question banks, and integrated payment system for premium features.

## 🌐 Live Applications

- **🚀 Main Platform**: [https://mockwithpeers.vercel.app/](https://mockwithpeers.vercel.app/)
- **🔐 Admin Panel**: [https://mockadmin.vercel.app/](https://mockadmin.vercel.app/)
- **🔧 Backend API**: [https://mockinterview-bdve.onrender.com](https://mockinterview-bdve.onrender.com)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Admin Panel](#-admin-panel)
- [Premium Features](#-premium-features)
- [Database Schema](#-database-schema)
- [Real-time Features](#-real-time-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

## ✨ Features

### 🎥 Core Interview Features
- **Real-time Video Interviews** - WebRTC-powered peer-to-peer video calls with audio/video controls
- **Live Interview Invitations** - Socket.io-based real-time invitation system with instant notifications
- **Smart Peer Matching** - Browse and select interview partners based on domain, skills, and experience
- **Domain-specific Questions** - Curated question banks for 7+ tech domains (Frontend, Backend, Full Stack, Data Science, Mobile, DevOps, UI/UX)
- **Question Difficulty Levels** - Easy, Medium, and Hard questions with categories and tags
- **Interview Session Management** - Track interview status (pending, waiting, active, completed, rejected)
- **Performance Feedback System** - Rate partners, provide detailed feedback, and skill-based assessments
- **Interview History** - Complete history of past interviews with feedback and ratings

### 👤 User Management
- **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- **Profile Setup Wizard** - Guided profile completion with skills, domain, experience, and gender
- **Profile Pictures** - Upload and manage profile pictures with Multer
- **User Ratings** - Dynamic rating system based on interview feedback
- **Online Status Tracking** - Real-time user online/offline status
- **Account Settings** - Email notifications, interview reminders, profile visibility controls
- **Password Management** - Change password and forgot password functionality with reset tokens
- **Account Deletion** - Self-service account deletion with data cleanup

### 🔧 Admin Features
- **Comprehensive Dashboard** - User statistics, interview metrics, and platform analytics
- **User Management** - View, search, filter, promote, demote, and delete users
- **Question Bank Management** - Full CRUD operations for interview questions with domain categorization
- **Admin Management** - Create, promote, and manage admin accounts with role-based access
- **Reported Users** - Handle user reports and moderation
- **Payment Tracking** - Monitor premium subscriptions, payment history, and revenue analytics
- **Database Insights** - Real-time collection counts and database health monitoring

### 💳 Payment & Premium
- **Flexible Pricing Plans** - Monthly (₹299) and Yearly (₹1999) with ₹1589 annual savings
- **Razorpay Integration** - Secure payment gateway with order creation and verification
- **Development Mode** - Mock payment system for testing without actual transactions
- **Premium Features** - Unlimited interviews, priority matching, advanced analytics, premium support
- **Payment History** - Complete transaction records with order IDs, payment IDs, and timestamps
- **Auto-expiry Management** - Automatic premium status expiry tracking
- **Payment Verification** - Signature verification for secure payment processing

## 🛠 Tech Stack

### Frontend (Client & Admin Panel)
- **React.js 18.2.0** - Modern UI library with hooks and functional components
- **Material-UI (MUI) 5.15.3** - Comprehensive component library with theming
- **React Router DOM 6.8.1** - Client-side routing and navigation
- **Axios 1.6.2** - Promise-based HTTP client for API calls
- **Socket.io Client 4.7.4** - Real-time bidirectional communication
- **React Webcam 7.1.1** - Camera access for video interviews
- **Simple Peer 9.11.1** - WebRTC peer-to-peer connections
- **Recharts 2.8.0/3.2.1** - Data visualization for analytics
- **React Toastify 9.1.3** - Toast notifications
- **Styled Components 6.1.6** - CSS-in-JS styling
- **Lucide React 0.546.0** - Modern icon library

### Backend
- **Node.js 18+** - JavaScript runtime environment
- **Express.js 4.18.2** - Fast, minimalist web framework
- **Socket.io 4.7.4** - Real-time event-based communication
- **MongoDB with Mongoose 8.0.3** - NoSQL database with ODM
- **JWT (jsonwebtoken 9.0.2)** - Secure authentication tokens
- **Bcrypt.js 2.4.3** - Password hashing and encryption
- **Razorpay 2.9.6** - Payment gateway integration
- **Multer 1.4.5** - File upload middleware for profile pictures
- **UUID 9.0.1** - Unique identifier generation
- **Helmet 7.2.0** - Security headers middleware
- **Compression 1.8.1** - Gzip compression for responses
- **Express Rate Limit 7.5.1** - API rate limiting
- **CORS 2.8.5** - Cross-origin resource sharing
- **Dotenv 16.3.1** - Environment variable management

### Infrastructure & Deployment
- **Frontend Hosting** - Vercel (Static Site)
- **Admin Panel Hosting** - Vercel (Static Site)
- **Backend Hosting** - Render (Web Service)
- **Database** - MongoDB Atlas (Cloud Database)
- **File Storage** - Local file system with Multer (uploads directory)
- **SSL/HTTPS** - Automatic SSL certificates via hosting providers

### Development Tools
- **Nodemon 3.0.2** - Auto-restart development server
- **React Scripts 5.0.1** - Create React App build tools
- **Concurrently 8.2.2** - Run multiple npm scripts simultaneously
- **Git** - Version control

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Applications                          │
├─────────────────────────────────┬───────────────────────────────────┤
│   Main Platform (Vercel)        │   Admin Panel (Vercel)            │
│   • React 18 + Material-UI      │   • React 18 + Material-UI        │
│   • User Dashboard              │   • Admin Dashboard               │
│   • Interview Interface         │   • User Management               │
│   • WebRTC Video Calls          │   • Question Management           │
│   • Socket.io Client            │   • Analytics & Reports           │
│   • Payment Integration         │   • Admin Controls                │
└─────────────────────────────────┴───────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │   HTTPS/WSS (Secure)        │
                    └──────────────┬──────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                    Backend Server (Render)                           │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Express.js Application (Port 10000)                        │   │
│   │  • REST API Endpoints                                       │   │
│   │  • JWT Authentication Middleware                            │   │
│   │  • File Upload (Multer)                                     │   │
│   │  • Security (Helmet, CORS, Rate Limiting)                   │   │
│   │  • Compression & Performance                                │   │
│   └─────────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Socket.io Server                                           │   │
│   │  • Real-time Interview Invitations                          │   │
│   │  • WebRTC Signaling (Offer/Answer/ICE)                      │   │
│   │  • User Online Status Tracking                              │   │
│   │  • Connected Users Map                                      │   │
│   │  • Pending Invitations Management                           │   │
│   └─────────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  API Routes                                                 │   │
│   │  • /api/auth - Authentication & Authorization               │   │
│   │  • /api/users - User Profile Management                     │   │
│   │  • /api/interviews - Interview Sessions & Feedback          │   │
│   │  • /api/questions - Question Bank CRUD                      │   │
│   │  • /api/admin - Admin Operations                            │   │
│   │  • /api/payment - Razorpay Integration                      │   │
│   └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │   MongoDB Connection        │
                    └──────────────┬──────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                    MongoDB Atlas (Cloud)                             │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Database: student-interview                                │   │
│   │                                                             │   │
│   │  Collections:                                               │   │
│   │  • users - User accounts, profiles, premium status          │   │
│   │  • questions - Interview question bank                      │   │
│   │  • interviews - Interview sessions & feedback               │   │
│   │  • invitations - Interview invitation tracking              │   │
│   │                                                             │   │
│   │  Indexes: email (unique), domain, status, timestamps        │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    External Services                                 │
├─────────────────────────────────┬───────────────────────────────────┤
│   Razorpay Payment Gateway      │   File Storage (Local)            │
│   • Order Creation              │   • Profile Pictures              │
│   • Payment Verification        │   • /uploads directory            │
│   • Webhook Handling            │   • Multer middleware             │
└─────────────────────────────────┴───────────────────────────────────┘

Data Flow:
1. User Authentication: Client → JWT Token → Protected Routes
2. Real-time Invitations: Client A → Socket.io → Server → Socket.io → Client B
3. WebRTC Video: Client A ↔ Signaling Server ↔ Client B → Direct P2P Connection
4. Payment: Client → Razorpay → Server Verification → Database Update
5. File Upload: Client → Multer → Local Storage → Database URL Reference
```

## 📁 Project Structure

```
mockinterview/
├── client/                          # Main user-facing React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── admin/               # Admin-specific components
│   │   │   ├── GlobalInvitationHandler.js
│   │   │   ├── InterviewInvitation.js
│   │   │   ├── Navbar.js
│   │   │   └── PaymentHistory.js
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AuthContext.js       # Authentication state
│   │   │   └── InvitationContext.js # Real-time invitations
│   │   ├── pages/                   # Page components
│   │   │   ├── LandingPage.js       # Public landing page
│   │   │   ├── Login.js & Register.js
│   │   │   ├── Dashboard.js         # User dashboard
│   │   │   ├── FindMatch.js         # Browse interview partners
│   │   │   ├── Interview.js         # Video interview room
│   │   │   ├── Invitations.js       # Invitation management
│   │   │   ├── Profile.js           # User profile
│   │   │   ├── Premium.js           # Premium subscription
│   │   │   ├── History.js           # Interview history
│   │   │   └── AccountSettings.js   # User settings
│   │   ├── config/                  # Configuration files
│   │   ├── App.js                   # Main app component
│   │   ├── index.js                 # Entry point
│   │   └── theme.js                 # MUI theme configuration
│   ├── .env.development             # Development environment
│   ├── .env.production              # Production environment
│   └── package.json
│
├── admin-panel/                     # Admin dashboard React application
│   ├── src/
│   │   ├── components/              # Admin components
│   │   │   ├── AdminManagement.js
│   │   │   ├── QuestionManagement.js
│   │   │   ├── UserManagement.js
│   │   │   └── Navbar.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js       # Admin authentication
│   │   ├── pages/
│   │   │   ├── Login.js             # Admin login
│   │   │   └── Dashboard.js         # Admin dashboard
│   │   ├── config/
│   │   └── App.js
│   ├── .env.development
│   ├── .env.production
│   └── package.json
│
├── server/                          # Node.js/Express backend
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js                  # User model with auth
│   │   ├── Interview.js             # Interview sessions
│   │   ├── Question.js              # Question bank
│   │   └── Invitation.js            # Interview invitations
│   ├── routes/                      # API route handlers
│   │   ├── auth.js                  # Authentication endpoints
│   │   ├── users.js                 # User management
│   │   ├── interviews.js            # Interview operations
│   │   ├── questions.js             # Question CRUD
│   │   ├── admin.js                 # Admin operations
│   │   └── payment.js               # Razorpay integration
│   ├── middleware/
│   │   └── auth.js                  # JWT verification
│   ├── uploads/                     # File upload storage
│   │   └── profile-pictures/
│   ├── scripts/
│   │   └── add-dummy-data.js        # Database seeding
│   ├── index.js                     # Server entry point
│   ├── healthcheck.js               # Health check script
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Environment template
│   └── package.json
│
├── scripts/
│   └── deploy.sh                    # Deployment script
│
├── docs/                            # Documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── PRODUCTION_SETUP.md          # Production setup
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   ├── CHANGELOG.md                 # Version history
│   └── INTERVIEW_INVITATION_IMPLEMENTATION.md
│
├── render.yaml                      # Render deployment config
├── package.json                     # Root package file
└── README.md                        # This file
```

## 🚀 Installation

### Prerequisites
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Razorpay** account for payments ([Sign up](https://razorpay.com/))
- **Git** for version control

### Quick Start (All-in-One)

```bash
# Clone the repository
git clone https://github.com/lahori-venkatesh/mockinterview.git
cd mockinterview

# Install all dependencies (root, server, client, admin-panel)
npm run install-all

# Setup environment variables (see Environment Setup section)
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Run development servers (all three apps concurrently)
npm run dev
```

### Individual Setup

#### 1. Backend Server Setup
```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI, JWT secret, etc.
nano .env  # or use your preferred editor

# Start development server (with auto-reload)
npm run dev

# Or start production server
npm start
```

#### 2. Frontend Client Setup
```bash
cd client

# Install dependencies
npm install

# Create environment file
cp .env.development .env.development

# Edit with your API URL
nano .env.development

# Start development server (runs on port 3000)
npm start

# Build for production
npm run build
```

#### 3. Admin Panel Setup
```bash
cd admin-panel

# Install dependencies
npm install

# Create environment file
cp .env.development .env.development

# Edit with your API URL
nano .env.development

# Start development server (runs on port 3001)
npm start

# Build for production
npm run build
```

### Database Setup

```bash
# Optional: Seed database with dummy data for testing
cd server
node add-dummy-data.js
```

## 🔧 Environment Setup

### Backend Environment Variables (server/.env)

```env
# Server Configuration
PORT=10000                           # Server port (default: 10000 for Render)
NODE_ENV=development                 # Environment: development | production

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/student-interview?retryWrites=true&w=majority&appName=Cluster0

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d                    # Token expiry duration

# Security Configuration
BCRYPT_ROUNDS=12                     # Password hashing rounds
RESET_TOKEN_EXPIRES_IN=1h            # Password reset token expiry

# CORS Configuration
CORS_ORIGIN=http://localhost:3000    # Frontend URL (comma-separated for multiple)

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_id              # Test: rzp_test_xxx, Live: rzp_live_xxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret      # Secret key from Razorpay dashboard

# File Upload Configuration
MAX_FILE_SIZE=5242880                # 5MB in bytes
UPLOAD_PATH=./uploads                # Upload directory path

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100          # Max requests per window

# Logging
LOG_LEVEL=info                       # Log level: error | warn | info | debug

# Email Configuration (Optional - for password reset)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

### Frontend Environment Variables (client/.env.development)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:10000          # Backend API URL

# Razorpay Configuration
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id    # Must match backend key
```

### Frontend Production Variables (client/.env.production)

```env
# Production API Configuration
REACT_APP_API_URL=https://mockinterview-bdve.onrender.com

# Razorpay Live Configuration
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_key_id
```

### Admin Panel Environment Variables (admin-panel/.env.development)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:10000          # Backend API URL
```

### Admin Panel Production Variables (admin-panel/.env.production)

```env
# Production API Configuration
REACT_APP_API_URL=https://mockinterview-bdve.onrender.com
```

### Environment Variable Notes

1. **MongoDB URI**: Get from MongoDB Atlas → Connect → Connect your application
2. **JWT Secret**: Generate a strong random string (min 32 characters)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Razorpay Keys**: Get from Razorpay Dashboard → Settings → API Keys
4. **CORS Origin**: 
   - Development: `http://localhost:3000`
   - Production: Your Vercel deployment URL
   - Multiple origins: Comma-separated or configure in code
5. **Port**: 
   - Development: Any available port (5001, 10000, etc.)
   - Production (Render): Use 10000 or let Render assign via PORT env var

## 📖 Usage Guide

### For Users

#### 1. Getting Started
```
1. Visit https://mockwithpeers.vercel.app/
2. Click "Register" to create a new account
3. Provide: Name, Email, Password (min 6 characters)
4. Login with your credentials
```

#### 2. Profile Setup (Required)
```
Complete your profile to start using the platform:
• Skills: Add your technical skills (e.g., React, Node.js, Python)
• Domain: Select your expertise (Frontend, Backend, Full Stack, etc.)
• Experience: Choose your experience level (Fresher, 0-1 years, etc.)
• Gender: Optional demographic information
• Profile Picture: Upload a professional photo (optional)
• Bio: Write a brief introduction (max 500 characters)
```

#### 3. Finding Interview Partners
```
Navigate to "Find Match":
• Browse available users filtered by domain
• View user profiles: skills, experience, rating
• Click "Send Interview Invitation" on desired partner
• Select interview questions from the question bank
• Send invitation and wait for response
```

#### 4. Managing Invitations
```
Received Invitations:
• Real-time notification when someone invites you
• View invitation details: interviewer info, domain, questions
• Accept: Automatically join interview room
• Decline: Politely reject the invitation

Sent Invitations:
• Track invitations you've sent
• View status: pending, accepted, rejected, cancelled
• Cancel pending invitations if needed
```

#### 5. Conducting Interviews
```
Interview Room Features:
• Real-time video and audio communication
• View selected interview questions
• Toggle camera and microphone
• End interview when complete
• Automatic session tracking
```

#### 6. Providing Feedback
```
After Interview:
• Rate your partner (1-5 stars)
• Provide detailed comments
• Rate specific skills
• Submit feedback to help improve the community
```

#### 7. Viewing History
```
Interview History:
• View all past interviews
• See feedback received from partners
• Track your rating progression
• Review interview details and dates
```

#### 8. Premium Subscription
```
Upgrade to Premium:
• Navigate to "Premium" page
• Choose plan: Monthly (₹299) or Yearly (₹1999)
• Click "Subscribe Now"
• Complete payment via Razorpay
• Instant premium activation
• Access unlimited interviews and premium features
```

#### 9. Account Management
```
Account Settings:
• Update profile information
• Change password
• Manage notification preferences
• Control profile visibility
• Delete account (if needed)
```

### For Admins

#### 1. Admin Access
```
1. Visit https://mockadmin.vercel.app/
2. Login with admin credentials
3. Access comprehensive admin dashboard
```

#### 2. Dashboard Overview
```
View Platform Statistics:
• Total users count
• Total interviews conducted
• Premium users count
• Total questions in bank
• Recent activity and trends
```

#### 3. User Management
```
User Operations:
• View all registered users
• Search users by name or email
• Filter by domain, experience, premium status
• View detailed user profiles
• Promote users to admin role
• Demote admins to regular users
• Delete user accounts
• View user reports and handle moderation
```

#### 4. Question Bank Management
```
Question Operations:
• View all interview questions
• Add new questions with:
  - Question text
  - Domain (Frontend, Backend, etc.)
  - Category (e.g., JavaScript, Algorithms)
  - Difficulty (Easy, Medium, Hard)
  - Type (multiple-choice, coding, open-ended)
  - Tags for better organization
• Edit existing questions
• Delete outdated questions
• Filter questions by domain and difficulty
```

#### 5. Admin Management
```
Admin Operations:
• View all admin accounts
• Create new admin accounts
• Promote regular users to admin
• Demote admins to regular users
• Manage admin permissions
```

#### 6. Payment Tracking
```
Monitor Payments:
• View all premium subscriptions
• Track payment history
• Monitor revenue analytics
• View payment details (order ID, amount, date)
• Track subscription expiry dates
```

#### 7. Analytics & Reports
```
Platform Insights:
• User growth trends
• Interview activity metrics
• Premium conversion rates
• Popular domains and questions
• User engagement statistics
```

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:10000`
- **Production**: `https://mockinterview-bdve.onrender.com`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "skills": ["React", "Node.js"],
  "domain": "Full Stack",
  "experience": "1-3 years",
  "gender": "Male"
}

Response: 201 Created
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: 200 OK
{
  "message": "Password reset email sent successfully",
  "resetToken": "token_here"  // Only in development
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "newpassword123"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

#### Change Password (Authenticated)
```http
PUT /api/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

#### Delete Account (Authenticated)
```http
DELETE /api/auth/delete-account
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "message": "Account deleted successfully"
}
```

### User Endpoints

#### Get User Profile (Authenticated)
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["React", "Node.js"],
    "domain": "Full Stack",
    "experience": "1-3 years",
    "rating": 4.5,
    "totalInterviews": 10,
    "isPremium": true,
    ...
  }
}
```

#### Update User Profile (Authenticated)
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Updated",
  "skills": ["React", "Node.js", "MongoDB"],
  "bio": "Full stack developer with 3 years experience"
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### Upload Profile Picture (Authenticated)
```http
POST /api/users/profile-picture
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

FormData: profilePicture (file)

Response: 200 OK
{
  "message": "Profile picture updated successfully",
  "profilePicture": "/uploads/profile-pictures/filename.jpg"
}
```

#### Search Users (Authenticated)
```http
GET /api/users/search?domain=Frontend&experience=1-3 years
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "users": [
    {
      "_id": "user_id",
      "name": "Jane Doe",
      "domain": "Frontend",
      "skills": ["React", "Vue"],
      "rating": 4.8,
      ...
    }
  ]
}
```

### Interview Endpoints

#### Send Interview Invitation (Authenticated)
```http
POST /api/interviews/send-invitation
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "participantId": "user_id",
  "domain": "Frontend",
  "selectedQuestions": [
    {
      "question": "What is React?",
      "difficulty": "Easy",
      "category": "React"
    }
  ]
}

Response: 201 Created
{
  "message": "Interview invitation sent",
  "invitationId": "uuid",
  "invitation": { ... }
}
```

#### Respond to Invitation (Authenticated)
```http
POST /api/interviews/respond-invitation/:invitationId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "response": "accept"  // or "reject"
}

Response: 200 OK
{
  "message": "Invitation accepted",
  "roomId": "uuid",
  "interview": { ... }
}
```

#### Get Pending Invitations (Authenticated)
```http
GET /api/interviews/pending-invitations
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "invitations": [ ... ]
}
```

#### Get Sent Invitations (Authenticated)
```http
GET /api/interviews/sent-invitations
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "invitations": [ ... ]
}
```

#### Cancel Invitation (Authenticated)
```http
POST /api/interviews/cancel-invitation/:invitationId
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "message": "Invitation cancelled"
}
```

#### Join Interview (Authenticated)
```http
POST /api/interviews/join/:roomId
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "roomId": "uuid",
  "participants": [ ... ],
  "selectedQuestions": [ ... ],
  "status": "active"
}
```

#### Submit Feedback (Authenticated)
```http
POST /api/interviews/:roomId/feedback
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "toUserId": "user_id",
  "rating": 5,
  "comments": "Great interview!",
  "skills": [
    { "skill": "React", "rating": 5 },
    { "skill": "Communication", "rating": 4 }
  ]
}

Response: 200 OK
{
  "message": "Feedback submitted successfully"
}
```

#### Get Interview History (Authenticated)
```http
GET /api/interviews/history
Authorization: Bearer <jwt_token>

Response: 200 OK
[
  {
    "roomId": "uuid",
    "participants": [ ... ],
    "domain": "Frontend",
    "status": "completed",
    "startTime": "2024-10-11T10:00:00Z",
    "feedback": [ ... ]
  }
]
```

#### Report User (Authenticated)
```http
POST /api/interviews/:roomId/report
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reportedUserId": "user_id",
  "reason": "Inappropriate behavior"
}

Response: 200 OK
{
  "message": "Report submitted successfully"
}
```

### Question Endpoints

#### Get Questions (Authenticated)
```http
GET /api/questions?domain=Frontend&difficulty=Medium
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "questions": [
    {
      "_id": "question_id",
      "question": "Explain React hooks",
      "domain": "Frontend",
      "category": "React",
      "difficulty": "Medium",
      "type": "open-ended"
    }
  ]
}
```

#### Get Random Questions (Authenticated)
```http
GET /api/questions/random?domain=Backend&count=5
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "questions": [ ... ]
}
```

### Payment Endpoints

#### Get Pricing Plans
```http
GET /api/payment/plans

Response: 200 OK
{
  "plans": [
    {
      "type": "monthly",
      "name": "Monthly Premium",
      "amount": 29900,
      "currency": "INR",
      "duration": 30,
      "price": 299,
      "savings": 0
    },
    {
      "type": "yearly",
      "name": "Yearly Premium",
      "amount": 199900,
      "currency": "INR",
      "duration": 365,
      "price": 1999,
      "savings": 1589
    }
  ]
}
```

#### Create Payment Order (Authenticated)
```http
POST /api/payment/create-order
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "planType": "monthly"  // or "yearly"
}

Response: 200 OK
{
  "orderId": "order_id",
  "amount": 29900,
  "currency": "INR",
  "planType": "monthly",
  "planName": "Monthly Premium",
  "user": { ... }
}
```

#### Verify Payment (Authenticated)
```http
POST /api/payment/verify-payment
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature",
  "planType": "monthly"
}

Response: 200 OK
{
  "message": "Payment successful! You are now a premium user.",
  "user": { ... }
}
```

#### Get Payment History (Authenticated)
```http
GET /api/payment/history
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "isPremium": true,
  "premiumExpiryDate": "2024-11-11T00:00:00Z",
  "premiumPlan": "monthly",
  "paymentHistory": [
    {
      "orderId": "order_id",
      "paymentId": "payment_id",
      "amount": 29900,
      "currency": "INR",
      "planType": "monthly",
      "status": "success",
      "paidAt": "2024-10-11T10:00:00Z"
    }
  ]
}
```

### Admin Endpoints (Admin Only)

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "users": [ ... ]
}
```

#### Get Platform Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "totalUsers": 1000,
  "premiumUsers": 150,
  "totalInterviews": 5000,
  "totalQuestions": 500,
  ...
}
```

#### Add Question
```http
POST /api/admin/questions
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "question": "What is closure in JavaScript?",
  "domain": "Frontend",
  "category": "JavaScript",
  "difficulty": "Medium",
  "type": "open-ended",
  "tags": ["javascript", "closure", "scope"]
}

Response: 201 Created
{
  "message": "Question added successfully",
  "question": { ... }
}
```

#### Promote User to Admin
```http
PUT /api/admin/promote-user/:userId
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "message": "User promoted to admin successfully"
}
```

#### Delete User
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "message": "User deleted successfully"
}
```

### Health Check Endpoint

```http
GET /api/health

Response: 200 OK
{
  "message": "Server is running",
  "timestamp": "2024-10-11T10:00:00Z"
}
```

### Debug Endpoint (Development Only)

```http
GET /api/debug/connected-users

Response: 200 OK
{
  "totalConnected": 5,
  "users": [
    { "userId": "user_id", "socketId": "socket_id" }
  ],
  "timestamp": "2024-10-11T10:00:00Z"
}
```

### Error Responses

All endpoints may return these error responses:

```http
400 Bad Request
{
  "message": "Error description"
}

401 Unauthorized
{
  "message": "Authentication required" / "Invalid token"
}

403 Forbidden
{
  "message": "Not authorized to access this resource"
}

404 Not Found
{
  "message": "Resource not found"
}

500 Internal Server Error
{
  "message": "Server error",
  "error": "Error details"
}
```

## 🗄 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  skills: [String],
  domain: Enum ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Mobile', 'DevOps', 'UI/UX', 'Not specified'],
  experience: Enum ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years', 'Not specified'],
  gender: Enum ['Male', 'Female', 'Other', 'Prefer not to say', 'Not specified'],
  isPremium: Boolean (default: false),
  premiumExpiryDate: Date,
  premiumPlan: Enum ['monthly', 'yearly'],
  paymentHistory: [{
    orderId: String,
    paymentId: String,
    amount: Number,
    currency: String,
    planType: String,
    status: String,
    paidAt: Date
  }],
  rating: Number (0-5, default: 0),
  totalInterviews: Number (default: 0),
  profilePicture: String,
  isOnline: Boolean (default: false),
  lastActive: Date,
  bio: String (max: 500),
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  role: Enum ['user', 'admin'] (default: 'user'),
  lastLogin: Date,
  reports: [{
    reason: String,
    description: String,
    reportedAt: Date,
    reportedBy: ObjectId (ref: User)
  }],
  settings: {
    emailNotifications: Boolean (default: true),
    interviewReminders: Boolean (default: true),
    marketingEmails: Boolean (default: false),
    profileVisibility: Boolean (default: true)
  },
  timestamps: true (createdAt, updatedAt)
}
```

### Interview Model
```javascript
{
  roomId: String (required, unique),
  participants: [{
    userId: ObjectId (ref: User, required),
    role: Enum ['interviewer', 'interviewee'] (required)
  }],
  domain: String (required),
  selectedQuestions: [{
    question: String,
    difficulty: Enum ['Easy', 'Medium', 'Hard'],
    category: String
  }],
  status: Enum ['pending', 'waiting', 'active', 'completed', 'cancelled', 'rejected'] (default: 'pending'),
  duration: Number (default: 45 minutes),
  startTime: Date,
  endTime: Date,
  feedback: [{
    fromUser: ObjectId (ref: User),
    toUser: ObjectId (ref: User),
    rating: Number (1-5),
    comments: String,
    skills: [{
      skill: String,
      rating: Number
    }]
  }],
  isPremium: Boolean (default: false),
  reports: [{
    reportedBy: ObjectId (ref: User),
    reportedUser: ObjectId (ref: User),
    reason: String,
    timestamp: Date
  }],
  timestamps: true (createdAt, updatedAt)
}
```

### Question Model
```javascript
{
  question: String (required),
  domain: Enum ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Mobile', 'DevOps', 'UI/UX'] (required),
  category: String (required),
  difficulty: Enum ['Easy', 'Medium', 'Hard'] (required),
  type: Enum ['multiple-choice', 'coding', 'open-ended'] (default: 'open-ended'),
  options: [String],
  correctAnswer: String,
  tags: [String],
  sampleAnswer: String,
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  usageCount: Number (default: 0),
  timestamps: true (createdAt, updatedAt)
}
```

### Invitation Model
```javascript
{
  invitationId: String (required, unique),
  interviewer: ObjectId (ref: User, required),
  participant: ObjectId (ref: User, required),
  domain: String (required),
  selectedQuestions: [{
    question: String,
    difficulty: String,
    category: String
  }],
  status: Enum ['pending', 'accepted', 'rejected', 'cancelled', 'expired'] (default: 'pending'),
  expiresAt: Date,
  timestamps: true (createdAt, updatedAt)
}
```

## 🔄 Real-time Features

### Socket.io Events

#### Client → Server Events

**user-online**
```javascript
socket.emit('user-online', {
  _id: userId,
  name: userName
});
// User joins their personal room for notifications
```

**send-interview-invitation**
```javascript
socket.emit('send-interview-invitation', {
  inviteeId: 'user_id',
  inviterName: 'John Doe',
  roomId: 'uuid',
  domain: 'Frontend',
  questions: [...]
});
// Send interview invitation to another user
```

**respond-to-invitation**
```javascript
socket.emit('respond-to-invitation', {
  roomId: 'uuid',
  accepted: true  // or false
});
// Accept or reject an interview invitation
```

**join-interview**
```javascript
socket.emit('join-interview', {
  roomId: 'uuid',
  userId: 'user_id',
  role: 'interviewer'  // or 'interviewee'
});
// Join an interview room
```

**WebRTC Signaling Events**
```javascript
// Send WebRTC offer
socket.emit('offer', {
  roomId: 'uuid',
  offer: rtcOffer
});

// Send WebRTC answer
socket.emit('answer', {
  roomId: 'uuid',
  answer: rtcAnswer
});

// Send ICE candidate
socket.emit('ice-candidate', {
  roomId: 'uuid',
  candidate: iceCandidate
});
```

#### Server → Client Events

**interview-invitation-received**
```javascript
socket.on('interview-invitation-received', (data) => {
  // data: { roomId, inviterName, domain, questions, timestamp }
  // Display invitation notification to user
});
```

**invitation-accepted**
```javascript
socket.on('invitation-accepted', (data) => {
  // data: { roomId }
  // Notify inviter that invitation was accepted
});
```

**invitation-rejected**
```javascript
socket.on('invitation-rejected', (data) => {
  // data: { roomId }
  // Notify inviter that invitation was rejected
});
```

**invitation-failed**
```javascript
socket.on('invitation-failed', (data) => {
  // data: { message }
  // User is offline or invitation failed
});
```

**user-joined**
```javascript
socket.on('user-joined', (data) => {
  // data: { userId, role }
  // Another user joined the interview room
});
```

**WebRTC Signaling Events**
```javascript
// Receive WebRTC offer
socket.on('offer', (offer) => {
  // Handle incoming offer
});

// Receive WebRTC answer
socket.on('answer', (answer) => {
  // Handle incoming answer
});

// Receive ICE candidate
socket.on('ice-candidate', (candidate) => {
  // Handle incoming ICE candidate
});
```

### WebRTC Video Connection Flow

```
1. User A sends invitation → User B accepts
2. Both users join interview room via Socket.io
3. User A creates RTCPeerConnection
4. User A creates offer → sends via Socket.io
5. User B receives offer → creates answer → sends via Socket.io
6. User A receives answer → connection established
7. ICE candidates exchanged for optimal connection
8. Direct peer-to-peer video/audio stream established
```

### Connected Users Tracking

The server maintains a Map of connected users:
```javascript
connectedUsers: Map<userId, socketId>
```

This enables:
- Real-time invitation delivery
- Online status tracking
- Targeted notifications
- Connection management

## 🔐 Admin Panel

The admin panel provides comprehensive management capabilities:

### Features
- **Dashboard Analytics** - User statistics, interview metrics, revenue tracking
- **User Management** - View, search, filter, promote, demote, delete users
- **Question Management** - Full CRUD operations for interview questions
- **Admin Management** - Create, promote, and manage admin accounts
- **Payment Tracking** - Monitor premium subscriptions and payment history
- **Reported Users** - Handle user reports and moderation
- **Database Insights** - Real-time collection counts and health monitoring

### Access
- **URL**: [https://mockadmin.vercel.app/](https://mockadmin.vercel.app/)
- **Login**: Admin credentials required (role: 'admin' in database)
- **Security**: Role-based access control with JWT verification

### Admin Operations
- View all users with detailed profiles
- Search and filter users by domain, experience, premium status
- Promote regular users to admin role
- Demote admins to regular users
- Delete user accounts with data cleanup
- Add, edit, delete interview questions
- View platform analytics and statistics
- Monitor payment transactions and revenue

## 💎 Premium Features

### Pricing Plans

#### Monthly Plan - ₹299/month
- ✅ Unlimited mock interviews
- ✅ Priority matching algorithm
- ✅ Advanced analytics dashboard
- ✅ Premium support
- ✅ No interview limits
- ✅ Access to all question banks
- ✅ Detailed performance insights
- ✅ Interview history export

#### Yearly Plan - ₹1999/year (Best Value)
- ✅ All monthly features included
- ✅ **Save ₹1589 annually** (33% discount)
- ✅ Extended premium support
- ✅ Early access to new features
- ✅ Priority bug fixes
- ✅ Exclusive beta features
- ✅ Annual performance report
- ✅ Certificate of completion

### Payment Integration

#### Razorpay Gateway
- **Secure Payment Processing** - PCI DSS compliant
- **Multiple Payment Methods** - Cards, UPI, Net Banking, Wallets
- **Instant Activation** - Premium features activated immediately
- **Payment Verification** - Signature verification for security
- **Order Tracking** - Complete order and payment ID tracking

#### Development Mode
- **Mock Payments** - Test without actual transactions
- **Instant Activation** - Simulate successful payments
- **No Razorpay Required** - Works without API keys in development

#### Payment Flow
```
1. User selects plan (Monthly/Yearly)
2. Click "Subscribe Now"
3. Razorpay checkout opens
4. Complete payment
5. Server verifies payment signature
6. User upgraded to premium instantly
7. Payment recorded in history
8. Premium expiry date set
```

#### Payment History
- View all past transactions
- Order IDs and Payment IDs
- Amount and currency
- Plan type and duration
- Payment status and date
- Download receipts (future feature)

## 🚀 Deployment

### Current Deployment

The platform is currently deployed on:
- **Frontend**: Vercel (https://mockwithpeers.vercel.app/)
- **Admin Panel**: Vercel (https://mockadmin.vercel.app/)
- **Backend**: Render (https://mockinterview-bdve.onrender.com)
- **Database**: MongoDB Atlas

### Deployment Options

#### Option 1: Vercel + Render (Current Setup)

**Backend on Render:**
1. Connect GitHub repository to Render
2. Create new Web Service
3. Build Command: `cd server && npm install`
4. Start Command: `cd server && npm start`
5. Add environment variables from `.env.example`
6. Deploy

**Frontend on Vercel:**
1. Import project from GitHub
2. Framework Preset: Create React App
3. Root Directory: `client`
4. Build Command: `npm run build`
5. Output Directory: `build`
6. Add environment variables
7. Deploy

**Admin Panel on Vercel:**
1. Create new project from same repository
2. Root Directory: `admin-panel`
3. Build Command: `npm run build`
4. Output Directory: `build`
5. Add environment variables
6. Deploy

#### Option 2: All-in-One Deployment Script

```bash
# Use the provided deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

#### Option 3: Docker Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Docker and other deployment options.

### Environment Variables for Production

**Backend (Render):**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<strong_random_secret>
RAZORPAY_KEY_ID=rzp_live_<your_key>
RAZORPAY_KEY_SECRET=<your_secret>
CORS_ORIGIN=https://mockwithpeers.vercel.app
```

**Frontend (Vercel):**
```env
REACT_APP_API_URL=https://mockinterview-bdve.onrender.com
REACT_APP_RAZORPAY_KEY_ID=rzp_live_<your_key>
```

**Admin Panel (Vercel):**
```env
REACT_APP_API_URL=https://mockinterview-bdve.onrender.com
```

### Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection verified
- [ ] CORS origins updated
- [ ] Payment gateway tested
- [ ] SSL certificates active
- [ ] Health check endpoint responding
- [ ] Socket.io connections working
- [ ] WebRTC video calls functional
- [ ] File uploads working
- [ ] Admin panel accessible

### Monitoring

- **Health Check**: `GET /api/health`
- **Connected Users**: `GET /api/debug/connected-users`
- **Server Logs**: Check Render dashboard
- **Database Metrics**: MongoDB Atlas monitoring
- **Error Tracking**: Check application logs

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mockinterview.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git commit -m 'feat: Add some AmazingFeature'
   ```
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Provide clear description
   - Reference related issues
   - Add screenshots for UI changes
   - Ensure all tests pass

### Contribution Guidelines

- **Code Style**: Follow existing patterns and conventions
- **Documentation**: Update README and comments as needed
- **Testing**: Add tests for new features
- **Commits**: Write clear, descriptive commit messages
- **Pull Requests**: Keep PRs focused and reasonably sized
- **Issues**: Check existing issues before creating new ones

### Areas for Contribution

- 🐛 **Bug Fixes** - Fix existing bugs and issues
- ✨ **New Features** - Add new functionality
- 📚 **Documentation** - Improve docs and guides
- 🎨 **UI/UX** - Enhance user interface and experience
- 🔧 **Performance** - Optimize code and queries
- 🧪 **Testing** - Increase test coverage
- 🌐 **Localization** - Add multi-language support
- ♿ **Accessibility** - Improve accessibility features

### Development Setup for Contributors

```bash
# Install all dependencies
npm run install-all

# Run all services in development
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

### Getting Help

- 📖 Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines
- 💬 Join discussions on GitHub
- 📧 Email: lahorivenkatesh709@gmail.com
- 🐛 Report bugs via GitHub Issues

### Contributors

We appreciate all contributors who help make this project better:

- **[Lahori Venkatesh](mailto:lahorivenkatesh709@gmail.com)** - Project Creator & Lead Developer

*Your name could be here! Join us in building the future of interview preparation.*

### Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Credited in project documentation
- Given special badges (future feature)

## 🔒 Security

### Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with 12 rounds
- **CORS Protection** - Configured allowed origins
- **Rate Limiting** - API rate limiting to prevent abuse
- **Helmet.js** - Security headers middleware
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Prevention** - MongoDB parameterized queries
- **XSS Protection** - Content Security Policy headers
- **HTTPS Only** - Secure connections in production
- **Environment Variables** - Sensitive data in env files

### Reporting Security Issues

If you discover a security vulnerability, please email:
📧 **lahorivenkatesh709@gmail.com**

Please do NOT create public GitHub issues for security vulnerabilities.

### Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets (min 32 characters)
- Rotate API keys regularly
- Keep dependencies updated
- Use HTTPS in production
- Implement proper CORS policies
- Validate all user inputs
- Sanitize data before database operations

## 📄 License

This project is licensed under the **MIT License with Additional Terms**.

### MIT License

```
MIT License

Copyright (c) 2024 Lahori Venkatesh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Additional Terms

1. **Attribution Required** - Any derivative work must credit the original author
2. **Commercial Use** - Commercial use requires explicit permission from the author
3. **Trademark** - The "MockInterview" name and branding are protected
4. **Data Privacy** - Any deployment must comply with applicable data protection laws (GDPR, etc.)
5. **No Warranty** - Software provided "as is" without warranty of any kind

### Third-Party Licenses

This project uses open-source packages with their own licenses:
- React.js - MIT License
- Express.js - MIT License
- MongoDB/Mongoose - Apache License 2.0
- Material-UI - MIT License
- Socket.io - MIT License
- And others (see package.json files)

## 👨‍💻 Author

**Lahori Venkatesh**
- 📧 Email: [lahorivenkatesh709@gmail.com](mailto:lahorivenkatesh709@gmail.com)
- 🐙 GitHub: [@lahori-venkatesh](https://github.com/lahori-venkatesh)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/lahori-venkatesh)
- 🌐 Portfolio: [View my work](https://lahorivenkatesh.dev)

### About the Creator

Passionate full-stack developer with expertise in modern web technologies including React, Node.js, MongoDB, and real-time communication systems. Created MockInterview to help developers practice and improve their interview skills through peer-to-peer learning, making interview preparation accessible and effective for everyone.

**Skills & Expertise:**
- Full-stack JavaScript/TypeScript development
- Real-time applications with Socket.io and WebRTC
- RESTful API design and implementation
- Database design and optimization
- Payment gateway integration
- Cloud deployment and DevOps

---

## 🚀 Quick Start Guide

### For New Users

1. **Visit the Platform**
   - Go to [https://mockwithpeers.vercel.app/](https://mockwithpeers.vercel.app/)
   - Click "Get Started" or "Register"

2. **Create Your Account**
   - Provide name, email, and password
   - Verify your email (if enabled)

3. **Complete Your Profile**
   - Add your skills (React, Node.js, Python, etc.)
   - Select your domain (Frontend, Backend, Full Stack, etc.)
   - Choose your experience level
   - Upload a profile picture (optional)

4. **Find Interview Partners**
   - Browse available users in "Find Match"
   - Filter by domain and experience
   - Send interview invitations

5. **Start Practicing**
   - Accept invitations from others
   - Conduct mock interviews with video
   - Provide and receive feedback

6. **Upgrade to Premium** (Optional)
   - Unlimited interviews
   - Advanced features
   - Priority support

### For Developers

```bash
# Clone and setup
git clone https://github.com/lahori-venkatesh/mockinterview.git
cd mockinterview
npm run install-all

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Run development servers
npm run dev

# Access applications
# Frontend: http://localhost:3000
# Admin Panel: http://localhost:3001
# Backend: http://localhost:10000
```

## 📞 Support & Contact

### Get Help

- 📧 **Email Support**: [lahorivenkatesh709@gmail.com](mailto:lahorivenkatesh709@gmail.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/lahori-venkatesh/mockinterview/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/lahori-venkatesh/mockinterview/discussions)
- 📚 **Documentation**: Check [CONTRIBUTING.md](CONTRIBUTING.md), [DEPLOYMENT.md](DEPLOYMENT.md)
- 💬 **Community**: Join discussions on GitHub

### Frequently Asked Questions

**Q: Is the platform free to use?**
A: Yes! Basic features are free. Premium plans offer unlimited interviews and advanced features.

**Q: How do I become an admin?**
A: Contact the project maintainer or have an existing admin promote you.

**Q: Can I use this for commercial purposes?**
A: Please contact the author for commercial licensing.

**Q: How do I report a bug?**
A: Create an issue on GitHub or email lahorivenkatesh709@gmail.com

**Q: Can I contribute to the project?**
A: Absolutely! Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📊 Project Statistics

- **Version**: 1.0.0
- **Release Date**: October 2024
- **Tech Stack**: MERN (MongoDB, Express, React, Node.js)
- **License**: MIT with Additional Terms
- **Status**: Active Development

## 🗺 Roadmap

### Version 1.1 (Planned)
- [ ] Video call recording and playback
- [ ] AI-powered interview feedback
- [ ] Advanced search and filtering
- [ ] Interview scheduling system
- [ ] Email notifications
- [ ] Mobile responsive improvements

### Version 1.2 (Future)
- [ ] Mobile application (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with job portals
- [ ] Certification system
- [ ] Group interview sessions

### Version 2.0 (Vision)
- [ ] AI interview bot
- [ ] Company-specific interview prep
- [ ] Live coding challenges
- [ ] Marketplace for interview coaches
- [ ] Enterprise features

## 📚 Additional Resources

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production setup guide
- **[LICENSE](LICENSE)** - License information

## 🙏 Acknowledgments

Special thanks to:
- Open-source community for amazing tools and libraries
- MongoDB Atlas for database hosting
- Vercel for frontend hosting
- Render for backend hosting
- Razorpay for payment gateway
- All contributors and users of the platform

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by [Lahori Venkatesh](https://github.com/lahori-venkatesh)**

**MockInterview** - Empowering developers through peer-to-peer interview practice

[Live Demo](https://mockwithpeers.vercel.app/) • [Report Bug](https://github.com/lahori-venkatesh/mockinterview/issues) • [Request Feature](https://github.com/lahori-venkatesh/mockinterview/issues)

---

© 2024 Lahori Venkatesh. All rights reserved.
</div>
