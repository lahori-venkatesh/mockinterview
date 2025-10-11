import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  People,
  Quiz,
  Assessment,
  Report,
  TrendingUp,
  School
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Import components
import UserManagement from '../components/UserManagement';
import QuestionManagement from '../components/QuestionManagement';
import Analytics from '../components/Analytics';
import ReportedUsers from '../components/ReportedUsers';

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading admin dashboard...</Typography>
      </Container>
    );
  }

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={analytics.users.total}
              icon={<People fontSize="large" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={analytics.users.active}
              icon={<TrendingUp fontSize="large" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Questions"
              value={analytics.questions.total}
              icon={<Quiz fontSize="large" />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Interviews"
              value={analytics.interviews.total}
              icon={<School fontSize="large" />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* Admin Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Analytics" icon={<Assessment />} />
          <Tab label="User Management" icon={<People />} />
          <Tab label="Question Management" icon={<Quiz />} />
          <Tab label="Reported Users" icon={<Report />} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && <Analytics analytics={analytics} />}
          {currentTab === 1 && <UserManagement />}
          {currentTab === 2 && <QuestionManagement />}
          {currentTab === 3 && <ReportedUsers />}
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;