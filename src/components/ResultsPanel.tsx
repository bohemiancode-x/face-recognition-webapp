import React from 'react'
import { UserIcon, SmileIcon, BoxIcon } from 'lucide-react'
interface FaceResult {
  face: number;
  age: number | null;
  gender: string | null;
  emotion: string | null;
  box: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface ResultsPanelProps {
  results: FaceResult[];
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  return (
    <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <UserIcon size={20} className="text-blue-600 dark:text-blue-400" />
        Recognition Results
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((face, idx) => (
          <div key={idx} className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                <UserIcon size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Face ID</p>
                <p className="font-medium">{face.face}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
                <UserIcon size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                <p className="font-medium">{face.age !== null && face.age !== undefined ? `${Math.round(face.age)} years` : '?'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
                <UserIcon size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                <p className="font-medium capitalize">{face.gender ? face.gender : '?'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-md">
                <SmileIcon size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Emotion</p>
                <p className="font-medium capitalize">{face.emotion ? face.emotion : '?'}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <BoxIcon size={18} className="text-gray-500" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Bounding Box
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-500 dark:text-gray-400">X:</span>{' '}
                  {face.box.x.toFixed(2)}
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Y:</span>{' '}
                  {face.box.y.toFixed(2)}
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Width:</span>{' '}
                  {face.box.w.toFixed(2)}
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Height:</span>{' '}
                  {face.box.h.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
