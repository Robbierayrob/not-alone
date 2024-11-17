'use client';

import { useState, useEffect } from 'react';
import MoodModal from './MoodModal';

export default function CalendarCard() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todaysMood, setTodaysMood] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMoodSelect = async (mood: string) => {
    setTodaysMood(mood);
    setIsModalOpen(false);
    // TODO: Implement Firebase upload here
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="calendar-card z-50 fixed" onClick={() => setIsModalOpen(true)}>
      <div className="calendar-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div className="calendar-info">
        <div className="time">{currentTime}</div>
        <div className="date">{currentDate}</div>
      </div>
      {todaysMood && (
        <div className="selected-mood">
          {todaysMood === 'happy' && '😊'}
          {todaysMood === 'neutral' && '😐'}
          {todaysMood === 'sad' && '😢'}
        </div>
      )}
      <MoodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onMoodSelect={handleMoodSelect}
      />
    </div>
  );
}
