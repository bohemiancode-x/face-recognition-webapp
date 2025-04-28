import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './app/store';
import { startWebcam, stopWebcam } from './features/webcam/webcamSlice';
import { clearFaces } from './features/face/faceSlice';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ActionButtons } from './components/ActionButtons';
import { WebcamView } from './components/WebcamView';
import { ResultsPanel } from './components/ResultsPanel';
import { toggleDarkMode } from './features/theme/themeSlice';
import './App.css';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const webcamActive = useSelector((state: RootState) => state.webcam.isActive);
  const faces = useSelector((state: RootState) => state.face.faces);
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);

  // Sync Tailwind's dark mode with Redux darkMode boolean
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);





  const toggleWebcam = () => {
    if (webcamActive) {
      dispatch(stopWebcam());
      dispatch(clearFaces());
      setUploadedImage(null);
    } else {
      dispatch(startWebcam());
      dispatch(clearFaces());
      setUploadedImage(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      dispatch(stopWebcam());
      // Face detection will be triggered in WebcamView
    };
    reader.readAsDataURL(file);
  };





  return (
    <div className={`w-full min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header darkMode={darkMode} toggleDarkMode={() => dispatch(toggleDarkMode())} />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
        <ActionButtons
          webcamActive={webcamActive}
          toggleWebcam={toggleWebcam}
          handleImageUpload={handleImageUpload}
        />
        <div className="mt-8 w-full max-w-3xl">
          <WebcamView
            webcamActive={webcamActive}
            currentImage={uploadedImage}
            onCapture={(img: string) => {
              setUploadedImage(img);
              dispatch(stopWebcam());
              dispatch(clearFaces());
            }}
            onRetake={() => {
              setUploadedImage(null);
              dispatch(startWebcam());
              dispatch(clearFaces());
            }}
          />
          {uploadedImage && faces && faces.length > 0 && (
            <ResultsPanel
                results={faces.map((face, idx) => {
                  const box = face.box;
                  return {
                    face: idx + 1,
                    age: face.age ?? null,
                    gender: face.gender ?? null,
                    emotion: face.emotion ?? null,
                    box: {
                      x: box.left,
                      y: box.top,
                      w: box.width,
                      h: box.height,
                    },
                  };
                })}
              />
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
