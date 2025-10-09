const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

const dummyUsers = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    password: 'password123',
    domain: 'Full Stack',
    experience: 'Fresher',
    skills: ['Java', 'Node.js', 'React'],
    gender: 'Male',
    bio: 'Passionate full-stack developer eager to learn and grow. Love working with Java backend and React frontend.',
    isOnline: true,
    rating: 4.2,
    totalInterviews: 5
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    password: 'password123',
    domain: 'Frontend',
    experience: '1-3 years',
    skills: ['JavaScript', 'React', 'TypeScript', 'HTML/CSS'],
    gender: 'Female',
    bio: 'Frontend developer with a passion for creating beautiful and functional user interfaces.',
    isOnline: true,
    rating: 4.5,
    totalInterviews: 12
  },
  {
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@example.com',
    password: 'password123',
    domain: 'Backend',
    experience: '3-5 years',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
    gender: 'Male',
    bio: 'Backend engineer specializing in Java ecosystem and microservices architecture.',
    isOnline: true,
    rating: 4.7,
    totalInterviews: 18
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    password: 'password123',
    domain: 'Full Stack',
    experience: 'Fresher',
    skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
    gender: 'Female',
    bio: 'Recent graduate excited about full-stack development. Currently learning MERN stack.',
    isOnline: true,
    rating: 3.8,
    totalInterviews: 3
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    password: 'password123',
    domain: 'Full Stack',
    experience: '1-3 years',
    skills: ['Java', 'React', 'Node.js', 'SQL'],
    gender: 'Male',
    bio: 'Full-stack developer with experience in both frontend and backend technologies.',
    isOnline: true,
    rating: 4.3,
    totalInterviews: 8
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa.thompson@example.com',
    password: 'password123',
    domain: 'Data Science',
    experience: '1-3 years',
    skills: ['Python', 'SQL', 'MongoDB', 'Machine Learning'],
    gender: 'Female',
    bio: 'Data scientist passionate about extracting insights from data and building ML models.',
    isOnline: false,
    rating: 4.6,
    totalInterviews: 15
  },
  {
    name: 'James Park',
    email: 'james.park@example.com',
    password: 'password123',
    domain: 'Mobile',
    experience: 'Fresher',
    skills: ['Java', 'React Native', 'JavaScript'],
    gender: 'Male',
    bio: 'Mobile app developer focusing on cross-platform development with React Native.',
    isOnline: true,
    rating: 4.0,
    totalInterviews: 4
  },
  {
    name: 'Rachel Green',
    email: 'rachel.green@example.com',
    password: 'password123',
    domain: 'UI/UX',
    experience: '0-1 years',
    skills: ['JavaScript', 'React', 'HTML/CSS', 'Design'],
    gender: 'Female',
    bio: 'UI/UX designer with frontend development skills. Love creating user-centered designs.',
    isOnline: true,
    rating: 4.4,
    totalInterviews: 7
  }
];

async function addDummyData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash passwords and create users
    for (const userData of dummyUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      userData.password = hashedPassword;

      // Create user
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.name} (${userData.email})`);
    }

    console.log('\nDummy data added successfully!');
    console.log('\nYou can now login with any of these accounts:');
    console.log('Email: alex.johnson@example.com, Password: password123');
    console.log('Email: sarah.chen@example.com, Password: password123');
    console.log('Email: mike.rodriguez@example.com, Password: password123');
    console.log('And so on...');

  } catch (error) {
    console.error('Error adding dummy data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addDummyData();