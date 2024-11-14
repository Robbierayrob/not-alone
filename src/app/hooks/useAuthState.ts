'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

// Comprehensive authentication state management hook
export function useAuthState() {
  // State variables for tracking authentication
  const [user, setUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Session timeout configuration (24 hours)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

  // Centralized authentication state change handler
  const handleAuthStateChange = useCallback(async (user: User | null) => {
    console.log('🔐 Auth State Changed:', user ? user.uid : 'No User');
    
    if (user) {
      try {
        // Get and set user token
        const token = await user.getIdToken();
        setUserToken(token);

        // Check session timeout
        const lastActivity = localStorage.getItem('lastActivityTime');
        const currentTime = Date.now();

        if (lastActivity && (currentTime - parseInt(lastActivity)) > SESSION_TIMEOUT) {
          console.warn('🕒 Session Expired, logging out');
          await auth.signOut();
          setUser(null);
          setIsAuthModalOpen(true);
          localStorage.removeItem('lastActivityTime');
        } else {
          // Update last activity time
          localStorage.setItem('lastActivityTime', currentTime.toString());
          setUser(user);
          setIsAuthModalOpen(false);
        }
      } catch (error) {
        console.error('🚨 Authentication Error:', error);
        setUser(null);
        setIsAuthModalOpen(true);
      }
    } else {
      setUser(null);
      setIsAuthModalOpen(true);
    }

    // Always set loading to false after processing
    setIsLoading(false);
  }, []);

  // Setup authentication listener on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    // Activity tracking event listeners
    const updateActivity = () => {
      if (auth.currentUser) {
        localStorage.setItem('lastActivityTime', Date.now().toString());
      }
    };

    // Add event listeners for user activity tracking
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);

    // Cleanup function
    return () => {
      unsubscribe();
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [handleAuthStateChange]);

  return {
    user,
    userToken,
    isAuthModalOpen,
    isLoading,
    setIsAuthModalOpen
  };
}
