'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { apiService } from '../services/api';

// Comprehensive graph state management hook
export function useGraphState(user: User | null, userToken: string | null, currentChatId: string) {
  // State for managing graph-related data
  const [graphData, setGraphData] = useState<{
    nodes: Array<{
      id: string;
      name: string;
      val: number;
      gender?: string;
      age?: number;
      summary?: string;
      details?: {
        occupation?: string;
        interests?: string[];
        personality?: string;
        background?: string;
        emotionalState?: string;
      };
    }>;
    links: Array<{
      source: string;
      target: string;
      value: number;
      label?: string;
      details?: {
        relationshipType?: string;
        duration?: string;
        status?: string;
        sentiment?: string;
        interactions?: Array<{
          date?: string;
          type?: string;
          description?: string;
          impact?: string;
        }>;
      };
    }>;
    metadata?: {
      lastUpdated?: string;
      version?: string;
    };
  }>({
    nodes: [],
    links: [],
    metadata: {}
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    if (!user || !userToken) return;

    try {
      console.log('🌐 Fetching Graph Data:', { 
        userId: user.uid, 
        chatId: currentChatId 
      });

      setIsLoading(true);
      setError(null);

      const data = await apiService.fetchGraphData(user.uid, userToken, currentChatId);
      
      // Validate and set graph data
      const validatedData = {
        nodes: Array.isArray(data?.nodes) ? data.nodes : [],
        links: Array.isArray(data?.links) ? data.links : [],
        metadata: data?.metadata || {}
      };

      setGraphData(validatedData);
      
      console.log('✅ Graph Data Loaded:', {
        nodes: validatedData.nodes.length,
        links: validatedData.links.length
      });
    } catch (err) {
      console.error('❌ Graph Data Fetch Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setGraphData({ nodes: [], links: [], metadata: {} });
    } finally {
      setIsLoading(false);
    }
  }, [user, userToken, currentChatId]);

  // Trigger graph data fetch on dependency changes
  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  return {
    graphData,
    setGraphData,
    isLoading,
    error,
    fetchGraphData
  };
}
