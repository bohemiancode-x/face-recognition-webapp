import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

const FaceInfoPanel: React.FC = () => {
  const faces = useSelector((state: RootState) => state.face.faces);

  if (!faces.length) {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded shadow text-gray-600 text-center">
        No faces detected.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-4">
      {faces.map((face, idx) => (
        <div key={face.id} className="p-4 bg-white rounded shadow border border-green-200">
          <div className="font-semibold text-green-700">Face {idx + 1}</div>
          <div>Age: <span className="font-medium">{face.age ?? '?'}</span></div>
          <div>Gender: <span className="font-medium">{face.gender ?? '?'}</span></div>
          <div>Emotion: <span className="font-medium">{face.emotion ? face.emotion.charAt(0).toUpperCase() + face.emotion.slice(1) : '?'}</span></div>
          <div>Box: <span className="text-xs">{`x: ${face.box.left}, y: ${face.box.top}, w: ${face.box.width}, h: ${face.box.height}`}</span></div>
        </div>
      ))}
    </div>
  );
};

export default FaceInfoPanel;
