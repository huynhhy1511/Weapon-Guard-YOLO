import React, { useEffect, useState } from 'react';
import CameraGrid from '../components/CameraGrid';
import api from '../services/api';

const MultiViewPage = () => {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    api.get('/cameras').then(res => setCameras(res.data));
  }, []);

  return <CameraGrid cameras={cameras} />;
};

export default MultiViewPage;