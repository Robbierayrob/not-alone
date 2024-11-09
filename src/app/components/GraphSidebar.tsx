"use client";

import GraphView from './GraphView';

interface GraphSidebarProps {
  isOpen: boolean;
  graphData: {
    nodes: Array<any>;
    links: Array<any>;
  };
}

export default function GraphSidebar({ isOpen, graphData }: GraphSidebarProps) {
  return (
    <div className={`${isOpen ? 'w-[600px]' : 'w-0'} bg-gray-50 border-l border-gray-200 transition-all duration-300 overflow-hidden`}>
      <div className="h-full w-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Relationships</h2>
        </div>
        <div className="flex-1 relative">
          {isOpen && (
            <div className="absolute inset-0 transition-opacity duration-300">
              <GraphView graphData={graphData} isSidebar={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
