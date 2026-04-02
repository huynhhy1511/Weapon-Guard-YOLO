// src/components/AlertPopup.js
import React, { useEffect } from 'react'; // <--- Thêm useEffect
import { Modal, Box, Typography } from '@mui/material';

const AlertPopup = ({ open, onClose, alertData }) => {
  useEffect(() => {
    if (open) {
      // Đảm bảo file âm thanh tồn tại trong folder public/assets/sounds/
      try {
        const audio = new Audio('/assets/sounds/alert.mp4'); // Đổi sang mp3 cho nhẹ
        audio.play().catch(e => console.log("Audio play error:", e));
      } catch (e) {
        console.error(e);
      }
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 24
      }}>
        <Typography variant="h6" color="error">⚠️ CẢNH BÁO PHÁT HIỆN VŨ KHÍ</Typography>
        <Typography sx={{ mt: 2 }}>Loại: {alertData?.weapon_type}</Typography>
        <Typography>Camera ID: {alertData?.camera_id}</Typography>
        {alertData?.image_path && (
            <img
                src={`http://localhost:8000/${alertData.image_path}`}
                alt="Alert"
                style={{ width: '100%', marginTop: '10px', maxHeight: '300px', objectFit: 'contain' }}
            />
        )}
      </Box>
    </Modal>
  );
};

export default AlertPopup;