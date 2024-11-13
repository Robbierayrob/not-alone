"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface NodeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    id: string;
    name: string;
    gender?: string;
    age?: number;
    summary?: string;
    details?: {
      occupation?: string;
      interests?: string[];
      personality?: string;
      background?: string;
      emotionalState?: string;
    };
  };
}

export default function NodeDetailsModal({ isOpen, onClose, nodeData }: NodeDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
  }, [isOpen, onClose]);

  if (!isOpen || !nodeData) return null;

  if (!isOpen || !nodeData) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center isolate">
          <div 
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          />
          <div
            ref={modalRef}
            className="relative w-[90%] max-w-[400px] max-h-[80vh] bg-white rounded-2xl shadow-2xl custom-scrollbar overflow-y-auto transform transition-all duration-300 ease-in-out animate-modal-pop"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-300 z-50"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-lg transition-transform duration-300 ${
                    nodeData.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}
                >
                  {nodeData.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{nodeData.name}</h2>
                  <p className="text-gray-600">{nodeData.age} years old</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
                  <p className="text-gray-600 leading-relaxed">{nodeData.summary}</p>
                </div>

                {nodeData.details && (
                  <div className="space-y-3">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-800 mb-2">Occupation</h3>
                      <p className="text-gray-600">{nodeData.details.occupation}</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-800 mb-3">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {nodeData.details.interests.map((interest: string) => (
                          <span
                            key={interest}
                            className="px-3 py-1.5 bg-white shadow-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 transition-transform duration-200 hover:scale-105"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Personality</h3>
                      <p className="text-gray-600">{nodeData.details.personality}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Background</h3>
                      <p className="text-gray-600">{nodeData.details.background}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Emotional State</h3>
                      <p className="text-gray-600">{nodeData.details.emotionalState}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  );

  // Create portal to render modal at document body level
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body) 
    : null;
}
