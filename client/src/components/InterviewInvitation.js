import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  VideoCall,
  Person,
  Schedule,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { toast } from 'react-toastify';

const InterviewInvitation = ({ invitation, onClose, onRespond }) => {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const navigate = useNavigate();

  useEffect(() => {
    if (!invitation) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(invitation.expiresAt);
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        toast.error('Interview invitation expired');
        onClose();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [invitation, onClose]);

  const handleResponse = async (response) => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${API_BASE_URL}/api/interviews/respond-invitation/${invitation.id}`,
        { response }
      );

      if (response === 'accept') {
        toast.success('Interview invitation accepted!');
        onRespond('accepted', result.data.roomId);
        navigate(`/interview/${result.data.roomId}`);
      } else {
        toast.info('Interview invitation declined.');
        onRespond('rejected');
      }

      onClose();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressValue = () => ((300 - timeLeft) / 300) * 100;

  if (!invitation) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pb: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <VideoCall sx={{ mr: 1, verticalAlign: 'middle' }} />
        Interview Invitation
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You have received an interview invitation!
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Time remaining:
            </Typography>
            <Typography variant="body2" color={timeLeft < 60 ? 'error' : 'textSecondary'}>
              {formatTime(timeLeft)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            color={timeLeft < 60 ? 'error' : 'primary'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            mb: 2
          }}
        >
          <Avatar
            src={invitation.interviewer.profilePicture ? `${API_BASE_URL}${invitation.interviewer.profilePicture}` : ''}
            sx={{ width: 60, height: 60, mr: 2 }}
          >
            {invitation.interviewer.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {invitation.interviewer.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {invitation.interviewer.domain} • {invitation.interviewer.email}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {invitation.interviewer.skills?.slice(0, 3).map((skill) => (
                <Chip key={skill} label={skill} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Interview Details:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">Domain: {invitation.domain}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              Questions: {invitation.selectedQuestions?.length || 0} selected
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
          Would you like to join this interview session?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={() => handleResponse('reject')}
          disabled={loading}
          variant="outlined"
          color="error"
          startIcon={<Close />}
          sx={{ mr: 1 }}
        >
          Decline
        </Button>
        <Button
          onClick={() => handleResponse('accept')}
          disabled={loading}
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <VideoCall />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          {loading ? 'Joining...' : 'Accept & Join'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewInvitation;