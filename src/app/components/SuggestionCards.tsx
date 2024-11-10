"use client";

import { useEffect, useState } from 'react';

interface Suggestion {
  id: string;
  text: string;
  icon: string;
}

interface SuggestionCardsProps {
  onSuggestionClick: (text: string) => void;
}

export default function SuggestionCards({ onSuggestionClick }: SuggestionCardsProps) {
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

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 px-4">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => {
              onSuggestionClick(suggestion.text);
              // Simulate form submission
              const formEvent = new Event('submit', { bubbles: true });
              document.querySelector('form')?.dispatchEvent(formEvent);
            }}
            className="feature-card group p-3 flex items-center space-x-3 hover:scale-102 
                       transform transition-all duration-300 cursor-pointer"
          >
            <span className="feature-icon-wrapper text-xl min-w-[2.5rem]">
              {suggestion.icon}
            </span>
            <span className="feature-description text-sm font-medium">
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
