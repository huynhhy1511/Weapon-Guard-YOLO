// src/components/CameraGrid.js
import React, { useState } from 'react';
import { Box, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import VideoPlayer from './common/VideoPlayer';

const CameraGrid = ({ cameras }) => {
  const [layout, setLayout] = useState('2x2');

  // Tính toán % chiều rộng
  const getLayoutConfig = () => {
    switch (layout) {
      case '1x1': return { width: '100%', height: '85vh' };
      case '2x2': return { width: '50%', height: '42vh' };
      case '3x3': return { width: '33.33%', height: '28vh' };
      case '4x4': return { width: '25%', height: '21vh' };
      default: return { width: '50%', height: '42vh' };
    }
  };

  const { width, height } = getLayoutConfig();

  const handleLayoutChange = (event, newLayout) => {
    if (newLayout !== null) setLayout(newLayout);
  };

  return (
    <Box sx={{
        flexGrow: 1,
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        overflowX: 'hidden',
        bgcolor: '#0f172a', /* Dark slate background instead of pure black */
        minHeight: '100vh',
        pb: 5
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
        <ToggleButtonGroup
          value={layout}
          exclusive
          onChange={handleLayoutChange}
          sx={{ 
            bgcolor: 'rgba(15, 23, 42, 0.6)', 
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            '& .MuiToggleButton-root': {
              color: '#94a3b8',
              border: 'none',
              px: 3,
              '&.Mui-selected': {
                bgcolor: 'rgba(14, 165, 233, 0.2)',
                color: '#38bdf8',
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)'
              }
            }
          }}
        >
          <ToggleButton value="1x1"><CropSquareIcon /></ToggleButton>
          <ToggleButton value="2x2"><ViewModuleIcon /></ToggleButton>
          <ToggleButton value="3x3"><ViewComfyIcon /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Dùng Flexbox thay vì Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', px: 2, gap: 1, justifyContent: 'center' }}>
        {cameras.slice(0, parseInt(layout[0]) * parseInt(layout[0])).map((cam) => (
          <Box key={cam.id}
              sx={{
                  width: `calc(${width} - 8px)`,
                  height: `calc(${height} - 8px)`,
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.01)',
                    zIndex: 10
                  }
              }}
          >
            <Paper elevation={12} sx={{ 
              height: '100%', width: '100%', 
              bgcolor: '#000', 
              borderRadius: 3, 
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <VideoPlayer cameraId={cam.id} />
            </Paper>
          </Box>
        ))}
        {cameras.length === 0 && (
            <div style={{ color: '#94a3b8', padding: 40, textAlign: 'center', width: '100%', fontSize: '1.2rem', fontWeight: 500 }}>
                HỆ THỐNG HIỆN CHƯA CÓ CAMERA NÀO ĐƯỢC KẾT NỐI
            </div>
        )}
      </Box>
    </Box>
  );
};

export default CameraGrid;