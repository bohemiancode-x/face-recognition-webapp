import React, { useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setFaces, clearFaces, FaceInfo } from '../features/face/faceSlice';
import * as faceapi from 'face-api.js';
import { RefreshCwIcon, DownloadIcon } from 'lucide-react';

interface WebcamViewProps {
  webcamActive: boolean;
  currentImage: string | null;
  onCapture: (img: string) => void;
  onRetake: () => void;
}

export const WebcamView: React.FC<WebcamViewProps> = ({
  webcamActive,
  currentImage,
  onCapture,
  onRetake,
}) => {
  const dispatch = useDispatch();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.ageGenderNet.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    };
    loadModels();
  }, []);

  // Webcam stream
  useEffect(() => {
    const localVideoRef = videoRef.current;
    if (webcamActive && localVideoRef) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (localVideoRef) {
            localVideoRef.srcObject = stream;
            localVideoRef.play();
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam', err);
        });
    } else if (!webcamActive && localVideoRef) {
      const stream = localVideoRef.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        localVideoRef.srcObject = null;
      }
    }
    return () => {
      if (localVideoRef && localVideoRef.srcObject) {
        const stream = localVideoRef.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        localVideoRef.srcObject = null;
      }
    };
  }, [webcamActive]);

  // No real-time face detection on webcam feed! Only detect after capture.


  // Face detection for uploaded image
  const runDetectionOnImage = useCallback(async () => {
    if (!imageRef.current || !overlayRef.current || !currentImage) return;
    const img = imageRef.current;
    const canvas = overlayRef.current;
    await new Promise(resolve => {
      if (img.complete) resolve(true);
      else img.onload = resolve;
    });
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender()
      .withFaceExpressions();
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    if (detections.length > 0) {
      // Calculate scaling and offset for object-contain
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const displayWidth = imgWidth * scale;
      const displayHeight = imgHeight * scale;
      const offsetX = (canvasWidth - displayWidth) / 2;
      const offsetY = (canvasHeight - displayHeight) / 2;

      const faces: FaceInfo[] = detections.map((det: any, idx: number) => {
        const { age, gender, detection, expressions } = det;
        const box = detection.box;
        let emotion: string | undefined = undefined;
        if (expressions) {
          const sorted = Object.entries(expressions).sort((a, b) => (b[1] as number) - (a[1] as number));
          if (sorted.length > 0) emotion = sorted[0][0];
        }
        return {
          id: `${idx}`,
          box: { left: box.x, top: box.y, width: box.width, height: box.height },
          age,
          gender,
          emotion,
        };
      });
      dispatch(setFaces(faces));
      detections.forEach((det: any, idx: number) => {
        const box = det.detection.box;
        // Scale and offset the box for correct overlay
        const drawX = box.x * scale + offsetX;
        const drawY = box.y * scale + offsetY;
        const drawW = box.width * scale;
        const drawH = box.height * scale;
        ctx!.strokeStyle = '#10b981';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(drawX, drawY, drawW, drawH);
        ctx!.font = '16px sans-serif';
        ctx!.fillStyle = '#10b981';
        ctx!.fillText(`Face ${idx + 1}`, drawX, drawY + drawH + 20);
      });
    } else {
      dispatch(clearFaces());
    }
  }, [currentImage, dispatch]);

  useEffect(() => {
    if (currentImage) {
      runDetectionOnImage();
    }
  }, [currentImage, runDetectionOnImage]);

  // Download handler
  const handleDownload = () => {
    if (!overlayRef.current || !imageRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = overlayRef.current.width;
    canvas.height = overlayRef.current.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(overlayRef.current, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'face-detection.png';
    link.click();
  };

  return (
    <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {webcamActive && !currentImage ? (
        <div className="w-full h-full relative flex flex-col items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-contain rounded-lg" width={640} height={480} />
          <button
            className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center gap-2 shadow-lg"
            onClick={() => {
              if (!videoRef.current) return;
              const video = videoRef.current;
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = video.videoWidth || 640;
              tempCanvas.height = video.videoHeight || 480;
              const ctx = tempCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
                const dataUrl = tempCanvas.toDataURL('image/png');
                onCapture(dataUrl);
              }
            }}
          >
            Capture
          </button>
        </div>
      ) : currentImage ? (
        <div className="relative w-full h-full">
          <img
            ref={imageRef}
            src={currentImage}
            alt="Uploaded"
            className="w-full h-full object-contain rounded-lg"
            width={640}
            height={480}
          />
          <canvas
            ref={overlayRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            width={640}
            height={480}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md flex items-center gap-1"
              title="Retake"
              onClick={onRetake}
            >
              <RefreshCwIcon size={18} />
              <span className="hidden sm:inline">Retake</span>
            </button>
            <button
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1"
              title="Download"
              onClick={handleDownload}
            >
              <DownloadIcon size={18} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No image or webcam feed available
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Click "Start Webcam" or "Upload Image" to begin
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
