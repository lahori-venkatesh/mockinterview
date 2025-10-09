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
  Alert,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DOMAINS = ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Mobile', 'DevOps', 'UI/UX'];
const EXPERIENCE_LEVELS = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 
  'AWS', 'Docker', 'TypeScript', 'Vue.js', 'Angular', 'Express.js', 'Django',
  'Flask', 'Spring Boot', 'PostgreSQL', 'Redis', 'Kubernetes', 'Git', 'HTML/CSS'
];

const steps = ['Basic Info', 'Skills & Experience', 'Personal Info', 'Profile Picture', 'Complete'];

const ProfileSetup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    domain: '',
    skills: [],
    experience: '',
    gender: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

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

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.domain) {
        setError('Please select your domain');
        return;
      }
    } else if (activeStep === 1) {
      if (formData.skills.length === 0) {
        setError('Please select at least one skill');
        return;
      }
      if (!formData.experience) {
        setError('Please select your experience level');
        return;
      }
    } else if (activeStep === 2) {
      if (!formData.gender) {
        setError('Please select your gender');
        return;
      }
    } else if (activeStep === 3) {
      // Profile picture is optional, no validation needed
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      const uploadFormData = new FormData();
      uploadFormData.append('profilePicture', file);

      const response = await axios.post('http://localhost:5001/api/users/upload-profile-picture', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfilePicture(response.data.profilePicture);
    } catch (error) {
      setError('Error uploading profile picture');
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setProfilePicture('');
    setImagePreview('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What's your primary domain?
            </Typography>
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
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tell us about your skills and experience
            </Typography>
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
                {SKILLS.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Experience Level</InputLabel>
              <Select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                label="Experience Level"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
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
              label="Bio (Optional)"
              multiline
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself and your goals..."
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom align="center">
              Add a Profile Picture (Optional)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
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
                  id="profile-picture-upload-setup"
                  type="file"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <label htmlFor="profile-picture-upload-setup">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    disabled={uploadingImage}
                  >
                    Upload Photo
                  </Button>
                </label>
                {imagePreview && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                  >
                    Remove
                  </Button>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 1 }}>
                Upload a profile picture to help others recognize you (max 5MB)
              </Typography>
            </Box>
          </Box>
        );
      case 4:
        return (
          <Box textAlign="center">
            <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 2 }}>
              🎉 Welcome to InterviewAce!
            </Typography>
            <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
              Your profile is now complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You're ready to start practicing interviews with other developers. 
              Find your perfect interview partner and improve your skills together!
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Profile Summary:
              </Typography>
              <Typography variant="body2">
                <strong>Domain:</strong> {formData.domain}
              </Typography>
              <Typography variant="body2">
                <strong>Experience:</strong> {formData.experience}
              </Typography>
              <Typography variant="body2">
                <strong>Gender:</strong> {formData.gender}
              </Typography>
              <Typography variant="body2">
                <strong>Skills:</strong> {formData.skills.join(', ')}
              </Typography>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome to InterviewAce! 🎯
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
            Let's set up your profile to get you matched with the perfect interview partners
          </Typography>
          <Typography variant="body2" align="center" color="primary.main" sx={{ mb: 4, fontWeight: 'medium' }}>
            This will only take 2-3 minutes
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Setting up your account...' : 'Start My Interview Journey! 🚀'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                size="large"
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfileSetup;