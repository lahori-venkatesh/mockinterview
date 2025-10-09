import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Avatar,
  Rating,
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const History = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/interviews/history');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching interview history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading interview history...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Interview History
      </Typography>

      {interviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No interviews yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Start your first interview to see your history here!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {interviews.map((interview) => {
            const partner = interview.participants.find(p => p.userId._id !== user.id);
            const myFeedback = interview.feedback?.find(f => f.fromUser === user.id);
            const partnerFeedback = interview.feedback?.find(f => f.toUser === user.id);

            return (
              <Grid item xs={12} md={6} key={interview._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Interview with {partner?.userId.name}
                      </Typography>
                      <Chip 
                        label={interview.status} 
                        color={getStatusColor(interview.status)}
                        size="small"
                      />
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
                        {partner?.userId.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {partner?.userId.domain}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(interview.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Questions ({interview.selectedQuestions?.length || 0}):
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {interview.selectedQuestions?.slice(0, 3).map((q, index) => (
                          <Chip 
                            key={index} 
                            label={q.difficulty} 
                            size="small" 
                            variant="outlined" 
                          />
                        ))}
                        {interview.selectedQuestions?.length > 3 && (
                          <Chip 
                            label={`+${interview.selectedQuestions.length - 3} more`} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </Box>

                    {interview.status === 'completed' && (
                      <Box>
                        {partnerFeedback && (
                          <Box mb={1}>
                            <Typography variant="body2" color="textSecondary">
                              Rating received:
                            </Typography>
                            <Rating value={partnerFeedback.rating} readOnly size="small" />
                          </Box>
                        )}
                        
                        {myFeedback && (
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Rating given:
                            </Typography>
                            <Rating value={myFeedback.rating} readOnly size="small" />
                          </Box>
                        )}

                        {interview.duration && (
                          <Typography variant="caption" color="textSecondary">
                            Duration: {interview.duration} minutes
                          </Typography>
                        )}
                      </Box>
                    )}

                    {interview.isPremium && (
                      <Chip 
                        label="Premium Interview" 
                        color="secondary" 
                        size="small" 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default History;