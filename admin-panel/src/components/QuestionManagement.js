import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Pagination,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  FilterList
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [questionDialog, setQuestionDialog] = useState({ open: false, question: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, question: null });

  const [formData, setFormData] = useState({
    question: '',
    category: '',
    difficulty: 'Medium',
    domain: 'Frontend',
    type: 'open-ended',
    options: ['', '', '', ''],
    correctAnswer: '',
    sampleAnswer: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, [page, categoryFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/questions`, {
        params: { page, category: categoryFilter, limit: 10 }
      });
      setQuestions(response.data.questions);
      setCategories(response.data.categories);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      question: '',
      category: '',
      difficulty: 'Medium',
      domain: 'Frontend',
      type: 'open-ended',
      options: ['', '', '', ''],
      correctAnswer: '',
      sampleAnswer: ''
    });
    setQuestionDialog({ open: true, question: null });
  };

  const handleEditQuestion = (question) => {
    setFormData({
      question: question.question,
      category: question.category,
      difficulty: question.difficulty,
      domain: question.domain,
      type: question.type || 'open-ended',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      sampleAnswer: question.sampleAnswer || ''
    });
    setQuestionDialog({ open: true, question });
  };

  const handleSaveQuestion = async () => {
    try {
      const questionData = {
        ...formData,
        options: formData.type === 'multiple-choice' ? formData.options.filter(opt => opt.trim()) : []
      };

      if (questionDialog.question) {
        // Update existing question
        await axios.put(`${API_BASE_URL}/api/admin/questions/${questionDialog.question._id}`, questionData);
      } else {
        // Add new question
        await axios.post(`${API_BASE_URL}/api/admin/questions`, questionData);
      }

      setQuestionDialog({ open: false, question: null });
      fetchQuestions();
    } catch (error) {
      setError('Failed to save question');
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/questions/${deleteDialog.question._id}`);
      setDeleteDialog({ open: false, question: null });
      fetchQuestions();
    } catch (error) {
      setError('Failed to delete question');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Question Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddQuestion}
        >
          Add Question
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Filter by Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Questions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question._id}>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {question.question.length > 100
                      ? `${question.question.substring(0, 100)}...`
                      : question.question
                    }
                  </Typography>
                </TableCell>
                <TableCell>{question.category}</TableCell>
                <TableCell>{question.domain}</TableCell>
                <TableCell>
                  <Chip
                    label={question.difficulty}
                    color={getDifficultyColor(question.difficulty)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={question.type || 'open-ended'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(question.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Question">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditQuestion(question)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Question">
                    <IconButton
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, question })}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Add/Edit Question Dialog */}
      <Dialog
        open={questionDialog.open}
        onClose={() => setQuestionDialog({ open: false, question: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {questionDialog.question ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question"
                multiline
                rows={3}
                value={formData.question}
                onChange={(e) => handleFormChange('question', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Domain</InputLabel>
                <Select
                  value={formData.domain}
                  onChange={(e) => handleFormChange('domain', e.target.value)}
                  label="Domain"
                >
                  <MenuItem value="Frontend">Frontend</MenuItem>
                  <MenuItem value="Backend">Backend</MenuItem>
                  <MenuItem value="Full Stack">Full Stack</MenuItem>
                  <MenuItem value="Data Science">Data Science</MenuItem>
                  <MenuItem value="Mobile">Mobile</MenuItem>
                  <MenuItem value="DevOps">DevOps</MenuItem>
                  <MenuItem value="UI/UX">UI/UX</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => handleFormChange('difficulty', e.target.value)}
                  label="Difficulty"
                >
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Question Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  label="Question Type"
                >
                  <MenuItem value="open-ended">Open Ended</MenuItem>
                  <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                  <MenuItem value="coding">Coding</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.type === 'multiple-choice' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options
                  </Typography>
                </Grid>
                {formData.options.map((option, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Correct Answer"
                    value={formData.correctAnswer}
                    onChange={(e) => handleFormChange('correctAnswer', e.target.value)}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sample Answer (Optional)"
                multiline
                rows={3}
                value={formData.sampleAnswer}
                onChange={(e) => handleFormChange('sampleAnswer', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialog({ open: false, question: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveQuestion} variant="contained">
            {questionDialog.question ? 'Update' : 'Add'} Question
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, question: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this question? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, question: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteQuestion} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionManagement;