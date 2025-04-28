import themeReducer, { toggleDarkMode } from './themeSlice';

describe('themeSlice', () => {
  const initialState = { darkMode: false };
  it('should return the initial state', () => {
    expect(themeReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle toggleDarkMode', () => {
    expect(themeReducer(initialState, toggleDarkMode())).toEqual({ darkMode: true });
    expect(themeReducer({ darkMode: true }, toggleDarkMode())).toEqual({ darkMode: false });
  });
});
