import webcamReducer, { startWebcam, stopWebcam } from './webcamSlice';

describe('webcamSlice', () => {
  const initialState = { isActive: false };
  it('should return the initial state', () => {
    expect(webcamReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle startWebcam', () => {
    expect(webcamReducer(initialState, startWebcam())).toEqual({ isActive: true });
  });

  it('should handle stopWebcam', () => {
    const state = { isActive: true };
    expect(webcamReducer(state, stopWebcam())).toEqual({ isActive: false });
  });
});
