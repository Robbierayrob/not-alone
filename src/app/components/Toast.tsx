import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-primary text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black'
  };

  return (
    <div 
      className={`
        fixed top-4 right-4 z-[100] 
        ${typeStyles[type]} 
        px-4 py-2 
        rounded-lg 
        shadow-lg 
        animate-slide-in
        transition-all 
        duration-300
        flex 
        items-center 
        justify-between
        min-w-[250px]
      `}
    >
      <span>{message}</span>
      <button 
        onClick={onClose} 
        className="ml-4 hover:opacity-75 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
};
