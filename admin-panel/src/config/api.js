const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Debug logging
console.log('Admin Panel API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL: API_BASE_URL
});

export default API_BASE_URL;