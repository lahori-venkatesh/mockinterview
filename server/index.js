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

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for profile pictures
app.use('/uploads', express.static('uploads'));

// Serve static files from React app (if deploying together)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);

// Socket.io connection handling
const activeUsers = new Map();
const interviewRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-online', (userData) => {
    activeUsers.set(socket.id, userData);
    socket.broadcast.emit('user-joined', userData);
  });

  socket.on('join-interview', (interviewData) => {
    const { roomId, userId, userType } = interviewData;
    socket.join(roomId);
    
    if (!interviewRooms.has(roomId)) {
      interviewRooms.set(roomId, { participants: [], questions: [], currentQuestion: 0 });
    }
    
    const room = interviewRooms.get(roomId);
    room.participants.push({ socketId: socket.id, userId, userType });
    
    socket.to(roomId).emit('participant-joined', { userId, userType });
  });

  socket.on('interview-question', (data) => {
    const { roomId, question, askedBy } = data;
    socket.to(roomId).emit('new-question', { question, askedBy });
  });

  socket.on('interview-answer', (data) => {
    const { roomId, answer, answeredBy } = data;
    socket.to(roomId).emit('new-answer', { answer, answeredBy });
  });

  socket.on('video-offer', (data) => {
    socket.to(data.roomId).emit('video-offer', data);
  });

  socket.on('video-answer', (data) => {
    socket.to(data.roomId).emit('video-answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  socket.on('feedback', (data) => {
    const { roomId, feedback, fromUser, toUser } = data;
    socket.to(roomId).emit('feedback-received', { feedback, fromUser, toUser });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    activeUsers.delete(socket.id);
    
    // Clean up interview rooms
    for (const [roomId, room] of interviewRooms.entries()) {
      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      if (room.participants.length === 0) {
        interviewRooms.delete(roomId);
      }
    }
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Add a basic health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});