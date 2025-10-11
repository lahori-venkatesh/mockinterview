import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Warning,
  Delete,
  Visibility
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const ReportedUsers = () => {
  const [reportedUsers, setReportedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewDialog, setViewDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  useEffect(() => {
    fetchReportedUsers();
  }, []);

  const fetchReportedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/reports`);
      setReportedUsers(response.data.reportedUsers);
    } catch (error) {
      setError('Failed to fetch reported users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${deleteDialog.user._id}`);
      setDeleteDialog({ open: false, user: null });
      fetchReportedUsers();
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getReportSeverity = (reportsCount) => {
    if (reportsCount >= 5) return 'error';
    if (reportsCount >= 3) return 'warning';
    return 'info';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reported Users
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reportedUsers.length === 0 ? (
        <Alert severity="info">
          No reported users found.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Reports Count</TableCell>
                <TableCell>Latest Report</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportedUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user._id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<Warning />}
                      label={`${user.reports.length} reports`}
                      color={getReportSeverity(user.reports.length)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.reports.length > 0 && (
                      <Box>
                        <Typography variant="body2">
                          {user.reports[user.reports.length - 1].reason}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(user.reports[user.reports.length - 1].reportedAt)}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      startIcon={<Visibility />}
                      onClick={() => setViewDialog({ open: true, user })}
                      sx={{ mr: 1 }}
                    >
                      View Reports
                    </Button>
                    <Button
                      startIcon={<Delete />}
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, user })}
                    >
                      Delete User
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Reports Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, user: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reports for {viewDialog.user?.name}
        </DialogTitle>
        <DialogContent>
          {viewDialog.user?.reports && (
            <List>
              {viewDialog.user.reports.map((report, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={report.reason}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {report.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Reported on: {formatDate(report.reportedAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < viewDialog.user.reports.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, user: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{deleteDialog.user?.name}"?
            This user has {deleteDialog.user?.reports?.length} reports against them.
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportedUsers;