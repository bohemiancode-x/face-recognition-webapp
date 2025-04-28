import React, { useRef } from 'react'
import { CameraIcon, UploadIcon } from 'lucide-react'
interface ActionButtonsProps {
  webcamActive: boolean
  toggleWebcam: () => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  webcamActive,
  toggleWebcam,
  handleImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <button
        onClick={toggleWebcam}
        className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${webcamActive ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
      >
        <CameraIcon size={20} />
        {webcamActive ? 'Stop Webcam' : 'Start Webcam'}
      </button>
      <button
        onClick={triggerFileUpload}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 transition-all"
      >
        <UploadIcon size={20} />
        Upload Image
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
