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
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add,
  PersonAdd,
  AdminPanelSettings,
  PersonRemove,
  Visibility,
  Delete
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [createAdminDialog, setCreateAdminDialog] = useState(false);
  const [promoteUserDialog, setPromoteUserDialog] = useState(false);
  const [demoteDialog, setDemoteDialog] = useState({ open: false, admin: null });
  
  // Form data
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    domain: 'Full Stack',
    experience: '5+ years'
  });

  useEffect(() => {
    fetchAdmins();
    fetchUsers();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/admins`);
      setAdmins(response.data.admins);
    } catch (error) {
      setError('Failed to fetch admins');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users?limit=50`);
      setUsers(response.data.users.filter(user => user.role !== 'admin'));
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      setError('');
      await axios.post(`${API_BASE_URL}/api/admin/create-admin`, newAdminData);
      setSuccess('Admin created successfully!');
      setCreateAdminDialog(false);
      setNewAdminData({
        name: '',
        email: '',
        password: '',
        domain: 'Full Stack',
        experience: '5+ years'
      });
      fetchAdmins();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      setError('');
      const response = await axios.put(`${API_BASE_URL}/api/admin/promote-user/${userId}`);
      setSuccess(response.data.message);
      setPromoteUserDialog(false);
      fetchAdmins();
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleDemoteAdmin = async () => {
    try {
      setError('');
      const response = await axios.put(`${API_BASE_URL}/api/admin/demote-admin/${demoteDialog.admin._id}`);
      setSuccess(response.data.message);
      setDemoteDialog({ open: false, admin: null });
      fetchAdmins();
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to demote admin');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Admin Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={() => setPromoteUserDialog(true)}
            sx={{ mr: 2 }}
          >
            Promote User
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateAdminDialog(true)}
          >
            Create Admin
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Admin Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AdminPanelSettings color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{admins.length}</Typography>
                  <Typography color="textSecondary">Total Admins</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonAdd color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography color="textSecondary">Promotable Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admins Table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Current Admins
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin._id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <AdminPanelSettings color="error" sx={{ mr: 1 }} />
                    {admin.name}
                  </Box>
                </TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.domain}</TableCell>
                <TableCell>{admin.experience}</TableCell>
                <TableCell>{formatDate(admin.createdAt)}</TableCell>
                <TableCell>
                  <Tooltip title="Demote to User">
                    <IconButton
                      color="warning"
                      onClick={() => setDemoteDialog({ open: true, admin })}
                    >
                      <PersonRemove />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Admin Dialog */}
      <Dialog
        open={createAdminDialog}
        onClose={() => setCreateAdminDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={newAdminData.name}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                helperText="Minimum 6 characters"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Domain</InputLabel>
                <Select
                  value={newAdminData.domain}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, domain: e.target.value }))}
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
                <InputLabel>Experience</InputLabel>
                <Select
                  value={newAdminData.experience}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, experience: e.target.value }))}
                  label="Experience"
                >
                  <MenuItem value="Fresher">Fresher</MenuItem>
                  <MenuItem value="0-1 years">0-1 years</MenuItem>
                  <MenuItem value="1-3 years">1-3 years</MenuItem>
                  <MenuItem value="3-5 years">3-5 years</MenuItem>
                  <MenuItem value="5+ years">5+ years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAdminDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAdmin} variant="contained">
            Create Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Promote User Dialog */}
      <Dialog
        open={promoteUserDialog}
        onClose={() => setPromoteUserDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Promote User to Admin</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select a user to promote to admin role:
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.domain}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handlePromoteUser(user._id)}
                      >
                        Promote
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromoteUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Demote Admin Dialog */}
      <Dialog
        open={demoteDialog.open}
        onClose={() => setDemoteDialog({ open: false, admin: null })}
      >
        <DialogTitle>Demote Admin</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to demote "{demoteDialog.admin?.name}" from admin to regular user?
            This will remove their admin privileges.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoteDialog({ open: false, admin: null })}>
            Cancel
          </Button>
          <Button onClick={handleDemoteAdmin} color="warning" variant="contained">
            Demote
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;