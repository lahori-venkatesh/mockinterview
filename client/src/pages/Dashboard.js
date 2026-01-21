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
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Stack
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  Upgrade as UpgradeIcon,
  Mail as InvitationsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    rating: 0,
    onlineUsers: 0
  });
  const [invitations, setInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [trendData, setTrendData] = useState([
    { name: 'Mon', interviews: 0, score: 0 },
    { name: 'Tue', interviews: 0, score: 0 },
    { name: 'Wed', interviews: 0, score: 0 },
    { name: 'Thu', interviews: 0, score: 0 },
    { name: 'Fri', interviews: 0, score: 0 },
    { name: 'Sat', interviews: 0, score: 0 },
    { name: 'Sun', interviews: 0, score: 0 }
  ]);

  useEffect(() => {
    fetchStats();
    fetchPendingInvitations();
    fetchSentInvitations();
  }, []);

  useEffect(() => {
    // When navigated with focus=sent-invitations, scroll to the sent section
    const params = new URLSearchParams(location.search);
    const focus = params.get('focus');
    if (focus === 'sent-invitations') {
      const el = document.getElementById('sent-invitations-section');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [location.search]);

  // Hydrate sent invitations immediately if navigation state or sessionStorage has the recent one
  useEffect(() => {
    const navState = location.state || {};
    const recentFromState = navState.recentlySentInvitation;
    let recent = recentFromState;
    if (!recent) {
      try {
        const s = window.sessionStorage.getItem('recentSentInvitation');
        if (s) recent = JSON.parse(s);
      } catch (_) { }
    }
    if (recent && !sentInvitations.find((i) => (i.id || i._id) === (recent.id || recent._id))) {
      setSentInvitations((prev) => [recent, ...prev]);
    }
  }, [location.state, sentInvitations]);

  useEffect(() => {
    if (!socket) return;

    const handleInvitation = (invitation) => {
      setInvitations((prev) => {
        const exists = prev.some((i) => i.id === invitation.id);
        return exists ? prev : [invitation, ...prev];
      });
    };

    const handleInvitationAccepted = (data) => {
      console.log('Invitation accepted on dashboard:', data);
      toast.success(data.message || 'Interview invitation accepted!');

      // Navigate to interview room
      if (data.roomId) {
        navigate(`/interview/${data.roomId}`);
      } else {
        console.error('No roomId provided in invitation-accepted event');
      }
    };

    const handleInvitationRejected = (data) => {
      console.log('Invitation rejected on dashboard:', data);
      toast.info(data.message || 'Interview invitation was declined');
    };

    socket.on('interview-invitation', handleInvitation);
    socket.on('invitation-accepted', handleInvitationAccepted);
    socket.on('invitation-rejected', handleInvitationRejected);

    return () => {
      socket.off('interview-invitation', handleInvitation);
      socket.off('invitation-accepted', handleInvitationAccepted);
      socket.off('invitation-rejected', handleInvitationRejected);
    };
  }, [socket, navigate]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/dashboard-stats`);
      setStats({
        totalInterviews: user?.totalInterviews || 0,
        rating: user?.rating || 0,
        onlineUsers: response.data.onlineUsers || 0
      });
      if (response.data.trends) {
        setTrendData(response.data.trends);
      }
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

  const fetchPendingInvitations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/interviews/pending-invitations`);
      setInvitations(response.data.invitations || []);
    } catch (error) {
      setInvitations([]);
    }
  };

  const fetchSentInvitations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/interviews/sent-invitations`);
      setSentInvitations(response.data.invitations || []);
    } catch (error) {
      setSentInvitations([]);
    }
  };

  const handleRespondInvitation = async (invitationId, responseAction) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/interviews/respond-invitation/${invitationId}`,
        { response: responseAction }
      );
      if (responseAction === 'accept') {
        const roomId = res?.data?.roomId;
        if (roomId) navigate(`/interview/${roomId}`);
      }
    } catch (e) {
      // ignore for now
    } finally {
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
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
        {/* Enhanced Hero Section with Glassmorphism */}
        <Box
          sx={{
            mb: 4,
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 4,
            color: 'white',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
          }}
        >
          {/* Animated Background Circles */}
          <Box sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            bgcolor: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Welcome back, {user?.name}! 👋
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.95,
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Ready to ace your next interview? Let's get started!
            </Typography>
          </Box>

          {/* Add keyframe animation */}
          <style>
            {`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
            `}
          </style>
        </Box>

        <Grid container spacing={3}>
          {/* Enhanced Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
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
                    {user?.domain && (
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {user.domain}
                      </Typography>
                    )}
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
                    Experience Level
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {user?.experience}
                  </Typography>
                </Box>

                {user?.bio && (
                  <Box mb={2}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Bio
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.5 }}>
                      {user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Skills
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
              </CardContent>
            </Card>
          </Grid>

          {/* Enhanced Stats Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)'
                  }
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)'
                  }
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)'
                  }
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

          {/* Weekly Performance Trend */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Weekly Performance
                </Typography>
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#764ba2" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#764ba2" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#48dbfb" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#48dbfb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="score" stroke="#764ba2" fillOpacity={1} fill="url(#colorScore)" />
                      <Area type="monotone" dataKey="interviews" stroke="#48dbfb" fillOpacity={1} fill="url(#colorInterviews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Interview Invitations */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Interview Invitations
                  </Typography>
                  <Button size="small" onClick={fetchPendingInvitations}>Refresh</Button>
                </Box>
                {invitations.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No pending invitations
                  </Box>
                ) : (
                  <List>
                    {invitations.map((inv) => (
                      <ListItem key={inv.id} divider>
                        <ListItemAvatar>
                          <Avatar src={inv.interviewer?.profilePicture ? `${API_BASE_URL}${inv.interviewer.profilePicture}` : ''}>
                            {inv.interviewer?.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={inv.interviewer?.name || 'Interviewer'}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip size="small" label={inv.domain || 'General'} />
                              {inv.selectedQuestions?.length ? (
                                <Chip size="small" variant="outlined" label={`${inv.selectedQuestions.length} questions`} />
                              ) : null}
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" color="error" onClick={() => handleRespondInvitation(inv.id, 'reject')}>
                              Decline
                            </Button>
                            <Button size="small" variant="contained" onClick={() => handleRespondInvitation(inv.id, 'accept')}>
                              Accept
                            </Button>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sent Invitations */}
          <Grid item xs={12} id="sent-invitations-section">
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Sent Invitations
                  </Typography>
                  <Button size="small" onClick={fetchSentInvitations}>Refresh</Button>
                </Box>
                {sentInvitations.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No sent invitations yet
                  </Box>
                ) : (
                  <List>
                    {sentInvitations.map((inv) => (
                      <ListItem key={inv.id || inv._id} divider>
                        <ListItemAvatar>
                          <Avatar src={inv.recipient?.profilePicture ? `${API_BASE_URL}${inv.recipient.profilePicture}` : ''}>
                            {inv.recipient?.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={inv.recipient?.name || 'Recipient'}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip size="small" label={inv.domain || inv.recipient?.domain || 'General'} />
                              {inv.selectedQuestions?.length ? (
                                <Chip size="small" variant="outlined" label={`${inv.selectedQuestions.length} questions`} />
                              ) : null}
                              {inv.status && (
                                <Chip size="small" color={inv.status === 'accepted' ? 'success' : inv.status === 'rejected' ? 'error' : 'default'} label={inv.status} />
                              )}
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            {/* Optional: Cancel sent invitation if pending */}
                            {(!inv.status || inv.status === 'pending') && (
                              <Button size="small" variant="outlined" color="error" onClick={async () => {
                                try {
                                  await axios.post(`${API_BASE_URL}/api/interviews/cancel-invitation/${inv.id || inv._id}`);
                                } catch (e) {
                                  // ignore
                                } finally {
                                  setSentInvitations((prev) => prev.filter((i) => (i.id || i._id) !== (inv.id || inv._id)));
                                }
                              }}>
                                Cancel
                              </Button>
                            )}
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
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
                      startIcon={<InvitationsIcon />}
                      onClick={() => navigate('/invitations')}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Invitations
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