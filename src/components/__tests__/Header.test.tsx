import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Header } from '../Header';

const mockStore = configureStore([]);
const store = mockStore({});

describe('Header', () => {
  it('renders and toggles dark mode', () => {
    const toggleDarkMode = jest.fn();
    render(
      <Provider store={store}>
        <Header darkMode={false} toggleDarkMode={toggleDarkMode} />
      </Provider>
    );
    expect(screen.getByText(/Facial Recognition Studio/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(toggleDarkMode).toHaveBeenCalled();
  });
});
