// src/components/common/VideoPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

const VideoPlayer = ({ cameraId }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const ws = useRef(null);

  useEffect(() => {
    setLoading(true);
    // Hàm kết nối để có thể gọi lại khi mất mạng
    const connect = () => {
      const socketUrl = `ws://localhost:8000/cameras/stream/${cameraId}`;
      ws.current = new WebSocket(socketUrl);

      ws.current.onopen = () => {
        console.log(`Connected to camera ${cameraId}`);
        setError(false);
        setLoading(false);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.frame) {
            setImageSrc(`data:image/jpeg;base64,${data.frame}`);
            setLoading(false);
          }
        } catch (e) {
          console.error("Error parsing video frame");
        }
      };

      ws.current.onclose = () => {
        console.log("Stream closed. Retrying in 1s...");
        // Tự động kết nối lại sau 1 giây
        setTimeout(() => {
            if (ws.current?.readyState === WebSocket.CLOSED) {
                connect();
            }
        }, 1000);
      };

      ws.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError(true);
        setLoading(false);
        ws.current.close();
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null; // Hủy sự kiện để không reconnect khi unmount
        ws.current.close();
      }
    };
  }, [cameraId]);

  return (
    <Box sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#000', // Nền đen để làm viền cho video
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
    }}>
      {/* 1. Trường hợp đang tải hoặc mất kết nối */}
      {(loading || error) && !imageSrc && (
        <Box textAlign="center" color="grey.500">
          {loading ? (
             <CircularProgress size={30} sx={{color: 'grey.500'}} />
          ) : (
             <>
               <VideocamOffIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
               <Typography variant="caption" display="block">Mất tín hiệu</Typography>
               <Typography variant="caption" sx={{opacity: 0.5}}>CAM-{cameraId}</Typography>
             </>
          )}
        </Box>
      )}

      {/* 2. Trường hợp Video có tín hiệu */}
      {imageSrc && (
        <img
            src={imageSrc}
            alt={`Cam ${cameraId}`}
            style={{
                width: '100%',
                height: '100%',
                // 👇 QUAN TRỌNG NHẤT: Sửa fill thành contain
                objectFit: 'contain'
            }}
        />
      )}
    </Box>
  );
};

export default VideoPlayer;