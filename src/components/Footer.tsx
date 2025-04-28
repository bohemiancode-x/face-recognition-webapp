import React from 'react'
import { GithubIcon, CodeIcon } from 'lucide-react'
export const Footer = () => {
  return (
    <footer className="w-full py-6 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Facial Recognition Studio • Powered by face-api
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/bohemiancode-x/face-recognition-webapp"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <GithubIcon size={20} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <CodeIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
