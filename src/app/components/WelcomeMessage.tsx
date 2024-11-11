'use client';

import { useSidebarPosition } from '../hooks/useSidebarPosition';
import SuggestionCards from './SuggestionCards';

interface WelcomeMessageProps {
  isSidebarOpen: boolean;
  isProfileSidebarOpen: boolean;
  isGraphViewOpen: boolean;
  onSuggestionClick: (text: string) => void;
}

export default function WelcomeMessage({ 
  isSidebarOpen, 
  isProfileSidebarOpen,
  isGraphViewOpen,
  onSuggestionClick
}: WelcomeMessageProps) {
  const { getPositionClasses } = useSidebarPosition(isSidebarOpen, isProfileSidebarOpen, isGraphViewOpen);

  return (
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-primary mb-4">You're not alone</h2>
      <p className="text-gray-600 text-lg">Share your thoughts and feelings, I'm here to listen and help.</p>
    </div>
  );
}
