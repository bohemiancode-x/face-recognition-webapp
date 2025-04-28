import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FaceInfo {
  id: string;
  box: { left: number; top: number; width: number; height: number };

  age?: number;
  gender?: string;
  emotion?: string;
}

interface FaceState {
  faces: FaceInfo[];
}

const initialState: FaceState = {
  faces: [],
};

const faceSlice = createSlice({
  name: 'face',
  initialState,
  reducers: {
    setFaces(state, action: PayloadAction<FaceInfo[]>) {
      state.faces = action.payload;
    },
    clearFaces(state) {
      state.faces = [];
    },
  },
});

export const { setFaces, clearFaces } = faceSlice.actions;
export default faceSlice.reducer;
