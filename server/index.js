const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Optional production dependencies with fallbacks
let helmet, compression, rateLimit;
try {
  helmet = require('helmet');
  compression = require('compression');
  rateLimit = require('express-rate-limit');
  console.log('✅ Production security modules loaded');
} catch (error) {
  console.log('⚠️  Production security modules not available:', error.message);
  console.log('🔄 Running in basic mode without helmet, compression, and rate limiting');
}

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const interviewRoutes = require('./routes/interviews');
const questionRoutes = require('./routes/questions');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      console.log('🔌 Socket.IO CORS request from origin:', origin);
      
      // Allow requests with no origin
      if (!origin) {
        console.log('✅ Socket.IO allowing request with no origin');
        return callback(null, true);
      }
      
      // Define allowed origins (same as main CORS)
      const allowedOrigins = [
        'https://mockinterview-bdve.onrender.com',
        process.env.CORS_ORIGIN
      ].filter(Boolean);
      
      // Add development origins
      if (process.env.NODE_ENV !== 'production') {
        allowedOrigins.push(
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:3001'
        );
      }
      
      if (allowedOrigins.includes(origin)) {
        console.log('✅ Socket.IO origin allowed:', origin);
        callback(null, true);
      } else {
        console.log('❌ Socket.IO CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security and Performance Middleware (optional)
if (helmet) {
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to allow WebRTC
    crossOriginEmbedderPolicy: false
  }));
  console.log('🛡️  Helmet security headers enabled');
}

if (compression) {
  app.use(compression());
  console.log('🗜️  Gzip compression enabled');
}

// Rate limiting (optional)
if (rateLimit) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
  console.log('🚦 Rate limiting enabled');
}

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS request from origin:', origin);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Define allowed origins
    const allowedOrigins = [
      'https://mockinterview-bdve.onrender.com',
      process.env.CORS_ORIGIN
    ].filter(Boolean); // Remove undefined values
    
    // Add development origins
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001'
      );
    }
    
    console.log('🔍 Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('💡 Add this origin to CORS_ORIGIN environment variable if needed');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for profile pictures
app.use('/uploads', express.static('uploads'));

// API routes are handled above, no need to serve static files
// Frontend is deployed separately on Vercel

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Socket.io connection handling
const connectedUsers = new Map(); // userId -> socketId mapping
const pendingInvitations = new Map(); // Store pending interview invitations

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins their personal room for notifications
  socket.on('user-online', (userData) => {
    if (userData && userData._id) {
      connectedUsers.set(userData._id, socket.id);
      socket.join(userData._id); // Join personal room with userId
      console.log(`✅ User ${userData.name} (${userData._id}) is online with socket ${socket.id}`);
      console.log(`📊 Total connected users: ${connectedUsers.size}`);
    } else {
      console.log('❌ Invalid user data received for user-online event:', userData);
    }
  });

  // Handle interview invitation
  socket.on('send-interview-invitation', (invitationData) => {
    const { inviteeId, inviterName, roomId, domain, questions } = invitationData;
    
    // Find the invitee's socket
    const inviteeSocketId = connectedUsers.get(inviteeId);
    
    if (inviteeSocketId) {
      // Store the invitation
      pendingInvitations.set(roomId, {
        inviterId: socket.id,
        inviteeId: inviteeSocketId,
        roomId,
        inviterName,
        domain,
        questions,
        timestamp: new Date()
      });
      
      // Send invitation to the invitee
      io.to(inviteeSocketId).emit('interview-invitation-received', {
        roomId,
        inviterName,
        domain,
        questions: questions.length,
        timestamp: new Date()
      });
      
      console.log(`Interview invitation sent from ${inviterName} to user ${inviteeId}`);
    } else {
      // User is offline
      socket.emit('invitation-failed', { 
        message: 'User is currently offline. Please try again later.' 
      });
    }
  });

  // Handle invitation response
  socket.on('respond-to-invitation', (responseData) => {
    const { roomId, accepted } = responseData;
    const invitation = pendingInvitations.get(roomId);
    
    if (invitation) {
      if (accepted) {
        // Notify the inviter that invitation was accepted
        io.to(invitation.inviterId).emit('invitation-accepted', { roomId });
        
        // Both users can now join the interview room
        socket.join(roomId);
        io.sockets.sockets.get(invitation.inviterId)?.join(roomId);
        
        console.log(`Interview invitation accepted for room ${roomId}`);
      } else {
        // Notify the inviter that invitation was rejected
        io.to(invitation.inviterId).emit('invitation-rejected', { roomId });
        console.log(`Interview invitation rejected for room ${roomId}`);
      }
      
      // Remove the pending invitation
      pendingInvitations.delete(roomId);
    }
  });

  // Join interview room
  socket.on('join-interview', ({ roomId, userId, role }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { userId, role });
    console.log(`User ${userId} joined interview room ${roomId} as ${role}`);
  });

  // WebRTC signaling
  socket.on('offer', ({ roomId, offer }) => {
    console.log('Relaying offer for room:', roomId);
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log('Relaying answer for room:', roomId);
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    console.log('Relaying ICE candidate for room:', roomId);
    socket.to(roomId).emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`👋 User ${userId} went offline`);
        console.log(`📊 Remaining connected users: ${connectedUsers.size}`);
        break;
      }
    }
  });
});

// Make io and connectedUsers available to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// MongoDB connection - Force student-interview database
let mongoUri = process.env.MONGODB_URI;

// Ensure we're connecting to student-interview database
if (mongoUri && !mongoUri.includes('/student-interview')) {
  // Replace any existing database name with student-interview
  mongoUri = mongoUri.replace(/\/[^?]*\?/, '/student-interview?');
  console.log('🔧 Forcing connection to student-interview database');
}

mongoose.connect(mongoUri)
  .then(async () => {
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ MongoDB connected to:', dbName);
    
    // Verify we're in the correct database
    if (dbName !== 'student-interview') {
      console.log('⚠️  WARNING: Connected to', dbName, 'but expected student-interview');
    }
    
    // Log collection counts for verification
    try {
      const User = require('./models/User');
      const Question = require('./models/Question');
      const Interview = require('./models/Interview');
      
      const userCount = await User.countDocuments();
      const questionCount = await Question.countDocuments();
      const interviewCount = await Interview.countDocuments();
      
      console.log('📊 Database contents:');
      console.log(`   Users: ${userCount}`);
      console.log(`   Questions: ${questionCount}`);
      console.log(`   Interviews: ${interviewCount}`);
    } catch (error) {
      console.log('📊 Could not verify database contents:', error.message);
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Add a basic health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Debug endpoint to check connected users
app.get('/api/debug/connected-users', (req, res) => {
  const connectedUsersList = Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
    userId,
    socketId
  }));
  
  res.json({
    totalConnected: connectedUsers.size,
    users: connectedUsersList,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
  console.log(`🔒 NODE_ENV: ${process.env.NODE_ENV}`);
});