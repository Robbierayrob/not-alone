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
    <div className="welcome-message-container">
      <div className={`welcome-message ${getPositionClasses()}`}>
        <h2 className="welcome-title">You're not alone</h2>
        <p className="welcome-subtitle">Share your thoughts and feelings, I'm here to listen and help.</p>
        <div className="mt-8">
          <SuggestionCards 
            isVisible={true}
            isSidebarOpen={isSidebarOpen}
            isProfileSidebarOpen={isProfileSidebarOpen}
            isGraphViewOpen={isGraphViewOpen}
            onSuggestionClick={onSuggestionClick}
          />
        </div>
      </div>
    </div>
  );
}
