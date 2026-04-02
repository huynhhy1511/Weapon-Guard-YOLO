import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cameraReducer from './slices/cameraSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    cameras: cameraReducer,
  },
});