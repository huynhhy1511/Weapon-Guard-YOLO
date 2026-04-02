// src/components/LoginForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 👇 1. Import hook của Redux và action setToken từ file authSlice bạn vừa gửi
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/slices/authSlice'; // Kiểm tra kỹ đường dẫn này nhé!

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // State cho hộp thoại Đăng Ký
  const [openRegister, setOpenRegister] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch(); // 👇 2. Khởi tạo dispatch

  // --- XỬ LÝ ĐĂNG NHẬP ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const res = await axios.post('http://localhost:8000/auth/login', params);
      const token = res.data.access_token;

      // 3. Cập nhật Redux (Quan trọng nhất để hiện Navbar)
      // Gọi hàm setToken mà bạn đã định nghĩa trong authSlice.js
      dispatch(setToken(token));

      console.log("Login Success");
      navigate('/');
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response && err.response.status === 401) {
          setError('Sai tên đăng nhập hoặc mật khẩu!');
      } else {
          setError('Lỗi kết nối server!');
      }
    }
  };

  // --- XỬ LÝ ĐĂNG KÝ (Thêm logic hiển thị form đăng ký mà bạn cần) ---
  const handleRegister = async () => {
    try {
      const payload = {
        username: regUsername,
        password: regPassword,
        email: regEmail,
        role: "staff"
      };
      // Gọi API đăng ký
      await axios.post('http://localhost:8000/auth/register', payload);

      alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      setOpenRegister(false);
      setRegUsername(''); setRegPassword(''); setRegEmail('');
    } catch (err) {
      console.error("Register Error:", err);
      alert("Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.");
    }
  };

  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
      position: 'relative', overflow: 'hidden'
    }} >
      {/* Background decorations */}
      <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(244,63,94,0.08) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%' }} />

      <Paper elevation={24} sx={{
        padding: 5, width: 400,
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.05)',
        zIndex: 1,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="800" align="center" sx={{
            background: 'linear-gradient(to right, #38bdf8, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            WDSS Portal
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>Hệ thống Quản lý Giám sát Vũ khí</Typography>
        </Box>

        {error && <Typography color="error" variant="body2" align="center" sx={{ mb: 2, background: 'rgba(239, 68, 68, 0.1)', py: 1, borderRadius: 1 }}>{error}</Typography>}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Tên đăng nhập" margin="normal" variant="outlined"
            value={username} onChange={(e) => setUsername(e.target.value)}
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            InputProps={{ style: { color: '#f8fafc' }, sx: { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
          />
          <TextField
            fullWidth label="Mật khẩu" type="password" margin="normal" variant="outlined"
            value={password} onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            InputProps={{ style: { color: '#f8fafc' }, sx: { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
          />

          <Button type="submit" fullWidth variant="contained" size="large" sx={{
            mt: 4, mb: 2, py: 1.5,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
            boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.39)',
            fontWeight: 700, fontSize: '1.05rem',
            '&:hover': { background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }
          }}>
            Đăng Nhập
          </Button>
        </form>

        {/* Nút mở Form Đăng Ký */}
        <Button fullWidth variant="text" onClick={() => setOpenRegister(true)} sx={{ color: '#94a3b8', '&:hover': { color: '#38bdf8', background: 'transparent' } }}>
            Chưa có tài khoản? Đăng ký ngay
        </Button>
      </Paper>

      {/* --- DIALOG ĐĂNG KÝ --- */}
      <Dialog open={openRegister} onClose={() => setOpenRegister(false)}
        PaperProps={{
          style: {
            backgroundColor: '#1e293b',
            backgroundImage: 'none',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#f8fafc'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Đăng Ký Tài Khoản</DialogTitle>
        <DialogContent>
            <TextField autoFocus margin="dense" label="Tên đăng nhập" fullWidth variant="outlined"
                value={regUsername} onChange={(e) => setRegUsername(e.target.value)}
                InputLabelProps={{ style: { color: '#94a3b8' } }} InputProps={{ style: { color: '#f8fafc' }, sx: { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, mt: 1 } }}
            />
            <TextField margin="dense" label="Email" type="email" fullWidth variant="outlined"
                value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                InputLabelProps={{ style: { color: '#94a3b8' } }} InputProps={{ style: { color: '#f8fafc' }, sx: { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
            />
            <TextField margin="dense" label="Mật khẩu" type="password" fullWidth variant="outlined"
                value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                InputLabelProps={{ style: { color: '#94a3b8' } }} InputProps={{ style: { color: '#f8fafc' }, sx: { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
            />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenRegister(false)} sx={{ color: '#94a3b8' }}>Hủy</Button>
            <Button onClick={handleRegister} variant="contained" sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', px: 4 }}>Đăng Ký</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginForm;