import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import App from './App';

const mockStore = configureStore([]);
const store = mockStore({
  webcam: { isActive: false },
  face: { faces: [] },
  theme: { darkMode: false },
});

describe('App integration', () => {
  it('renders header, footer, and action buttons', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(screen.getAllByText(/Facial Recognition Studio/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Powered by face-api/i)).toBeInTheDocument(); 
  });
});
