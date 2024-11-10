"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Suggestion {
  id: string;
  text: string;
  icon: string;
}

interface SuggestionCardsProps {
  onSuggestionClick: (text: string) => void;
  isVisible?: boolean;
  isGraphViewOpen?: boolean;
  isGraphModalOpen?: boolean;
}

export default function SuggestionCards({ 
  onSuggestionClick, 
  isVisible = true,
  isGraphViewOpen = false,
  isGraphModalOpen = false 
}: SuggestionCardsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock suggestions data
  const mockSuggestions = [
    { id: '1', text: 'How can I improve communication?', icon: '💭' },
    { id: '2', text: 'Help me resolve a conflict', icon: '🤝' },
    { id: '3', text: 'Understanding my emotions', icon: '❤️' },
    { id: '4', text: 'Building trust in relationships', icon: '🔒' }
  ];

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 500);
    
    // Commented out API call for future reference
    /*
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/suggestions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { suggestions: fetchedSuggestions, error } = await response.json();
        if (error) {
          throw new Error(error);
        }
        setSuggestions(fetchedSuggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
    */
  }, []);

  if (isLoading) {
    return <div className="flex justify-center space-x-4 mb-6">Loading suggestions...</div>;
  }

  const handleSuggestionClick = (text: string) => {
    onSuggestionClick(text);
  };

  if (!isVisible || isGraphViewOpen || isGraphModalOpen) return null;

  const suggestionContent = (
    <div className="fixed w-full max-w-xl mx-auto bottom-32 left-1/2 transform -translate-x-1/2 z-50">
      <div className="grid grid-cols-2 gap-4 px-4">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={(e) => {
              e.preventDefault();
              handleSuggestionClick(suggestion.text);
            }}
            className="bg-white/50 backdrop-blur-sm border border-primary/20 rounded-xl p-4
                       hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5
                       transition-all duration-200 flex items-center gap-3 group"
          >
            <span className="text-xl opacity-60 group-hover:opacity-100 transition-opacity">
              {suggestion.icon}
            </span>
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors text-left">
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return typeof document !== 'undefined' 
    ? createPortal(suggestionContent, document.body) 
    : null;
}
