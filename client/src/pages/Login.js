import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Grid,
  Stack,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Google,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Close
} from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    const result = await googleLogin(credentialResponse.credential);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const sellingPoints = [
    'Real-time peer interviews',
    'Structured feedback workflows',
    'Premium analytics & history'
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderRight: { md: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` },
                p: { xs: 4, md: 5 }
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                MockInterview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Industry-grade practice rooms, powered by your peers.
              </Typography>
              <Stack spacing={2}>
                {sellingPoints.map((point) => (
                  <Stack direction="row" spacing={1.5} alignItems="center" key={point}>
                    <Chip
                      size="small"
                      color="primary"
                      label="•"
                      sx={{ borderRadius: '50%', minWidth: 28, height: 28, fontSize: 18 }}
                    />
                    <Typography color="text.secondary">{point}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={7} sx={{ p: { xs: 4, md: 5 }, position: 'relative' }}>
              <IconButton
                onClick={() => navigate('/')}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16
                }}
              >
                <Close />
              </IconButton>

              <Box textAlign="left" mb={4}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue your interview journey.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Google Sign In Button */}
              <Box sx={{ mb: 3 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="large"
                  width="100%"
                  text="continue_with"
                  shape="rectangular"
                />
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or sign in with email
                </Typography>
              </Divider>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Box textAlign="center" mt={2}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Forgot your password?
                  </Link>
                </Box>

                <Box textAlign="center" mt={2}>
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Don't have an account? Sign Up
                  </Link>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;