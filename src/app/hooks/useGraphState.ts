'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { apiService } from '../services/api';

// Enhanced graph state management hook
export function useGraphState(user: User | null, userToken: string | null, currentChatId: string) {
  // Comprehensive graph data type definition
  interface GraphNode {
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
  }

  interface GraphLink {
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
  }

  // State for managing graph-related data with more precise typing
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
    metadata?: {
      lastUpdated?: string;
      version?: string;
      error?: string;
    };
  }>({
    nodes: [],
    links: [],
    metadata: {}
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedChatId, setLastFetchedChatId] = useState<string | null>(null);

  // Enhanced fetch graph data method with more robust error handling
  const fetchGraphData = useCallback(async () => {
    // Prevent unnecessary fetches
    if (!user || !userToken || currentChatId === lastFetchedChatId) return;

    try {
      console.log('🌐 Fetching Graph Data:', { 
        userId: user.uid, 
        chatId: currentChatId 
      });

      setIsLoading(true);
      setError(null);

      const data = await apiService.fetchGraphData(user.uid, userToken, currentChatId);
      
      // More comprehensive data validation
      const validatedData = {
        nodes: Array.isArray(data?.nodes) 
          ? data.nodes.filter(node => node && node.id && node.name)
          : [],
        links: Array.isArray(data?.links) 
          ? data.links.filter(link => link && link.source && link.target)
          : [],
        metadata: {
          ...data?.metadata,
          lastUpdated: new Date().toISOString(),
          error: data?.metadata?.error || null
        }
      };

      // Only update if data has changed
      setGraphData(prevData => {
        const hasChanged = JSON.stringify(prevData) !== JSON.stringify(validatedData);
        return hasChanged ? validatedData : prevData;
      });
      
      // Update last fetched chat ID to prevent redundant fetches
      setLastFetchedChatId(currentChatId);
      
      console.log('✅ Graph Data Loaded:', {
        nodes: validatedData.nodes.length,
        links: validatedData.links.length,
        chatId: currentChatId
      });
    } catch (err) {
      console.error('❌ Graph Data Fetch Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      setError(errorMessage);
      setGraphData(prevData => ({
        ...prevData,
        metadata: {
          ...prevData.metadata,
          error: errorMessage
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [user, userToken, currentChatId, lastFetchedChatId]);

  // Trigger graph data fetch on dependency changes
  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Expose methods to manually refresh or reset graph data
  const refreshGraphData = () => {
    setLastFetchedChatId(null);
    fetchGraphData();
  };

  const resetGraphData = () => {
    setGraphData({ nodes: [], links: [], metadata: {} });
    setLastFetchedChatId(null);
    setError(null);
  };

  return {
    graphData,
    setGraphData,
    isLoading,
    error,
    fetchGraphData,
    refreshGraphData,
    resetGraphData,
    lastFetchedChatId
  };
}
