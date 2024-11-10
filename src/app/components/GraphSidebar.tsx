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

  useEffect(() => {
    const loadGraphData = async () => {
      if (isOpen) {
        try {
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
          const data = await response.json();
          if (data.graphData) {
            setLocalGraphData(data.graphData);
          }
        } catch (error) {
          console.error('Error loading graph data:', error);
        }
      }
    };

    loadGraphData();
  }, [isOpen]);
  return (
    <div className={`${isOpen ? 'w-[600px]' : 'w-0'} bg-gray-50 border-l border-gray-200 transition-all duration-300 overflow-hidden`}>
      <div className="h-full w-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Relationships</h2>
        </div>
        <div className="flex-1 relative">
          {isOpen && (
            <div className="absolute inset-0 transition-all duration-300 opacity-0 animate-fade-in">
              <div className="w-full h-full overflow-hidden">
                <GraphView graphData={localGraphData} isSidebar={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
