import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Avatar,
  Alert,
  IconButton,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Report as ReportIcon,
  Send as SendIcon,
  QuestionAnswer as QuestionIcon,
  Timer as TimerIcon,
  SwapHoriz as SwapIcon,
  Warning as WarningIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Webcam from 'react-webcam';
import Peer from 'simple-peer';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

const Interview = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const socketContext = useSocket();
  const { socket, joinInterviewRoom, sendQuestion, sendAnswer, sendFeedback } = socketContext || {};
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [isInterviewer, setIsInterviewer] = useState(true);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comments: '' });
  const [mediaPermissionGranted, setMediaPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  
  // Enhanced UI states
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [guidelinesDialog, setGuidelinesDialog] = useState(true);
  const [roleAssigned, setRoleAssigned] = useState(false);
  const [screenRecordingBlocked, setScreenRecordingBlocked] = useState(false);
  
  // Video call states
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [partnerStream, setPartnerStream] = useState(null);
  const webcamRef = useRef();
  const partnerVideoRef = useRef();

  useEffect(() => {
    if (roomId) {
      joinInterview();
      setupVideoCall();
      preventScreenRecording();
      assignRoles();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [roomId]);

  // Prevent screen recording
  const preventScreenRecording = () => {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Disable common screenshot shortcuts
    document.addEventListener('keydown', (e) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) || // Ctrl+Shift+S
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) || // Mac screenshots
        (e.key === 'PrintScreen') || // Print Screen
        (e.ctrlKey && e.key === 'p') // Ctrl+P (print)
      ) {
        e.preventDefault();
        toast.error('Screen recording and screenshots are not allowed during interviews!');
        setScreenRecordingBlocked(true);
      }
    });

    // Detect if user switches tabs/windows
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        toast.warning('Please stay focused on the interview. Tab switching is monitored.');
      }
    });
  };

  // Automatically assign roles based on user ID or random
  const assignRoles = () => {
    if (interview && interview.participants.length === 2) {
      const currentUserIndex = interview.participants.findIndex(p => p.userId._id === user._id);
      // First participant is interviewer for first half
      setIsInterviewer(currentUserIndex === 0);
      setRoleAssigned(true);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('participant-joined', handleParticipantJoined);
      socket.on('new-question', handleNewQuestion);
      socket.on('new-answer', handleNewAnswer);
      socket.on('video-offer', handleVideoOffer);
      socket.on('video-answer', handleVideoAnswer);
      socket.on('ice-candidate', handleIceCandidate);

      return () => {
        socket.off('participant-joined');
        socket.off('new-question');
        socket.off('new-answer');
        socket.off('video-offer');
        socket.off('video-answer');
        socket.off('ice-candidate');
      };
    }
  }, [socket]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Switch roles after 45 minutes
          setIsInterviewer(!isInterviewer);
          return 45 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterviewer]);

  const joinInterview = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/interviews/join/${roomId}`);
      setInterview(response.data);
      if (joinInterviewRoom) {
        joinInterviewRoom(roomId, 'participant');
      }
    } catch (error) {
      console.error('Error joining interview:', error);
      const errorMessage = error.response?.data?.message || 'Error joining interview';
      toast.error(errorMessage);
      
      // Wait a bit before navigating to show the error message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  const setupVideoCall = async () => {
    try {
      // Request permissions with better error handling
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      setStream(userStream);
      setMediaPermissionGranted(true);
      setPermissionError('');
      
      // Set video source
      if (webcamRef.current) {
        webcamRef.current.srcObject = userStream;
      }
      
      toast.success('Camera and microphone connected successfully');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      let errorMessage = 'Error accessing camera/microphone. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is already in use.';
      } else {
        errorMessage += 'Please check your camera and microphone settings.';
      }
      
      setPermissionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleParticipantJoined = (data) => {
    toast.info(`${data.userId} joined the interview`);
    initiatePeerConnection();
  };

  const initiatePeerConnection = () => {
    const newPeer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    newPeer.on('offer', (offer) => {
      socket.emit('video-offer', { roomId, offer });
    });

    newPeer.on('stream', (partnerStream) => {
      setPartnerStream(partnerStream);
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = partnerStream;
      }
    });

    setPeer(newPeer);
  };

  const handleVideoOffer = (data) => {
    const newPeer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    newPeer.on('answer', (answer) => {
      socket.emit('video-answer', { roomId, answer });
    });

    newPeer.on('stream', (partnerStream) => {
      setPartnerStream(partnerStream);
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = partnerStream;
      }
    });

    newPeer.signal(data.offer);
    setPeer(newPeer);
  };

  const handleVideoAnswer = (data) => {
    if (peer) {
      peer.signal(data.answer);
    }
  };

  const handleIceCandidate = (data) => {
    if (peer) {
      peer.signal(data.candidate);
    }
  };

  const handleNewQuestion = (data) => {
    setChatMessages(prev => [...prev, {
      type: 'question',
      content: data.question,
      sender: data.askedBy,
      timestamp: new Date()
    }]);
  };

  const handleNewAnswer = (data) => {
    setChatMessages(prev => [...prev, {
      type: 'answer',
      content: data.answer,
      sender: data.answeredBy,
      timestamp: new Date()
    }]);
  };

  const handleSendQuestion = () => {
    if (currentQuestion.trim()) {
      sendQuestion(roomId, currentQuestion);
      setChatMessages(prev => [...prev, {
        type: 'question',
        content: currentQuestion,
        sender: user.id,
        timestamp: new Date()
      }]);
      setCurrentQuestion('');
    }
  };

  const handleSendAnswer = () => {
    if (currentAnswer.trim()) {
      sendAnswer(roomId, currentAnswer);
      setChatMessages(prev => [...prev, {
        type: 'answer',
        content: currentAnswer,
        sender: user.id,
        timestamp: new Date()
      }]);
      setCurrentAnswer('');
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micEnabled;
        setMicEnabled(!micEnabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  };

  const handleReport = async () => {
    try {
      const partnerId = interview?.participants.find(p => p.userId._id !== user._id)?.userId._id;
      
      await axios.post(`${API_BASE_URL}/api/interviews/${roomId}/report`, {
        reportedUserId: partnerId,
        reason: reportReason,
        timestamp: new Date()
      });

      toast.success('Report submitted successfully. Our team will review it.');
      setReportDialog(false);
      setReportReason('');
    } catch (error) {
      toast.error('Error submitting report');
    }
  };

  const debugInterviewData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/interviews/${roomId}/debug`);
      console.log('Debug interview data:', response.data);
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      console.log('Submitting feedback...', { interview, user });
      
      // Debug the interview data
      await debugInterviewData();
      
      if (!interview || !interview.participants) {
        toast.error('Interview data not available');
        return;
      }

      const partner = interview.participants.find(p => p.userId._id !== user._id);
      if (!partner) {
        toast.error('Partner information not found');
        console.log('Available participants:', interview.participants);
        console.log('Current user ID:', user._id);
        return;
      }

      const partnerId = partner.userId._id;
      
      console.log('Feedback data:', {
        roomId,
        partnerId,
        rating: feedback.rating,
        comments: feedback.comments
      });

      const response = await axios.post(`${API_BASE_URL}/api/interviews/${roomId}/feedback`, {
        toUserId: partnerId,
        rating: feedback.rating,
        comments: feedback.comments
      });

      console.log('Feedback response:', response.data);
      toast.success('Feedback submitted successfully! Thank you for your participation.');
      setFeedbackDialog(false);
      
      // Wait a moment before navigating to show the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.message || 'Error submitting feedback. Please try again.';
      toast.error(errorMessage);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!interview) {
    return <Typography>Loading interview...</Typography>;
  }

  if (!mediaPermissionGranted && permissionError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom color="error">
            Camera/Microphone Access Required
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {permissionError}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={setupVideoCall}
            sx={{ mr: 2 }}
          >
            Grant Permissions
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const partner = interview.participants.find(p => p.userId._id !== user._id);

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Guidelines Dialog */}
      <Dialog 
        open={guidelinesDialog} 
        onClose={() => setGuidelinesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'error.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ShieldIcon />
          Interview Guidelines & Rules
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚨 STRICT RULES - Violation will result in account suspension
            </Typography>
          </Alert>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="error" gutterBottom>
              ❌ PROHIBITED BEHAVIOR:
            </Typography>
            <List dense>
              <ListItem>• No inappropriate language, harassment, or discrimination</ListItem>
              <ListItem>• No sharing of personal contact information</ListItem>
              <ListItem>• No screen recording or taking screenshots</ListItem>
              <ListItem>• No cheating or getting external help during interview</ListItem>
              <ListItem>• No misleading information about skills or experience</ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              ✅ EXPECTED BEHAVIOR:
            </Typography>
            <List dense>
              <ListItem>• Be respectful and professional at all times</ListItem>
              <ListItem>• Focus on technical questions and answers</ListItem>
              <ListItem>• Provide constructive feedback</ListItem>
              <ListItem>• Stay engaged throughout the session</ListItem>
              <ListItem>• Report any inappropriate behavior immediately</ListItem>
            </List>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Role Assignment:</strong> You will automatically be assigned as either 
              interviewer or interviewee. Roles will switch after 45 minutes to give both 
              participants equal practice time.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setGuidelinesDialog(false)}
            variant="contained"
            color="primary"
            size="large"
          >
            I Understand & Agree
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="xl" sx={{ pt: 2, pb: 2 }}>
        {/* Header with Role and Timer */}
        <Card sx={{ mb: 2, bgcolor: isInterviewer ? '#e3f2fd' : '#f3e5f5' }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ 
                    bgcolor: isInterviewer ? 'primary.main' : 'secondary.main',
                    width: 50,
                    height: 50
                  }}>
                    {isInterviewer ? <QuestionIcon /> : <SendIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {isInterviewer ? '🎯 You are the INTERVIEWER' : '💡 You are the INTERVIEWEE'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {isInterviewer ? 'Ask questions and evaluate answers' : 'Answer questions to the best of your ability'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <TimerIcon color="primary" />
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {formatTime(timeLeft)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Time until role switch
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Tooltip title="Report inappropriate behavior">
                  <IconButton 
                    color="error" 
                    onClick={() => setReportDialog(true)}
                    sx={{ mr: 1 }}
                  >
                    <ReportIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    console.log('Opening feedback dialog...');
                    console.log('Current interview:', interview);
                    console.log('Current user:', user);
                    setFeedbackDialog(true);
                  }}
                  startIcon={<SwapIcon />}
                >
                  End Interview
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
        {/* Enhanced Video Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '500px', position: 'relative' }}>
            <CardContent sx={{ p: 0, height: '100%' }}>
              <Grid container sx={{ height: '100%' }}>
                <Grid item xs={6} sx={{ position: 'relative' }}>
                  <Box sx={{ 
                    position: 'relative', 
                    height: '100%', 
                    bgcolor: 'black', 
                    borderRadius: '8px 0 0 8px',
                    overflow: 'hidden'
                  }}>
                    <video
                      ref={webcamRef}
                      autoPlay
                      muted
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        display: videoEnabled ? 'block' : 'none'
                      }}
                    />
                    {!videoEnabled && (
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#1a1a1a'
                      }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                          {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </Box>
                    )}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Chip 
                        label="You" 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0,0,0,0.7)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={toggleMic}
                          sx={{ 
                            bgcolor: micEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(244,67,54,0.8)',
                            color: 'white',
                            mr: 1
                          }}
                        >
                          {micEnabled ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={toggleVideo}
                          sx={{ 
                            bgcolor: videoEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(244,67,54,0.8)',
                            color: 'white'
                          }}
                        >
                          {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sx={{ position: 'relative' }}>
                  <Box sx={{ 
                    position: 'relative', 
                    height: '100%', 
                    bgcolor: 'black', 
                    borderRadius: '0 8px 8px 0',
                    overflow: 'hidden'
                  }}>
                    <video
                      ref={partnerVideoRef}
                      autoPlay
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Chip 
                        label={partner?.userId.name || 'Partner'} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0,0,0,0.7)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Control Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Interview Timer
            </Typography>
            <Typography variant="h4" color="primary" align="center">
              {formatTime(timeLeft)}
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary">
              {isInterviewer ? 'Time left as interviewer' : 'Time left as interviewee'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Interview Questions
            </Typography>
            <List dense>
              {interview.selectedQuestions.map((q, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={q.question}
                    secondary={
                      <Chip label={q.difficulty} size="small" />
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat/Q&A Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Questions & Answers
            </Typography>
            
            <Box sx={{ height: '200px', overflowY: 'auto', mb: 2, border: '1px solid #ddd', p: 1 }}>
              {chatMessages.map((message, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    {message.type === 'question' ? '❓ Question' : '💡 Answer'} - {message.timestamp.toLocaleTimeString()}
                  </Typography>
                  <Typography variant="body2">
                    {message.content}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Grid container spacing={2}>
              {isInterviewer ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ask a question"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendQuestion}
                    sx={{ mt: 1 }}
                    disabled={!currentQuestion.trim()}
                  >
                    Send Question
                  </Button>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Your answer"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendAnswer}
                    sx={{ mt: 1 }}
                    disabled={!currentAnswer.trim()}
                  >
                    Send Answer
                  </Button>
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setFeedbackDialog(true)}
              >
                End Interview & Give Feedback
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Report Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon />
          Report Inappropriate Behavior
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please report any behavior that violates our community guidelines. 
            False reports may result in account penalties.
          </Alert>
          <TextField
            fullWidth
            label="Reason for report"
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please describe the inappropriate behavior in detail..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReport} 
            variant="contained" 
            color="error"
            disabled={!reportReason.trim()}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          🌟 Rate Your Interview Experience
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              src={partner?.userId.profilePicture ? `${API_BASE_URL}${partner.userId.profilePicture}` : ''}
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
            >
              {partner?.userId.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">{partner?.userId.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {partner?.userId.domain} Developer
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="legend" sx={{ mb: 1 }}>
              Overall Interview Experience *
            </Typography>
            <Rating
              value={feedback.rating}
              onChange={(event, newValue) => {
                console.log('Rating changed from', feedback.rating, 'to:', newValue);
                setFeedback(prev => {
                  const updated = { ...prev, rating: newValue || 0 };
                  console.log('Updated feedback state:', updated);
                  return updated;
                });
              }}
              size="large"
              precision={1}
            />
            {(!feedback.rating || feedback.rating < 1) && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Please select a rating to continue
              </Typography>
            )}
          </Box>
          
          <TextField
            fullWidth
            label="Comments & Feedback (optional)"
            multiline
            rows={4}
            value={feedback.comments}
            onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
            placeholder="Share your thoughts about the interview experience..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitFeedback} 
            variant="contained" 
            size="large"
            disabled={!feedback.rating || feedback.rating < 1}
          >
            Submit Feedback & Exit
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default Interview;