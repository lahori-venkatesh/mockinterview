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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Alert
} from '@mui/material';
import {
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

const FindMatch = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genderPreference, setGenderPreference] = useState('same');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);

  useEffect(() => {
    // Set user as online first, then fetch matches
    updateOnlineStatus(true).then(() => {
      fetchMatches();
    });
    fetchQuestions();
  }, [genderPreference]);

  useEffect(() => {
    // Set user as online when component mounts
    updateOnlineStatus(true);
    
    // Connect to socket for real-time notifications
    if (socket && user && user._id) {
      socket.emit('user-online', user);
      
      // Listen for invitation responses
      socket.on('invitation-accepted', (data) => {
        console.log('Invitation accepted:', data);
        toast.success(data.message || 'Interview invitation accepted!');
        
        // Navigate to interview room
        if (data.roomId) {
          navigate(`/interview/${data.roomId}`);
        } else {
          console.error('No roomId provided in invitation-accepted event');
        }
      });

      socket.on('invitation-rejected', (data) => {
        console.log('Invitation rejected:', data);
        toast.info(data.message || 'Interview invitation was declined');
      });

      return () => {
        socket.off('invitation-accepted');
        socket.off('invitation-rejected');
      };
    }
    
    // Set user as offline when component unmounts
    return () => {
      updateOnlineStatus(false);
    };
  }, [socket, user, navigate]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      console.log('Fetching matches with preference:', genderPreference);
      console.log('API URL:', `${API_BASE_URL}/api/users/matches?genderPreference=${genderPreference}`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to find matches');
        navigate('/');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/users/matches?genderPreference=${genderPreference}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Matches received:', response.data);
      setMatches(response.data);
      
      if (response.data.length === 0) {
        toast.info('No matches found at the moment. Try again later or adjust your preferences!');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      
      if (error.response?.status === 404) {
        toast.error('User profile not found. Please complete your profile.');
        navigate('/profile');
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Error fetching matches. Please try again.';
      toast.error(errorMessage);
      
      // Log additional debug info
      console.log('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions for domain:', user.domain);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to fetch questions');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/questions/${encodeURIComponent(user.domain)}/random?count=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Questions received:', response.data);
      setQuestions(response.data);
      
      if (response.data.length === 0) {
        toast.warning(`No questions available for ${user.domain} domain. Trying to fetch from other domains...`);
        
        // Try to fetch questions from any domain as fallback
        try {
          const fallbackResponse = await axios.get(
            `${API_BASE_URL}/api/questions/debug/all`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Debug info:', fallbackResponse.data);
          
          if (fallbackResponse.data.sampleQuestions && fallbackResponse.data.sampleQuestions.length > 0) {
            setQuestions(fallbackResponse.data.sampleQuestions);
            toast.info('Using sample questions from other domains');
          }
        } catch (debugError) {
          console.error('Debug fetch failed:', debugError);
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Error fetching questions';
      toast.error(errorMessage);
      
      console.log('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    }
  };

  const handleStartInterview = (match) => {
    setSelectedMatch(match);
    setQuestionDialogOpen(true);
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const updateOnlineStatus = async (isOnline) => {
    try {
      await axios.put(`${API_BASE_URL}/api/users/status`, { isOnline });
      console.log(`Updated online status to: ${isOnline}`);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const sendInterviewInvitation = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    try {
      const selectedQuestionObjects = questions.filter(q => selectedQuestions.includes(q._id));
      
      const response = await axios.post(`${API_BASE_URL}/api/interviews/send-invitation`, {
        participantId: selectedMatch._id,
        domain: user.domain,
        selectedQuestions: selectedQuestionObjects
      });

      toast.success(`Interview invitation sent to ${selectedMatch.name}!`);
      toast.info('Waiting for their response...');
      
      // Persist latest sent invitation for dashboard UX
      try {
        window.sessionStorage.setItem('recentSentInvitation', JSON.stringify(response.data.invitation));
      } catch (_) {}

      // Close dialog and reset selection
      setQuestionDialogOpen(false);
      setSelectedMatch(null);
      setSelectedQuestions([]);
      
      // Navigate to dashboard focusing Sent Invitations and pass invitation via state
      navigate('/dashboard?focus=sent-invitations', { state: { recentlySentInvitation: response.data.invitation } });
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.response?.data?.message || 'Error sending interview invitation';
      toast.error(errorMessage);
    }
  };



  // Check if user profile is complete
  if (!user?.domain || !user?.skills?.length || !user?.experience || !user?.gender) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your profile before finding matches.
          <Button 
            variant="outlined" 
            sx={{ ml: 2 }} 
            onClick={() => navigate('/profile')}
          >
            Complete Profile
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Find Interview Partner
        </Typography>

      {user?.isPremium && (
        <Box mb={3}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Gender Preference</InputLabel>
            <Select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              label="Gender Preference"
            >
              <MenuItem value="same">Same Gender</MenuItem>
              <MenuItem value="opposite">Opposite Gender</MenuItem>
              <MenuItem value="any">Any Gender</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {!user?.isPremium && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Free users can only match with same gender. Upgrade to Premium for more options!
        </Alert>
      )}

      <Alert severity="success" sx={{ mb: 3 }}>
        🟢 Online users are prioritized and shown first for better interview experience!
      </Alert>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Box textAlign="center">
                <Typography variant="h6" gutterBottom>Finding your perfect interview partners...</Typography>
                <Typography color="textSecondary">This may take a moment</Typography>
              </Box>
            </Box>
          </Grid>
        ) : matches.length === 0 ? (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" gutterBottom>No matches found right now</Typography>
              <Typography color="textSecondary" paragraph>
                Don't worry! Here are some tips to find more matches:
              </Typography>
              <Box component="ul" textAlign="left" maxWidth="400px" mx="auto">
                <Typography component="li" variant="body2" gutterBottom>
                  Make sure your profile is complete
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Try again in a few minutes - more users come online throughout the day
                </Typography>
                {user?.isPremium && (
                  <Typography component="li" variant="body2" gutterBottom>
                    Try changing your gender preference to "Any Gender"
                  </Typography>
                )}
                {!user?.isPremium && (
                  <Typography component="li" variant="body2" gutterBottom>
                    Consider upgrading to Premium for more matching options
                  </Typography>
                )}
              </Box>
              <Button 
                variant="outlined" 
                onClick={fetchMatches} 
                sx={{ mt: 2 }}
              >
                Refresh Matches
              </Button>
            </Box>
          </Grid>
        ) : (
          matches.map((match) => (
            <Grid item xs={12} md={6} lg={4} key={match._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      src={match.profilePicture ? `${API_BASE_URL}${match.profilePicture}` : ''}
                      sx={{ width: 50, height: 50, mr: 2, bgcolor: 'primary.main' }}
                    >
                      {!match.profilePicture && match.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">{match.name}</Typography>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: match.isOnline ? 'success.main' : 'grey.400'
                          }}
                        />
                      </Box>
                      <Typography color="textSecondary">{match.domain}</Typography>
                      <Typography variant="caption" color={match.isOnline ? 'success.main' : 'text.secondary'}>
                        {match.isOnline ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Skills:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {match.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">
                      Experience: {match.experience}
                    </Typography>
                    <Typography variant="body2">
                      Rating: {match.rating ? match.rating.toFixed(1) : '0.0'} ⭐
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Total Interviews: {match.totalInterviews || 0}
                  </Typography>

                  {match.bio && (
                    <Box mt={1} mb={1}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        About:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontStyle: 'italic',
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}>
                        {match.bio.length > 80 ? `${match.bio.substring(0, 80)}...` : match.bio}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleStartInterview(match)}
                    sx={{ mt: 2 }}
                    startIcon={<SendIcon />}

                  >
                    Send Interview Invitation
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Question Selection Dialog */}
      <Dialog 
        open={questionDialogOpen} 
        onClose={() => setQuestionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Select Questions for Interview with {selectedMatch?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Choose questions that will be displayed during the interview. Both participants will see these questions.
          </Typography>
          <List>
            {questions.map((question) => (
              <ListItem key={question._id} dense>
                <Checkbox
                  checked={selectedQuestions.includes(question._id)}
                  onChange={() => handleQuestionToggle(question._id)}
                />
                <ListItemText
                  primary={question.question}
                  secondary={
                    <Box>
                      <Chip label={question.difficulty} size="small" sx={{ mr: 1 }} />
                      <Chip label={question.category} size="small" variant="outlined" />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={sendInterviewInvitation}
            variant="contained"
            disabled={selectedQuestions.length === 0}
            startIcon={<SendIcon />}
          >
            Send Invitation ({selectedQuestions.length} questions)
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FindMatch;