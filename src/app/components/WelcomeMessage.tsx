'use client';

import { useEffect, useState } from 'react';
import { useSidebarPosition } from '../hooks/useSidebarPosition';
import SuggestionCards from './SuggestionCards';
import { auth } from '../firebase/config';

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
  const [firstName, setFirstName] = useState<string>('');
  const { getPositionClasses } = useSidebarPosition(isSidebarOpen, isProfileSidebarOpen, isGraphViewOpen);

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.displayName) {
      const firstNameOnly = user.displayName.split(' ')[0];
      setFirstName(firstNameOnly);
    }
  }, []);

  return (
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-primary mb-4">
        You're NotAlone{firstName ? `, ${firstName}` : ''}
      </h2>
      <p className="text-gray-600 text-lg">Share your thoughts and feelings, I'm here to listen and help.</p>
    </div>
  );
}
