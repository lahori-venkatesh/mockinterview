const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testUsers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    domain: 'Frontend',
    experience: '3-5 years',
    gender: 'Female',
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
    bio: 'Frontend developer passionate about creating beautiful user interfaces',
    isOnline: true,
    rating: 4.2,
    totalInterviews: 15
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    domain: 'Backend',
    experience: '5+ years',
    gender: 'Male',
    skills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Docker'],
    bio: 'Backend engineer with expertise in scalable systems',
    isOnline: true,
    rating: 4.5,
    totalInterviews: 22
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    password: 'password123',
    domain: 'Full Stack',
    experience: '1-3 years',
    gender: 'Female',
    skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express'],
    bio: 'Full stack developer eager to learn and grow',
    isOnline: false,
    rating: 3.8,
    totalInterviews: 8
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    password: 'password123',
    domain: 'Data Science',
    experience: '3-5 years',
    gender: 'Male',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL'],
    bio: 'Data scientist working on ML models and analytics',
    isOnline: true,
    rating: 4.1,
    totalInterviews: 12
  },
  {
    name: 'Lisa Wang',
    email: 'lisa.wang@example.com',
    password: 'password123',
    domain: 'Mobile',
    experience: '1-3 years',
    gender: 'Female',
    skills: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'iOS'],
    bio: 'Mobile developer creating cross-platform applications',
    isOnline: true,
    rating: 3.9,
    totalInterviews: 10
  },
  {
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    password: 'password123',
    domain: 'DevOps',
    experience: '5+ years',
    gender: 'Other',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    bio: 'DevOps engineer focused on automation and infrastructure',
    isOnline: false,
    rating: 4.3,
    totalInterviews: 18
  },
  {
    name: 'Jessica Brown',
    email: 'jessica.brown@example.com',
    password: 'password123',
    domain: 'UI/UX',
    experience: '3-5 years',
    gender: 'Female',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    bio: 'UI/UX designer passionate about user-centered design',
    isOnline: true,
    rating: 4.4,
    totalInterviews: 14
  },
  {
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    password: 'password123',
    domain: 'Full Stack',
    experience: '0-1 years',
    gender: 'Male',
    skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'],
    bio: 'Junior developer looking to improve interview skills',
    isOnline: true,
    rating: 3.5,
    totalInterviews: 5
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    password: 'password123',
    domain: 'Frontend',
    experience: '1-3 years',
    gender: 'Female',
    skills: ['Vue.js', 'JavaScript', 'SASS', 'Webpack', 'Git'],
    bio: 'Frontend developer specializing in Vue.js applications',
    isOnline: false,
    rating: 3.7,
    totalInterviews: 7
  },
  {
    name: 'James Lee',
    email: 'james.lee@example.com',
    password: 'password123',
    domain: 'Backend',
    experience: '3-5 years',
    gender: 'Male',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Microservices'],
    bio: 'Backend developer with Java and Spring expertise',
    isOnline: true,
    rating: 4.0,
    totalInterviews: 16
  }
];

async function addTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test users already exist
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Added user: ${userData.name} (${userData.email})`);
      } else {
        console.log(`⚠️  User already exists: ${userData.name} (${userData.email})`);
      }
    }

    console.log('\n📊 Database Summary:');
    const totalUsers = await User.countDocuments();
    const domains = await User.distinct('domain');
    const genders = await User.distinct('gender');
    
    console.log(`Total users: ${totalUsers}`);
    console.log(`Domains: ${domains.join(', ')}`);
    console.log(`Genders: ${genders.join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error('Error adding test users:', error);
    process.exit(1);
  }
}

addTestUsers();