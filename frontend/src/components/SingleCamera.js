import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import VideoPlayer from './common/VideoPlayer';
import api from '../services/api';

const SingleCamera = () => {
  const { cameraId } = useParams();
  const [camera, setCamera] = useState(null);

  useEffect(() => {
    api.get(`/cameras/${cameraId}`).then(res => setCamera(res.data));
  }, [cameraId]);

  return (
    <Box>
      <Typography variant="h5">Camera: {camera?.name}</Typography>
      <VideoPlayer cameraId={cameraId} />
      <Typography>Status: {camera?.status} | FPS: {camera?.fps}</Typography>
    </Box>
  );
};

export default SingleCamera;