"use client";

import { useEffect, useRef } from 'react';
import GraphModalView from './GraphModalView';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphData: {
    nodes: Array<{
      id: string;
      name: string;
      val: number;
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
    }>;
    links: Array<{
      source: string;
      target: string;
      value: number;
      label?: string;
      details?: {
        relationshipType?: string;
        duration?: string;
        status?: string;
        sentiment?: string;
        interactions?: Array<{
          date?: string;
          type?: string;
          description?: string;
          impact?: string;
        }>;
      };
    }>;
    metadata?: {
      lastUpdated?: string;
      version?: string;
    };
  };
}

export default function GraphModal({ isOpen, onClose, graphData }: GraphModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className="relative w-[90vw] h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out animate-modal-pop"
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
        <div className="w-full h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-primary">My Relationships</h2>
          </div>
          <div className="flex-1">
            {isOpen && (
              <div className="w-full h-full flex items-center justify-center">
                <GraphModalView graphData={graphData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
