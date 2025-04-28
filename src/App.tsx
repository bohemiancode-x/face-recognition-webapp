import React from 'react';
import WebcamFeed from './components/WebcamFeed';
import FaceInfoPanel from './components/FaceInfoPanel';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './app/store';
import { startWebcam, stopWebcam } from './features/webcam/webcamSlice';
import './App.css';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const isActive = useSelector((state: RootState) => state.webcam.isActive);

  // Move handleImageUpload here
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }
    // Use a custom event to notify WebcamFeed
    const event = new CustomEvent('app-image-upload', { detail: file });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Webcam Face Recognition App</h1>
      <div className="mb-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded text-white font-semibold ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          onClick={() => dispatch(isActive ? stopWebcam() : startWebcam())}
        >
          {isActive ? 'Stop Webcam' : 'Start Webcam'}
        </button>
        <label className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition cursor-pointer ml-4">
          Upload Image
          <input
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
      <WebcamFeed />
      {/* <FaceInfoPanel /> */}
      <footer className="mt-10 text-gray-400 text-xs">Powered by React, Redux, face-api.js, and TailwindCSS</footer>
    </div>
  );
};

export default App;
