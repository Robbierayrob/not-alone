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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-4 md:px-8">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSuggestionClick(suggestion.text)}
          className="p-4 bg-white bg-opacity-80 rounded-lg shadow-sm hover:shadow-md 
                     transition-all duration-300 text-left border border-gray-100 
                     hover:border-primary/20 hover:bg-gray-50 group"
        >
          <div className="flex items-start space-x-3">
            <span className="text-gray-400 group-hover:text-primary transition-colors">
              {suggestion.icon}
            </span>
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              {suggestion.text}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
