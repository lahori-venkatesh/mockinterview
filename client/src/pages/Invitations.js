import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Badge,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Schedule as PendingIcon,
  Send as SentIcon,
  Inbox as ReceivedIcon,
  Person as PersonIcon,
  QuestionAnswer as QuestionIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Domain as DomainIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

const Invitations = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [questionsDialog, setQuestionsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchInvitations();
    
    // Listen for real-time invitation updates
    if (socket) {
      socket.on('interview-invitation', handleNewInvitation);
      socket.on('invitation-accepted', handleInvitationAccepted);
      socket.on('invitation-rejected', handleInvitationRejected);
      
      return () => {
        socket.off('interview-invitation');
        socket.off('invitation-accepted');
        socket.off('invitation-rejected');
      };
    }
  }, [socket]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      
      // Fetch received invitations
      const receivedResponse = await axios.get(`${API_BASE_URL}/api/interviews/pending-invitations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Fetch sent invitations
      const sentResponse = await axios.get(`${API_BASE_URL}/api/interviews/sent-invitations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setReceivedInvitations(receivedResponse.data.invitations || []);
      setSentInvitations(sentResponse.data.invitations || []);
      
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleNewInvitation = (invitation) => {
    console.log('New invitation received:', invitation);
    setReceivedInvitations(prev => [invitation, ...prev]);
    toast.info(`New interview invitation from ${invitation.interviewer.name}!`);
  };

  const handleInvitationAccepted = (data) => {
    console.log('Invitation accepted:', data);
    // Update sent invitations status
    setSentInvitations(prev => 
      prev.map(inv => 
        inv.id === data.invitationId 
          ? { ...inv, status: 'accepted' }
          : inv
      )
    );
    
    if (data.roomId) {
      toast.success('Invitation accepted! Redirecting to interview...');
      setTimeout(() => navigate(`/interview/${data.roomId}`), 1500);
    }
  };

  const handleInvitationRejected = (data) => {
    console.log('Invitation rejected:', data);
    // Update sent invitations status
    setSentInvitations(prev => 
      prev.map(inv => 
        inv.id === data.invitationId 
          ? { ...inv, status: 'rejected' }
          : inv
      )
    );
    toast.info(data.message || 'Invitation was declined');
  };

  const handleAcceptInvitation = async (invitation) => {
    try {
      setActionLoading(invitation.id);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/interviews/respond-invitation/${invitation.id}`,
        { response: 'accept' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast.success('Invitation accepted! Redirecting to interview...');
      
      // Remove from received invitations
      setReceivedInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      // Navigate to interview
      if (response.data.roomId) {
        setTimeout(() => navigate(`/interview/${response.data.roomId}`), 1500);
      }
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectInvitation = async (invitation) => {
    try {
      setActionLoading(invitation.id);
      
      await axios.post(
        `${API_BASE_URL}/api/interviews/respond-invitation/${invitation.id}`,
        { response: 'reject' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast.info('Invitation declined');
      
      // Remove from received invitations
      setReceivedInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to reject invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelInvitation = async (invitation) => {
    try {
      setActionLoading(invitation.id);
      
      await axios.post(
        `${API_BASE_URL}/api/interviews/cancel-invitation/${invitation.id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast.success('Invitation cancelled');
      
      // Update sent invitations
      setSentInvitations(prev => 
        prev.map(inv => 
          inv.id === invitation.id 
            ? { ...inv, status: 'cancelled' }
            : inv
        )
      );
      
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const viewProfile = (person) => {
    setSelectedInvitation(person);
    setProfileDialog(true);
  };

  const viewQuestions = (questions) => {
    setSelectedInvitation({ selectedQuestions: questions });
    setQuestionsDialog(true);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'accepted': return <AcceptIcon />;
      case 'rejected': return <RejectIcon />;
      case 'cancelled': return <RejectIcon />;
      default: return <PendingIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Interview Invitations</Typography>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading invitations...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Interview Invitations
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={
              <Badge badgeContent={receivedInvitations.length} color="primary">
                <ReceivedIcon />
              </Badge>
            } 
            label="Received" 
          />
          <Tab 
            icon={
              <Badge badgeContent={sentInvitations.filter(inv => inv.status === 'pending').length} color="warning">
                <SentIcon />
              </Badge>
            } 
            label="Sent" 
          />
        </Tabs>
      </Paper>

      {/* Received Invitations Tab */}
      {tabValue === 0 && (
        <Box>
          {receivedInvitations.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ReceivedIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No pending invitations
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                When someone sends you an interview invitation, it will appear here
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/find-match')}
              >
                Find Interview Partners
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {receivedInvitations.map((invitation) => (
                <Grid item xs={12} md={6} key={invitation.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      {/* Header with sender info */}
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                          src={invitation.interviewer.profilePicture ? 
                            `${API_BASE_URL}${invitation.interviewer.profilePicture}` : ''
                          }
                          sx={{ width: 50, height: 50, mr: 2 }}
                        >
                          {invitation.interviewer.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">
                            {invitation.interviewer.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                              icon={<DomainIcon />}
                              label={invitation.interviewer.domain} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              icon={<StarIcon />}
                              label={`${invitation.interviewer.rating || 0}★`} 
                              size="small" 
                              color="primary"
                            />
                          </Box>
                        </Box>
                        <Tooltip title="View Profile">
                          <IconButton 
                            onClick={() => viewProfile(invitation.interviewer)}
                            size="small"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Invitation details */}
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Interview Domain: <strong>{invitation.domain}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Questions: {invitation.selectedQuestions.length} selected
                          <Button 
                            size="small" 
                            onClick={() => viewQuestions(invitation.selectedQuestions)}
                            sx={{ ml: 1 }}
                          >
                            View Questions
                          </Button>
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Received {formatTimeAgo(invitation.createdAt)}
                        </Typography>
                      </Box>

                      {/* Skills */}
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Skills:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {invitation.interviewer.skills.slice(0, 4).map((skill) => (
                            <Chip key={skill} label={skill} size="small" />
                          ))}
                          {invitation.interviewer.skills.length > 4 && (
                            <Chip 
                              label={`+${invitation.interviewer.skills.length - 4} more`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Action buttons */}
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<AcceptIcon />}
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={actionLoading === invitation.id}
                          fullWidth
                        >
                          {actionLoading === invitation.id ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => handleRejectInvitation(invitation)}
                          disabled={actionLoading === invitation.id}
                          fullWidth
                        >
                          {actionLoading === invitation.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Sent Invitations Tab */}
      {tabValue === 1 && (
        <Box>
          {sentInvitations.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No sent invitations
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Invitations you send will appear here with their status
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/find-match')}
              >
                Send Interview Invitations
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sentInvitations.map((invitation) => (
                <Grid item xs={12} md={6} key={invitation.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      {/* Header with recipient info */}
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                          src={invitation.recipient.profilePicture ? 
                            `${API_BASE_URL}${invitation.recipient.profilePicture}` : ''
                          }
                          sx={{ width: 50, height: 50, mr: 2 }}
                        >
                          {invitation.recipient.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">
                            {invitation.recipient.name}
                          </Typography>
                          <Chip 
                            icon={<DomainIcon />}
                            label={invitation.recipient.domain} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                        <Chip
                          icon={getStatusIcon(invitation.status)}
                          label={invitation.status.toUpperCase()}
                          color={getStatusColor(invitation.status)}
                          size="small"
                        />
                      </Box>

                      {/* Invitation details */}
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Domain: <strong>{invitation.domain}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Questions: {invitation.selectedQuestions.length} selected
                          <Button 
                            size="small" 
                            onClick={() => viewQuestions(invitation.selectedQuestions)}
                            sx={{ ml: 1 }}
                          >
                            View Questions
                          </Button>
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Sent {formatTimeAgo(invitation.createdAt)}
                        </Typography>
                      </Box>

                      {/* Action button for pending invitations */}
                      {invitation.status === 'pending' && (
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<RejectIcon />}
                          onClick={() => handleCancelInvitation(invitation)}
                          disabled={actionLoading === invitation.id}
                          fullWidth
                        >
                          {actionLoading === invitation.id ? 'Cancelling...' : 'Cancel Invitation'}
                        </Button>
                      )}

                      {invitation.status === 'accepted' && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          Interview accepted! Check your interview history.
                        </Alert>
                      )}

                      {invitation.status === 'rejected' && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Invitation was declined. Try sending to other users.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Profile Dialog */}
      <Dialog 
        open={profileDialog} 
        onClose={() => setProfileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              src={selectedInvitation?.profilePicture ? 
                `${API_BASE_URL}${selectedInvitation.profilePicture}` : ''
              }
              sx={{ width: 60, height: 60 }}
            >
              {selectedInvitation?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedInvitation?.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedInvitation?.domain} • {selectedInvitation?.experience}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Skills:</Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {selectedInvitation?.skills?.map((skill) => (
                <Chip key={skill} label={skill} size="small" />
              ))}
            </Box>
          </Box>
          
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Rating:</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <StarIcon color="primary" />
              <Typography>{selectedInvitation?.rating || 0}/5</Typography>
            </Box>
          </Box>

          {selectedInvitation?.bio && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>About:</Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedInvitation.bio}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Questions Dialog */}
      <Dialog 
        open={questionsDialog} 
        onClose={() => setQuestionsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <QuestionIcon />
            Interview Questions ({selectedInvitation?.selectedQuestions?.length || 0})
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedInvitation?.selectedQuestions?.map((question, index) => (
              <React.Fragment key={question._id || index}>
                <ListItem>
                  <ListItemText
                    primary={`${index + 1}. ${question.question}`}
                    secondary={
                      <Box display="flex" gap={1} mt={1}>
                        <Chip 
                          label={question.difficulty} 
                          size="small" 
                          color={
                            question.difficulty === 'Easy' ? 'success' :
                            question.difficulty === 'Medium' ? 'warning' : 'error'
                          }
                        />
                        <Chip 
                          label={question.category} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < selectedInvitation.selectedQuestions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Invitations;