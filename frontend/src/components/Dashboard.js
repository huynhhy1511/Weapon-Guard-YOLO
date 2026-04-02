import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  CircularProgress, Divider
} from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import api from '../services/api';

// Icons
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';

/**
 * Dashboard – phong cách Analytics / Product (SÁNG – GỌN – DỄ NHÌN)
 * - Không SOC, không dark, không quá màu mè
 * - Phù hợp báo cáo, demo, giảng viên xem
 * - Giữ nguyên toàn bộ API & logic
 */

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/stats/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box height="80vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Charts
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f8fafc' } }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f8fafc' } }
    },
    cutout: '70%',
    borderColor: 'transparent'
  };

  const lineData = {
    labels: data?.hourly_trend?.labels || [],
    datasets: [{
      label: 'Số lần phát hiện',
      data: data?.hourly_trend?.data || [],
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      tension: 0.4,
      fill: true,
      borderWidth: 3,
      pointBackgroundColor: '#0ea5e9',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#0ea5e9',
    }]
  };

  const doughnutData = {
    labels: data?.weapon_distribution?.labels || [],
    datasets: [{
      data: data?.weapon_distribution?.data || [],
      backgroundColor: ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const MetricCard = ({ title, value, icon, gradient }) => (
    <Card sx={{ 
      borderRadius: 4, 
      background: 'rgba(30, 41, 59, 0.7)',
      transition: 'transform 0.3s ease-in-out',
      '&:hover': { transform: 'translateY(-5px)' }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc' }}>{value}</Typography>
          </Box>
          <Box sx={{ 
            background: gradient || 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
            borderRadius: '12px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.39)'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', pb: 5 }}>

      {/* Header */}
      <Box mb={5} mt={2}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Dashboard System
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Tổng quan dữ liệu và hệ thống phân tích thời gian thực
        </Typography>
      </Box>

      {/* Metrics */}
      <Grid container spacing={4} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Camera hoạt động" value={data?.summary?.total_cameras || 0}
            icon={<VideocamOutlinedIcon />} gradient="linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Cảnh báo hôm nay" value={data?.summary?.alerts_today || 0}
            icon={<ReportProblemOutlinedIcon />} gradient="linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Trạng thái hệ thống" value={data?.summary?.system_status || 'Stable'}
            icon={<ShieldOutlinedIcon />} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Cập nhật lúc"
            value={new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            icon={<ScheduleOutlinedIcon />} gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} mb={5}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 4, background: 'rgba(30, 41, 59, 0.7)', p: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <TrendingUpIcon sx={{ color: '#0ea5e9' }} />
                <Typography variant="h6" fontWeight={700} color="#f8fafc">Xu hướng phát hiện (24 giờ)</Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
              <Box height={340}>
                <Line data={lineData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, background: 'rgba(30, 41, 59, 0.7)', p: 1, height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <DonutLargeOutlinedIcon sx={{ color: '#f43f5e' }} />
                <Typography variant="h6" fontWeight={700} color="#f8fafc">Phân loại đối tượng</Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
              <Box height={340} display="flex" justifyContent="center" alignItems="center">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <Card sx={{ borderRadius: 4, background: 'rgba(30, 41, 59, 0.7)', p: 1 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1.5} mb={3}>
            <ListAltOutlinedIcon sx={{ color: '#10b981' }} />
            <Typography variant="h6" fontWeight={700} color="#f8fafc">Danh sách cảnh báo gần đây</Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#94a3b8' }}>Thời gian</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>Camera</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>Đối tượng</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>Độ tin cậy</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.recent_alerts?.length > 0 ? data.recent_alerts.map(alert => (
                  <TableRow key={alert.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ color: '#f8fafc' }}>{new Date(alert.timestamp).toLocaleString('vi-VN')}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', color: '#38bdf8' }}>CAM-{alert.camera_id}</TableCell>
                    <TableCell>
                      <Chip label={alert.weapon_type.toUpperCase()} size="small"
                        sx={{ background: alert.weapon_type === 'gun' || alert.weapon_type === 'pistol' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: alert.weapon_type === 'gun' || alert.weapon_type === 'pistol' ? '#f43f5e' : '#f59e0b', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc' }}>{(alert.confidence * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Typography color="error" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                        Cảnh báo
                      </Typography>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#94a3b8' }}>Không có cảnh báo nào gần đây</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
