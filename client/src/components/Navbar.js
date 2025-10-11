import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Chip,
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 4
            }}
          >
            🎯 InterviewAce
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              variant={isActive('/dashboard') ? 'contained' : 'text'}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              startIcon={<SearchIcon />}
              onClick={() => navigate('/find-match')}
              variant={isActive('/find-match') ? 'contained' : 'text'}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: isActive('/find-match') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Find Match
            </Button>
            <Button 
              color="inherit" 
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/history')}
              variant={isActive('/history') ? 'contained' : 'text'}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: isActive('/history') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              History
            </Button>
            {user?.role === 'admin' && (
              <Button 
                color="inherit" 
                startIcon={<AdminIcon />}
                onClick={() => navigate('/admin')}
                variant={isActive('/admin') ? 'contained' : 'text'}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  bgcolor: isActive('/admin') ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Admin
              </Button>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user?.isPremium ? (
            <Chip 
              label="Premium" 
              size="small" 
              sx={{ 
                bgcolor: 'gold', 
                color: 'black',
                fontWeight: 'bold'
              }} 
            />
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/premium')}
              sx={{
                bgcolor: 'gold',
                color: 'black',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#ffd700',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Upgrade to Premium
            </Button>
          )}
          
          <IconButton color="inherit">
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {user?.domain}
              </Typography>
            </Box>
            <Avatar 
              src={user?.profilePicture ? `http://localhost:5001${user.profilePicture}` : ''}
              onClick={handleMenu}
              sx={{ 
                cursor: 'pointer', 
                bgcolor: 'secondary.main',
                border: '2px solid rgba(255,255,255,0.3)',
                width: 45,
                height: 45
              }}
            >
              {!user?.profilePicture && user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Typography variant="subtitle2">{user?.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
              <PersonIcon sx={{ mr: 2 }} />
              Profile Settings
            </MenuItem>
            <MenuItem onClick={() => { navigate('/account-settings'); handleClose(); }}>
              <SecurityIcon sx={{ mr: 2 }} />
              Account Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;