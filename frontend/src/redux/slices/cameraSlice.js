import { createSlice } from '@reduxjs/toolkit';

const cameraSlice = createSlice({
  name: 'cameras',
  initialState: { list: [], alerts: [] },
  reducers: {
    setCameras: (state, action) => {
      state.list = action.payload;
    },
    addAlert: (state, action) => {
      state.alerts.push(action.payload);
    },
  },
});

export const { setCameras, addAlert } = cameraSlice.actions;
export default cameraSlice.reducer;