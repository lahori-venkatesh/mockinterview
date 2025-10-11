import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Paper,
  LinearProgress,
  IconButton,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  Upgrade as UpgradeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    rating: 0,
    onlineUsers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/dashboard-stats`);
      setStats({
        totalInterviews: user?.totalInterviews || 0,
        rating: user?.rating || 0,
        onlineUsers: response.data.onlineUsers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to user data
      setStats({
        totalInterviews: user?.totalInterviews || 0,
        rating: user?.rating || 0,
        onlineUsers: 0
      });
    }
  };

  const getProgressColor = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Ready to ace your next interview? Let's get started!
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Enhanced Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -50, 
                right: -50, 
                width: 100, 
                height: 100, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: '50%' 
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    src={user?.profilePicture ? `${API_BASE_URL}${user.profilePicture}` : ''}
                    sx={{ 
                      width: 70, 
                      height: 70, 
                      mr: 2, 
                      border: '3px solid rgba(255,255,255,0.3)',
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }}
                  >
                    {!user?.profilePicture && user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {user?.name}
                    </Typography>
                    <Typography sx={{ opacity: 0.9 }}>
                      {user?.domain} Developer
                    </Typography>
                    {user?.isPremium && (
                      <Chip 
                        label="Premium" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'gold', 
                          color: 'black',
                          fontWeight: 'bold',
                          mt: 0.5
                        }} 
                      />
                    )}
                  </Box>
                </Box>
                
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Experience Level:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {user?.experience}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Top Skills:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {user?.skills?.slice(0, 3).map((skill) => (
                      <Chip 
                        key={skill} 
                        label={skill} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }} 
                      />
                    ))}
                    {user?.skills?.length > 3 && (
                      <Chip 
                        label={`+${user.skills.length - 3} more`} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          color: 'white' 
                        }} 
                      />
                    )}
                  </Box>
                </Box>

                {user?.bio && (
                  <Box mt={2}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      About:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      opacity: 0.8,
                      fontStyle: 'italic',
                      lineHeight: 1.4
                    }}>
                      {user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Enhanced Stats Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <CardContent>
                    <TrophyIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats.totalInterviews}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Interviews
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <CardContent>
                    <StarIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats.rating ? stats.rating.toFixed(1) : '0.0'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Average Rating
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.rating / 5) * 100} 
                      sx={{ 
                        mt: 1, 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'rgba(255,255,255,0.8)'
                        }
                      }} 
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <CardContent>
                    <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats.onlineUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Online Users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Enhanced Quick Actions */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                  🚀 Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<PlayIcon />}
                      onClick={() => navigate('/find-match')}
                      sx={{ 
                        py: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Start Interview
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<HistoryIcon />}
                      onClick={() => navigate('/history')}
                      sx={{ 
                        py: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      View History
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<PersonIcon />}
                      onClick={() => navigate('/profile')}
                      sx={{ 
                        py: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {!user?.isPremium ? (
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<UpgradeIcon />}
                        sx={{ 
                          py: 2,
                          background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Upgrade Premium
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<TrendingUpIcon />}
                        sx={{ 
                          py: 2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          borderColor: 'gold',
                          color: 'gold'
                        }}
                      >
                        Premium Active
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Enhanced Recent Activity */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                  📊 Recent Activity
                </Typography>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  border: '2px dashed #e2e8f0'
                }}>
                  <TrophyIcon sx={{ fontSize: 60, color: '#cbd5e0', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                    No interviews yet
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 3 }}>
                    Start your first interview to see your progress and activity here!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={() => navigate('/find-match')}
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Start Your First Interview
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;