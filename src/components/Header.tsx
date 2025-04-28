import React from 'react'
import { SunIcon, MoonIcon, ScanFaceIcon } from 'lucide-react'
interface HeaderProps {
  darkMode: boolean
  toggleDarkMode: () => void
}
export const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="w-full py-6 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <ScanFaceIcon size={32} className="text-blue-600" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Facial Recognition Studio
            </h1>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            >
              {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
