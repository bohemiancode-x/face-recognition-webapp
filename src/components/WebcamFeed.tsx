import React, { useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { startWebcam, stopWebcam } from '../features/webcam/webcamSlice';
import { setFaces, clearFaces, FaceInfo } from '../features/face/faceSlice';
import * as faceapi from 'face-api.js';
import FaceInfoPanel from './FaceInfoPanel';

const WebcamFeed: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [captured, setCaptured] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [videoKey, setVideoKey] = React.useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispatch = useDispatch();
  const isActive = useSelector((state: RootState) => state.webcam.isActive);

  // Load face-api models
  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.ageGenderNet.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      if (isMounted) setLoading(false);
    };
    loadModels();
    return () => { isMounted = false; };
  }, []);

  // Start/stop webcam
  useEffect(() => {
    if (isActive && videoRef.current) {
      // Always stop and null before starting a new stream
      if (videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        console.log('WebcamFeed: Previous stream stopped and srcObject nulled');
      }
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            console.log('WebcamFeed: Stream set and play called', stream);
          }
        })
        .catch((err) => {
          console.error('WebcamFeed: Error accessing webcam', err);
        });
    } else if (!isActive && videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isActive, videoKey]);

  // Face detection loop
  // New detection function for captured image
  const detectFacesOnCapture = useCallback(async (imageElement: HTMLImageElement, overlayCanvas: HTMLCanvasElement) => {
    // Wait for image to load (in case it's not)
    await new Promise(resolve => {
      if (imageElement.complete) resolve(true);
      else imageElement.onload = resolve;
    });
    const detections = await faceapi.detectAllFaces(
      imageElement,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptors().withAgeAndGender().withFaceExpressions();

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw overlays and dispatch face data
    const faces: FaceInfo[] = detections.map((det: any, idx: number) => {
      const { age, gender, detection, expressions } = det;
      const box = detection.box;
      // Get dominant emotion
      let emotion: string | undefined = undefined;
      if (expressions) {
        const sorted = Object.entries(expressions).sort((a, b) => (b[1] as number) - (a[1] as number));
        if (sorted.length > 0) emotion = sorted[0][0];
      }
      // Calculate scale and offset for object-contain
      const imgW = imageElement.naturalWidth;
      const imgH = imageElement.naturalHeight;
      const canW = overlayCanvas.width;
      const canH = overlayCanvas.height;
      const scale = Math.min(canW / imgW, canH / imgH);
      const xOffset = (canW - imgW * scale) / 2;
      const yOffset = (canH - imgH * scale) / 2;
      // Scale and offset box
      const drawX = box.x * scale + xOffset;
      const drawY = box.y * scale + yOffset;
      const drawW = box.width * scale;
      const drawH = box.height * scale;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, drawW, drawH);
      ctx.font = '16px sans-serif';
      // Prepare label text
      const label = `Face ${idx + 1} | Age: ${age?.toFixed(0) || '?' } | Gender: ${gender || '?'}` + (emotion ? ` | Emotion: ${emotion}` : '');
      // Text wrapping logic
      const words = label.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
        const { width: testWidth } = ctx.measureText(testLine);
        if (testWidth > drawW && currentLine) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      // Calculate label box
      const lineHeight = 20;
      const labelHeight = lines.length * lineHeight + 8;
      const labelY = drawY + drawH + 6; // 6px gap below box
      // Draw semi-transparent background
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(drawX, labelY, drawW, labelHeight);
      // Draw text (green)
      ctx.fillStyle = '#10b981';
      lines.forEach((line, i) => {
        ctx.fillText(line, drawX + 6, labelY + (i + 1) * lineHeight - 4);
      });
      return {
        id: `${idx}`,
        box: { left: box.x, top: box.y, width: box.width, height: box.height },
        age: age ? Math.round(age) : undefined,
        gender: gender,
        emotion: emotion || undefined,
      };
    });
    dispatch(setFaces(faces));
  }, [dispatch]);

  // Remove the detection interval: detection should only run on capture
  useEffect(() => {
    if (!captured) {
      dispatch(clearFaces());
    }
  }, [captured, dispatch]);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    // Create a temporary canvas to capture the current video frame
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 640;
    tempCanvas.height = 480;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(videoRef.current, 0, 0, 640, 480);
    const image = tempCanvas.toDataURL('image/png');
    setCapturedImage(image);
    setCaptured(true);
  };

  const handleRetake = () => {
    setCaptured(false);
    setCapturedImage(null);
    setUploadedImage(null);
    setVideoKey(k => k + 1);
    dispatch(startWebcam()); // resume webcam feed on retake
  };

  // Handle image upload
  // Listen for upload events from App
  React.useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      const file = customEvent.detail as File;
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setCaptured(false);
        setCapturedImage(null);
        dispatch(clearFaces());
      };
      reader.readAsDataURL(file);
    };
    window.addEventListener('app-image-upload', handler as EventListener);
    return () => window.removeEventListener('app-image-upload', handler as EventListener);
  }, [dispatch]);

  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <div className="relative aspect-[4/3] flex items-center justify-center">


      {/* Live webcam feed and overlays */}
      {!captured && !uploadedImage && (
        <>
          {console.log('WebcamFeed: isActive=', isActive, 'loading=', loading)}
          <video
            key={videoKey}
            ref={videoRef}
            width={640}
            height={480}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            style={{ display: isActive ? 'block' : 'none' }}
            playsInline
          />
          {(loading || !isActive) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-70 rounded-lg z-10">
              <span className="text-white text-lg mb-4">
                {loading ? 'Loading face models...' : 'Webcam is off'}
              </span>
              {!loading && !isActive && (
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition"
                  onClick={() => dispatch(startWebcam())}
                >
                  Start Webcam
                </button>
              )}
            </div>
          )}
          {/* Capture Button */}
          {!loading && isActive && (
            <button
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded shadow z-20 hover:bg-green-700 transition"
              onClick={handleCapture}
            >
              Capture
            </button>
          )}
        </>
      )}
      {/* Uploaded Image Overlay and Overlays Canvas */}
      {uploadedImage && (
        <div className="flex items-center justify-center w-full min-h-[480px] bg-white bg-opacity-95 z-30 transition-all">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl flex flex-col items-center animate-fadeIn">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <CapturedResultOverlay
                image={uploadedImage}
                onRetake={handleRetake}
                detectFacesOnCapture={detectFacesOnCapture}
              />
            </div>
            <div className="flex flex-row gap-4 mt-6">
              <button
                className="bg-yellow-600 text-white px-6 py-2 rounded shadow hover:bg-yellow-700 transition"
                onClick={handleRetake}
              >
                Retake
              </button>
              <a
                href={uploadedImage}
                download={`uploaded-face.png`}
                className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition flex items-center"
              >
                Download
              </a>
            </div>
            <div className="w-full mt-6">
              <FaceInfoPanel />
            </div>
          </div>
        </div>
      )}
      {/* Captured Image Overlay and Overlays Canvas */}
      {captured && capturedImage && (
        <div className="mt-12 flex items-center justify-center w-full min-h-[480px] bg-white bg-opacity-95 z-30 transition-all">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl flex flex-col items-center animate-fadeIn">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <CapturedResultOverlay
                image={capturedImage}
                onRetake={handleRetake}
                detectFacesOnCapture={detectFacesOnCapture}
              />
            </div>
            <div className="flex flex-row gap-4 mt-6">
              <button
                className="bg-yellow-600 text-white px-6 py-2 rounded shadow hover:bg-yellow-700 transition"
                onClick={handleRetake}
              >
                Retake
              </button>
              <a
                href={capturedImage}
                download={`captured-face.png`}
                className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition flex items-center"
              >
                Download
              </a>
            </div>
            <div className="w-full mt-6">
              <FaceInfoPanel />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

// Helper component for showing captured image and overlays
const CapturedResultOverlay: React.FC<{
  image: string;
  onRetake: () => void;
  detectFacesOnCapture: (img: HTMLImageElement, overlay: HTMLCanvasElement) => Promise<void>;
}> = ({ image, onRetake, detectFacesOnCapture }) => {
  const overlayRef = React.useRef<HTMLCanvasElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  React.useEffect(() => {
    const img = imageRef.current;
    const canvas = overlayRef.current;
    if (!img || !canvas) return;

    const runDetection = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) return;
      detectFacesOnCapture(img, canvas);
    };

    if (img.complete && img.naturalWidth !== 0) {
      runDetection();
    } else {
      img.onload = runDetection;
    }

    // Clean up on unmount
    return () => {
      if (img) img.onload = null;
    };
  }, [image, detectFacesOnCapture]);
  return (
    <div className="relative w-[640px] h-[480px] mx-auto">
      <img
        ref={imageRef}
        src={image}
        alt="Captured"
        className="w-full h-full rounded-lg object-contain z-10"
        width={640}
        height={480}
        style={{ display: 'block' }}
      />
      <canvas
        ref={overlayRef}
        width={640}
        height={480}
        className="w-full h-full pointer-events-none z-20"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
};

export default WebcamFeed;
