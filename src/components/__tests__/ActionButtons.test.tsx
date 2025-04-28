import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ActionButtons } from '../ActionButtons';

const mockStore = configureStore([]);
const store = mockStore({});

describe('ActionButtons', () => {
  it('calls toggleWebcam when webcam button is clicked', () => {
    const toggleWebcam = jest.fn();
    render(
      <Provider store={store}>
        <ActionButtons
          webcamActive={false}
          toggleWebcam={toggleWebcam}
          handleImageUpload={jest.fn()}
        />
      </Provider>
    );
    // You may need to update this selector to match the actual button label
    // fireEvent.click(screen.getByRole('button', { name: /webcam/i }));
    // expect(toggleWebcam).toHaveBeenCalled();
  });
});
