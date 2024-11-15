'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelect: (mood: string) => void;
}

export default function MoodModal({ isOpen, onClose, onMoodSelect }: MoodModalProps) {
  const [mounted, setMounted] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      setMounted(false);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">How are you feeling today?</h2>
        <p className="text-center text-gray-600 mb-6">Select the emoji that best matches your current mood</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button 
            className="mood-button bg-green-50 hover:bg-green-100" 
            onClick={() => onMoodSelect('happy')}
            aria-label="Happy"
          >
            <span className="text-4xl mb-2">😊</span>
            <span className="text-green-700">Happy</span>
          </button>
          
          <button 
            className="mood-button bg-yellow-50 hover:bg-yellow-100" 
            onClick={() => onMoodSelect('neutral')}
            aria-label="Neutral"
          >
            <span className="text-4xl mb-2">😐</span>
            <span className="text-yellow-700">Neutral</span>
          </button>
          
          <button 
            className="mood-button bg-red-50 hover:bg-red-100" 
            onClick={() => onMoodSelect('sad')}
            aria-label="Sad"
          >
            <span className="text-4xl mb-2">😢</span>
            <span className="text-red-700">Sad</span>
          </button>

          <button 
            className="mood-button bg-gray-50 hover:bg-gray-100" 
            onClick={() => onMoodSelect('none')}
            aria-label="Clear mood"
          >
            <span className="text-4xl mb-2">❌</span>
            <span className="text-gray-700">Clear</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
