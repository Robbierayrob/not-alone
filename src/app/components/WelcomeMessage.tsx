'use client';

interface WelcomeMessageProps {
  isSidebarOpen: boolean;
  isProfileSidebarOpen: boolean;
}

export default function WelcomeMessage({ isSidebarOpen, isProfileSidebarOpen }: WelcomeMessageProps) {
  return (
    <div className={`welcome-message transition-all duration-300 ${
      isSidebarOpen && isProfileSidebarOpen ? 'ml-[532px]' : 
      isSidebarOpen ? 'ml-[268px]' : 
      isProfileSidebarOpen ? 'ml-[268px]' : 
      'ml-0'
    }`}>
      <h2 className="welcome-title text-primary">You're not alone</h2>
      <p className="welcome-subtitle">Share your thoughts and feelings, I'm here to listen and help.</p>
    </div>
  );
}
