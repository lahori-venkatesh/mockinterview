const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

const sampleQuestions = [
  // Frontend Questions
  {
    question: "What is the difference between let, const, and var in JavaScript?",
    domain: "Frontend",
    category: "JavaScript",
    difficulty: "Easy",
    tags: ["JavaScript", "Variables"],
    sampleAnswer: "var is function-scoped, let and const are block-scoped. const cannot be reassigned.",
    isActive: true
  },
  {
    question: "Explain the concept of closures in JavaScript.",
    domain: "Frontend",
    category: "JavaScript",
    difficulty: "Medium",
    tags: ["JavaScript", "Closures"],
    sampleAnswer: "A closure is when a function has access to variables from its outer scope even after the outer function has returned.",
    isActive: true
  },
  {
    question: "What are React Hooks and why are they useful?",
    domain: "Frontend",
    category: "React",
    difficulty: "Medium",
    tags: ["React", "Hooks"],
    sampleAnswer: "Hooks allow you to use state and lifecycle features in functional components.",
    isActive: true
  },
  {
    question: "How do you optimize React application performance?",
    domain: "Frontend",
    category: "React",
    difficulty: "Hard",
    tags: ["React", "Performance"],
    sampleAnswer: "Use React.memo, useMemo, useCallback, code splitting, and avoid unnecessary re-renders.",
    isActive: true
  },
  {
    question: "What is the CSS Box Model?",
    domain: "Frontend",
    category: "CSS",
    difficulty: "Easy",
    tags: ["CSS", "Layout"],
    sampleAnswer: "The box model consists of content, padding, border, and margin.",
    isActive: true
  },

  // Backend Questions
  {
    question: "What is the difference between SQL and NoSQL databases?",
    domain: "Backend",
    category: "Database",
    difficulty: "Easy",
    tags: ["Database", "SQL", "NoSQL"],
    sampleAnswer: "SQL databases are relational with fixed schema, NoSQL are non-relational with flexible schema.",
    isActive: true
  },
  {
    question: "Explain RESTful API design principles.",
    domain: "Backend",
    category: "API Design",
    difficulty: "Medium",
    tags: ["REST", "API"],
    sampleAnswer: "REST uses HTTP methods, stateless communication, resource-based URLs, and standard status codes.",
    isActive: true
  },
  {
    question: "What is middleware in Express.js?",
    domain: "Backend",
    category: "Node.js",
    difficulty: "Medium",
    tags: ["Node.js", "Express"],
    sampleAnswer: "Middleware functions execute during request-response cycle and can modify req/res objects.",
    isActive: true
  },
  {
    question: "How do you handle authentication in a web application?",
    domain: "Backend",
    category: "Security",
    difficulty: "Hard",
    tags: ["Authentication", "Security"],
    sampleAnswer: "Use JWT tokens, sessions, OAuth, implement proper password hashing and validation.",
    isActive: true
  },

  // Full Stack Questions
  {
    question: "How do you handle state management in a large React application?",
    domain: "Full Stack",
    category: "State Management",
    difficulty: "Medium",
    tags: ["React", "Redux", "State"],
    sampleAnswer: "Use Redux, Context API, or state management libraries like Zustand for complex state.",
    isActive: true
  },
  {
    question: "Explain the MERN stack architecture.",
    domain: "Full Stack",
    category: "Architecture",
    difficulty: "Medium",
    tags: ["MERN", "Architecture"],
    sampleAnswer: "MongoDB (database), Express (backend), React (frontend), Node.js (runtime).",
    isActive: true
  },
  {
    question: "How do you implement real-time features in web applications?",
    domain: "Full Stack",
    category: "Real-time",
    difficulty: "Hard",
    tags: ["WebSocket", "Socket.io"],
    sampleAnswer: "Use WebSockets, Socket.io, Server-Sent Events, or WebRTC for real-time communication.",
    isActive: true
  },

  // Data Science Questions
  {
    question: "What is the difference between supervised and unsupervised learning?",
    domain: "Data Science",
    category: "Machine Learning",
    difficulty: "Easy",
    tags: ["ML", "Learning Types"],
    sampleAnswer: "Supervised learning uses labeled data, unsupervised learning finds patterns in unlabeled data.",
    isActive: true
  },
  {
    question: "Explain the bias-variance tradeoff in machine learning.",
    domain: "Data Science",
    category: "Machine Learning",
    difficulty: "Hard",
    tags: ["ML", "Bias", "Variance"],
    sampleAnswer: "Bias is error from oversimplification, variance is error from sensitivity to small fluctuations.",
    isActive: true
  },

  // Mobile Questions
  {
    question: "What is the difference between React Native and Flutter?",
    domain: "Mobile",
    category: "Cross-platform",
    difficulty: "Medium",
    tags: ["React Native", "Flutter"],
    sampleAnswer: "React Native uses JavaScript and native components, Flutter uses Dart and custom widgets.",
    isActive: true
  },
  {
    question: "How do you handle offline functionality in mobile apps?",
    domain: "Mobile",
    category: "Offline",
    difficulty: "Hard",
    tags: ["Offline", "Caching"],
    sampleAnswer: "Use local storage, SQLite, caching strategies, and sync when online.",
    isActive: true
  },

  // DevOps Questions
  {
    question: "What is Docker and how does it work?",
    domain: "DevOps",
    category: "Containerization",
    difficulty: "Medium",
    tags: ["Docker", "Containers"],
    sampleAnswer: "Docker creates lightweight, portable containers that package applications with their dependencies.",
    isActive: true
  },
  {
    question: "Explain CI/CD pipeline and its benefits.",
    domain: "DevOps",
    category: "CI/CD",
    difficulty: "Medium",
    tags: ["CI/CD", "Pipeline"],
    sampleAnswer: "Continuous Integration/Deployment automates testing and deployment for faster, reliable releases.",
    isActive: true
  },

  // UI/UX Questions
  {
    question: "What are the principles of good user interface design?",
    domain: "UI/UX",
    category: "Design Principles",
    difficulty: "Easy",
    tags: ["UI", "Design"],
    sampleAnswer: "Clarity, consistency, feedback, accessibility, and user-centered design.",
    isActive: true
  },
  {
    question: "How do you conduct user research and usability testing?",
    domain: "UI/UX",
    category: "User Research",
    difficulty: "Medium",
    tags: ["UX", "Research"],
    sampleAnswer: "Use surveys, interviews, A/B testing, user personas, and prototype testing.",
    isActive: true
  }
];

const addSampleQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');
    
    // Add sample questions
    const result = await Question.insertMany(sampleQuestions);
    console.log(`✅ Added ${result.length} sample questions`);
    
    // Show summary by domain
    const summary = await Question.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📊 Questions by domain:');
    summary.forEach(item => {
      console.log(`  ${item._id}: ${item.count} questions`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
};

addSampleQuestions();