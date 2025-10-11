import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Switch,
  FormControlLabel,
  Alert,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

const DOMAINS = ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Mobile', 'DevOps', 'UI/UX'];
const EXPERIENCE_LEVELS = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const AVAILABLE_SKILLS = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'Vue.js', 'Angular', 'Django', 'Flask', 'Spring Boot', 'PostgreSQL', 'Redis', 'GraphQL'];

const Profile = () => {
  const { user, updateUser, refreshUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skills: user?.skills || [],
    domain: user?.domain || '',
    experience: user?.experience || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
    isOnline: user?.isOnline || false
  });
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillsChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      skills: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/profile`, formData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (event) => {
    const isOnline = event.target.checked;
    setFormData(prev => ({ ...prev, isOnline }));
    
    try {
      await axios.put(`${API_BASE_URL}/api/users/status`, { isOnline });
      updateUser({ isOnline });
      toast.success(`Status updated to ${isOnline ? 'Online' : 'Offline'}`);
    } catch (error) {
      console.error('Status update error:', error);
      const errorMessage = error.response?.data?.message || 'Error updating status';
      toast.error(errorMessage);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(`${API_BASE_URL}/api/users/upload-profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfilePicture(response.data.profilePicture);
      updateUser({ profilePicture: response.data.profilePicture });
      await refreshUserProfile(); // Refresh user data from server
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading profile picture');
      setImagePreview(profilePicture); // Reset preview on error
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/users/profile-picture`);
      setProfilePicture('');
      setImagePreview('');
      updateUser({ profilePicture: '' });
      await refreshUserProfile(); // Refresh user data from server
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Remove image error:', error);
      const errorMessage = error.response?.data?.message || 'Error removing profile picture';
      toast.error(errorMessage);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Profile Settings
          </Typography>
          
          {!user?.isPremium && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Upgrade to Premium to unlock advanced matching features and cross-gender interviews!
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            {/* Profile Picture Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Picture
              </Typography>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={imagePreview}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: '3rem',
                    bgcolor: 'primary.main'
                  }}
                >
                  {!imagePreview && user?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                {uploadingImage && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <label htmlFor="profile-picture-upload">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    disabled={uploadingImage}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
                {(imagePreview || profilePicture) && (
                  <IconButton
                    color="error"
                    aria-label="remove picture"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary" align="center">
                Upload a profile picture (max 5MB)
              </Typography>
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Domain</InputLabel>
              <Select
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                label="Domain"
              >
                {DOMAINS.map((domain) => (
                  <MenuItem key={domain} value={domain}>
                    {domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Skills</InputLabel>
              <Select
                multiple
                name="skills"
                value={formData.skills}
                onChange={handleSkillsChange}
                input={<OutlinedInput label="Skills" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {AVAILABLE_SKILLS.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Experience</InputLabel>
              <Select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                label="Experience"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gender"
              >
                {GENDER_OPTIONS.map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              name="bio"
              label="Bio"
              multiline
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself and your goals..."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isOnline}
                  onChange={handleStatusChange}
                  name="isOnline"
                />
              }
              label="Available for interviews"
              sx={{ mt: 2, mb: 2 }}
            />

            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Account Statistics
              </Typography>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Total Interviews
                  </Typography>
                  <Typography variant="h6">
                    {user?.totalInterviews || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Average Rating
                  </Typography>
                  <Typography variant="h6">
                    {user?.rating?.toFixed(1) || '0.0'} ⭐
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Account Type
                  </Typography>
                  <Typography variant="h6">
                    {user?.isPremium ? 'Premium' : 'Free'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>

            {!user?.isPremium && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                sx={{ mb: 2 }}
              >
                Upgrade to Premium
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;