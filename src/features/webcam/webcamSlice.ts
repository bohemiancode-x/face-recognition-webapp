import { createSlice } from '@reduxjs/toolkit';

interface WebcamState {
  isActive: boolean;
}

const initialState: WebcamState = {
  isActive: false,
};

const webcamSlice = createSlice({
  name: 'webcam',
  initialState,
  reducers: {
    startWebcam(state) {
      state.isActive = true;
    },
    stopWebcam(state) {
      state.isActive = false;
    },
  },
});

export const { startWebcam, stopWebcam } = webcamSlice.actions;
export default webcamSlice.reducer;
