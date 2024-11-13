"use client";

import { useEffect, useState } from 'react';
import GraphView from './GraphView';

interface GraphSidebarProps {
  isOpen: boolean;
  graphData: {
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
  };
}

export default function GraphSidebar({ isOpen, graphData }: GraphSidebarProps) {
  const [localGraphData, setLocalGraphData] = useState(graphData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLocalGraphData(graphData);
      setIsLoading(false);
    }
  }, [isOpen, graphData]);
  return (
    <div className={`fixed right-0 top-0 h-full ${isOpen ? 'w-[600px]' : 'w-0'} bg-gray-50 border-l border-gray-200 transition-all duration-300 overflow-hidden z-40 flex flex-col`}>
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Relationships</h2>
        </div>
        <div className="flex-1 relative overflow-hidden">
          {isOpen && (
            <div className="absolute inset-0 transition-all duration-300 opacity-0 animate-fade-in">
              <div className="w-full h-full overflow-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <GraphView graphData={localGraphData} isSidebar={true} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
