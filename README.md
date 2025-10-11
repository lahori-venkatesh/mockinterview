# 🎯 MockInterview - Peer-to-Peer Interview Platform

A comprehensive platform for conducting mock interviews between peers, featuring real-time video calls, AI-powered question generation, and detailed performance analytics.

## 🌐 Live Applications

- **🚀 Main Platform**: [https://mockwithpeers.vercel.app/](https://mockwithpeers.vercel.app/)
- **🔐 Admin Panel**: [https://mockadmin.vercel.app/](https://mockadmin.vercel.app/)
- **🔧 Backend API**: [https://mockinterview-bdve.onrender.com](https://mockinterview-bdve.onrender.com)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Admin Panel](#-admin-panel)
- [Premium Features](#-premium-features)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

## ✨ Features

### 🎥 Core Interview Features
- **Real-time Video Interviews** - WebRTC-powered video calls
- **Peer Matching System** - Smart algorithm to match interviewers and interviewees
- **Domain-specific Questions** - Curated questions for different tech domains
- **Live Code Sharing** - Real-time collaborative coding environment
- **Interview Recording** - Save and review interview sessions
- **Performance Analytics** - Detailed feedback and scoring system

### 👤 User Management
- **User Authentication** - Secure JWT-based authentication
- **Profile Management** - Comprehensive user profiles with skills and experience
- **Role-based Access** - Different access levels for users and admins
- **Premium Subscriptions** - Razorpay integrated payment system

### 🔧 Admin Features
- **User Management** - View, manage, and moderate users
- **Question Bank Management** - Add, edit, and categorize interview questions
- **Analytics Dashboard** - Platform usage statistics and insights
- **Admin Management** - Create and manage admin accounts
- **Payment Tracking** - Monitor premium subscriptions and payments

### 💳 Payment & Premium
- **Flexible Pricing** - Monthly (₹299) and Yearly (₹1999) plans
- **Razorpay Integration** - Secure payment processing
- **Premium Features** - Unlimited interviews, priority matching, advanced analytics
- **Payment History** - Complete transaction records

## 🛠 Tech Stack

### Frontend
- **React.js** - Modern UI library
- **Material-UI (MUI)** - Component library for consistent design
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Razorpay** - Payment gateway integration

### Infrastructure
- **Frontend Hosting** - Vercel
- **Admin Panel Hosting** - Vercel
- **Backend Hosting** - Render
- **Database** - MongoDB Atlas
- **File Storage** - Local storage with multer

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Admin Panel   │    │   Backend API   │
│   (Vercel)      │    │   (Vercel)      │    │   (Render)      │
│                 │    │                 │    │                 │
│ • React App     │◄──►│ • Admin React   │◄──►│ • Express.js    │
│ • User Interface│    │ • Management UI │    │ • REST APIs     │
│ • Video Calls   │    │ • Analytics     │    │ • Socket.io     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB       │
                    │   (Atlas)       │
                    │                 │
                    │ • User Data     │
                    │ • Questions     │
                    │ • Interviews    │
                    │ • Payments      │
                    └─────────────────┘
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Razorpay account (for payments)

### Clone Repository
```bash
git clone https://github.com/lahori-venkatesh/mockinterview.git
cd mockinterview
```

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure environment variables in .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.development.example .env.development
# Configure environment variables
npm start
```

### Admin Panel Setup
```bash
cd admin-panel
npm install
cp .env.development.example .env.development
# Configure environment variables
npm start
```

## 🔧 Environment Setup

### Backend Environment Variables (.env)
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-interview

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables (.env.development)
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Admin Panel Environment Variables (.env.development)
```env
REACT_APP_API_URL=http://localhost:5001
```

## 📖 Usage

### For Users
1. **Register/Login** - Create account or sign in
2. **Complete Profile** - Add skills, domain, and experience
3. **Find Match** - Get matched with interview partners
4. **Conduct Interview** - Join video call and practice
5. **Review Performance** - Check feedback and analytics
6. **Upgrade to Premium** - Access advanced features

### For Admins
1. **Admin Login** - Access admin panel
2. **Manage Users** - View and moderate user accounts
3. **Manage Questions** - Add/edit interview questions
4. **View Analytics** - Monitor platform statistics
5. **Handle Reports** - Moderate reported users

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
POST /api/auth/forgot-password - Password reset
```

### User Endpoints
```
GET  /api/users/profile     - Get user profile
PUT  /api/users/profile     - Update user profile
GET  /api/users/search      - Search users
```

### Interview Endpoints
```
POST /api/interviews/create - Create interview session
GET  /api/interviews/history - Get interview history
PUT  /api/interviews/feedback - Submit feedback
```

### Payment Endpoints
```
GET  /api/payment/plans     - Get pricing plans
POST /api/payment/create-order - Create payment order
POST /api/payment/verify-payment - Verify payment
```

### Admin Endpoints
```
GET  /api/admin/users       - Get all users
GET  /api/admin/analytics   - Get platform analytics
POST /api/admin/questions   - Add new question
PUT  /api/admin/promote-user - Promote user to admin
```

## 🔐 Admin Panel

The admin panel provides comprehensive management capabilities:

### Features
- **Dashboard Analytics** - User statistics, interview metrics
- **User Management** - View, search, delete users
- **Question Management** - CRUD operations for interview questions
- **Admin Management** - Create, promote, demote admins
- **Payment Tracking** - Monitor premium subscriptions
- **Reported Users** - Handle user reports and moderation

### Access
- **URL**: [https://mockadmin.vercel.app/](https://mockadmin.vercel.app/)
- **Login**: Admin credentials required
- **Security**: Role-based access control

## 💎 Premium Features

### Monthly Plan - ₹299/month
- Unlimited mock interviews
- Priority matching
- Advanced analytics
- Premium support

### Yearly Plan - ₹1999/year
- All monthly features
- Save ₹1589 annually
- Extended premium support
- Early access to new features

### Payment Integration
- **Razorpay** secure payment processing
- **Instant activation** after successful payment
- **Payment history** tracking
- **Automatic renewal** options

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🔧 Performance optimizations
- 🧪 Test coverage improvements

### Contributors

We appreciate all contributors who help make this project better:

- **[Lahori Venkatesh](mailto:lahorivenkatesh709@gmail.com)** - Project Creator & Lead Developer

*More contributors will be added as the project grows. Join us in building the future of interview preparation!*

## 📄 License

This project is licensed under the **MIT License with Additional Terms**.

### MIT License Terms
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
4. **Data Privacy** - Any deployment must comply with applicable data protection laws

## 👨‍💻 Author

**Lahori Venkatesh**
- 📧 Email: [lahorivenkatesh709@gmail.com](mailto:lahorivenkatesh709@gmail.com)
- 🐙 GitHub: [@lahori-venkatesh](https://github.com/lahori-venkatesh)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/lahori-venkatesh)
- 🌐 Portfolio: [View my work](https://lahorivenkatesh.dev)

### About the Creator
Passionate full-stack developer with expertise in modern web technologies. Created MockInterview to help developers practice and improve their interview skills through peer-to-peer learning.

---

## 🚀 Quick Start

1. **Visit the platform**: [https://mockwithpeers.vercel.app/](https://mockwithpeers.vercel.app/)
2. **Create an account** and complete your profile
3. **Find a match** and start practicing interviews
4. **Upgrade to premium** for unlimited access
5. **Join our community** and help others improve

## 📞 Support

Need help? We're here for you:

- 📧 **Email Support**: [lahorivenkatesh709@gmail.com](mailto:lahorivenkatesh709@gmail.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/lahori-venkatesh/mockinterview/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/lahori-venkatesh/mockinterview/discussions)
- 📚 **Documentation**: [Project Wiki](https://github.com/lahori-venkatesh/mockinterview/wiki)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Lahori Venkatesh](https://github.com/lahori-venkatesh)

</div>