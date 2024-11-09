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
    <div className={`${isOpen ? 'w-96' : 'w-0'} bg-gray-50 border-l border-gray-200 transition-all duration-300 overflow-hidden`}>
      <div className="h-full w-full">
        <GraphView graphData={graphData} />
      </div>
    </div>
  );
}
