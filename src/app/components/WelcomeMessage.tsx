'use client';

interface WelcomeMessageProps {
  isSidebarOpen: boolean;
  isProfileSidebarOpen: boolean;
}

export default function WelcomeMessage({ isSidebarOpen, isProfileSidebarOpen }: WelcomeMessageProps) {
  return (
    <div className="welcome-message-container">
      <div className={`welcome-message ${
        isSidebarOpen && isProfileSidebarOpen ? 'ml-[266px]' : 
        isSidebarOpen || isProfileSidebarOpen ? 'ml-[134px]' : 
        'ml-0'
      }`}>
        <h2 className="welcome-title">You're not alone</h2>
        <p className="welcome-subtitle">Share your thoughts and feelings, I'm here to listen and help.</p>
      </div>
    </div>
  );
}
