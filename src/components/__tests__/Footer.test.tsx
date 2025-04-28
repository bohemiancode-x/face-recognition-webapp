import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Footer } from '../Footer';

const mockStore = configureStore([]);
const store = mockStore({});

describe('Footer', () => {
  it('renders footer content', () => {
    render(
      <Provider store={store}>
        <Footer />
      </Provider>
    );
    expect(screen.getByText(/Facial Recognition Studio/i)).toBeInTheDocument();
  });
});
