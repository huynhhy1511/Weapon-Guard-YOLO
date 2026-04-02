import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.token);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="sticky" sx={{ 
      background: 'rgba(15, 23, 42, 0.8)', 
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.4)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      color: '#f8fafc'
    }}>
      <Toolbar sx={{ minHeight: '64px', px: { xs: 2, md: 4 } }}>
        <Typography variant="h6" component={Link} to="/" sx={{ 
          flexGrow: 1, 
          textDecoration: 'none', 
          fontWeight: 800,
          background: 'linear-gradient(to right, #38bdf8, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '1px'
        }}>
          WDSS Portal
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Button sx={{ color: '#94a3b8', fontWeight: 600, '&:hover': { color: '#f8fafc', background: 'rgba(255,255,255,0.05)' } }} component={Link} to="/multi-view">Live View</Button>
              <Button sx={{ color: '#94a3b8', fontWeight: 600, '&:hover': { color: '#f8fafc', background: 'rgba(255,255,255,0.05)' } }} component={Link} to="/history">Lịch sử</Button>
              <Button sx={{ color: '#94a3b8', fontWeight: 600, '&:hover': { color: '#f8fafc', background: 'rgba(255,255,255,0.05)' } }} component={Link} to="/admin">Hệ thống</Button>
              <Button onClick={handleLogout} sx={{ 
                ml: 2, 
                color: '#ef4444', 
                fontWeight: 600,
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '&:hover': { background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }
              }}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button variant="contained" component={Link} to="/login" sx={{ 
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
              fontWeight: 600,
              boxShadow: '0 4px 10px 0 rgba(14, 165, 233, 0.3)'
            }}>
              Đăng nhập
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;