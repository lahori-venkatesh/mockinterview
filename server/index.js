const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

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
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // If CORS_ORIGIN is set to *, allow all origins
      if (process.env.CORS_ORIGIN === '*') {
        return callback(null, true);
      }
      
      // Otherwise, check against allowed origins
      const allowedOrigins = [
        "http://localhost:3000",
        "https://mockinterview-bdve.onrender.com",
        process.env.CORS_ORIGIN || "https://your-frontend.vercel.app"
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // If CORS_ORIGIN is set to *, allow all origins
    if (process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    
    // Otherwise, check against allowed origins
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://127.0.0.1:3000',
      'https://mockinterview-bdve.onrender.com',
      process.env.CORS_ORIGIN || 'https://your-frontend.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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
    connectedUsers.set(userData._id, socket.id);
    socket.join(userData._id); // Join personal room with userId
    console.log(`User ${userData._id} is online with socket ${socket.id}`);
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
    console.log('User disconnected:', socket.id);
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} went offline`);
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

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});