"use client";

import { useEffect, useRef } from 'react';

interface NodeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: any;
}

export default function NodeDetailsModal({ isOpen, onClose, nodeData }: NodeDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !nodeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className="relative w-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out animate-modal-pop overflow-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-300 z-50"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
              nodeData.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
            }`}>
              {nodeData.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{nodeData.name}</h2>
              <p className="text-gray-500">{nodeData.age} years old</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Summary</h3>
              <p className="text-gray-600">{nodeData.summary}</p>
            </div>

            {nodeData.details && (
              <>
                <div>
                  <h3 className="font-medium text-gray-700">Occupation</h3>
                  <p className="text-gray-600">{nodeData.details.occupation}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {nodeData.details.interests.map((interest: string) => (
                      <span key={interest} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Personality</h3>
                  <p className="text-gray-600">{nodeData.details.personality}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Background</h3>
                  <p className="text-gray-600">{nodeData.details.background}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Emotional State</h3>
                  <p className="text-gray-600">{nodeData.details.emotionalState}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
