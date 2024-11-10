"use client";

import { useEffect, useState } from 'react';
import GraphView from './GraphView';

interface GraphSidebarProps {
  isOpen: boolean;
  graphData: {
    nodes: Array<any>;
    links: Array<any>;
  };
}

export default function GraphSidebar({ isOpen, graphData }: GraphSidebarProps) {
  const [localGraphData, setLocalGraphData] = useState(graphData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGraphData = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          // First try to load from mock-relationships.json
          const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: '',
              chatId: 'default-chat'
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to load graph data');
          }
          
          const data = await response.json();
          if (data.graphData && Object.keys(data.graphData).length > 0) {
            setLocalGraphData(data.graphData);
          } else {
            setLocalGraphData(graphData); // Fallback to props data
          }
        } catch (error) {
          console.error('Error loading graph data:', error);
          setLocalGraphData(graphData); // Fallback to props data
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadGraphData();
  }, [isOpen, graphData]);
  return (
    <div className={`fixed right-0 top-0 h-full ${isOpen ? 'w-[600px]' : 'w-0'} bg-gray-50 border-l border-gray-200 transition-all duration-300 overflow-hidden z-40`}>
      <div className="h-full w-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Relationships</h2>
        </div>
        <div className="flex-1 relative">
          {isOpen && (
            <div className="absolute inset-0 transition-all duration-300 opacity-0 animate-fade-in">
              <div className="w-full h-full overflow-hidden">
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
