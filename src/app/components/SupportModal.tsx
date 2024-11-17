"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-modal-pop"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Get Support</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Quick Help</h3>
            <p className="text-sm text-gray-600">
              Get instant answers to common questions and learn how to make the most of your experience.
            </p>
          </div>

          <div className="space-y-4">
            <a 
              href="https://discord.gg/7f2eJNPaVd"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
            >
              <span className="text-gray-700">Contact Support</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <a
              href="https://sdgs.un.org/goals/goal5"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
            >
              <span className="text-gray-700">UN SDG Goal 5</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
