import faceReducer, { setFaces, clearFaces } from './faceSlice';

describe('faceSlice', () => {
  const initialState = { faces: [] };
  it('should return the initial state', () => {
    expect(faceReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle setFaces', () => {
    const faces = [
      { id: '1', box: { left: 10, top: 20, width: 30, height: 40 }, age: 25, gender: 'male', emotion: 'happy' },
    ];
    expect(faceReducer(initialState, setFaces(faces))).toEqual({ faces });
  });

  it('should handle clearFaces', () => {
    const state = { faces: [{ id: '1', box: { left: 10, top: 20, width: 30, height: 40 } }] };
    expect(faceReducer(state, clearFaces())).toEqual(initialState);
  });
});
