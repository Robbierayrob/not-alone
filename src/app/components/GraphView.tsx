"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import NodeDetailsModal from './NodeDetailsModal';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
});

interface GraphData {
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
}

interface GraphViewProps {
  graphData: GraphData | { result?: GraphData };
  isModal?: boolean;
  isSidebar?: boolean;
}

export default function GraphView({ graphData, isModal, isSidebar }: GraphViewProps) {
  // Extract graph data, handling nested result structure
  const extractGraphData = (data: GraphData | { result?: GraphData }): GraphData => {
    if (data && 'result' in data && data.result) {
      return data.result;
    }
    return data as GraphData;
  };

  const processedGraphData = extractGraphData(graphData);

  console.log('🔍 GraphView Rendering', { 
    graphData, 
    processedGraphData,
    isModal, 
    isSidebar,
    nodeCount: processedGraphData?.nodes?.length || 0,
    linkCount: processedGraphData?.links?.length || 0
  });

  // More robust defensive checks
  if (!processedGraphData || !Array.isArray(processedGraphData.nodes) || !Array.isArray(processedGraphData.links)) {
    console.error('Invalid graph data structure', { 
      processedGraphData,
      nodeType: typeof processedGraphData?.nodes,
      linkType: typeof processedGraphData?.links
    });
    return (
      <div className="text-center text-red-500 p-4">
        <p>Invalid graph data</p>
        <pre className="text-xs mt-2">{JSON.stringify(processedGraphData, null, 2)}</pre>
      </div>
    );
  }

  // Ensure at least some nodes and links exist
  if (processedGraphData.nodes.length === 0 || processedGraphData.links.length === 0) {
    console.warn('Graph data is empty', { 
      nodeCount: processedGraphData.nodes.length, 
      linkCount: processedGraphData.links.length 
    });
    return (
      <div className="text-center text-yellow-500 p-4">
        No nodes or links to display
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600
        });
      }
    };

    // Initial delay to allow sidebar transition
    const initialTimer = setTimeout(() => {
      updateDimensions();
    }, 300);

    // Handle resize events
    const resizeHandler = () => {
      requestAnimationFrame(updateDimensions);
    };

    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      clearTimeout(initialTimer);
    };
  }, []);

  // Adjust graph rendering based on context
  const graphConfig = {
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#ffffff",
    zoom: isSidebar ? 0.8 : 1,
    centerAt: isSidebar ? undefined : { x: 0, y: 0 }
  };

  const containerClass = isSidebar
    ? "w-full h-full bg-white relative"
    : "w-full h-full bg-white relative flex items-center justify-center";

  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  return (
    <div ref={containerRef} className={containerClass}>
      <NodeDetailsModal
        isOpen={selectedNode !== null}
        onClose={() => setSelectedNode(null)}
        nodeData={selectedNode}
      />
      {isClient && (
        <ForceGraph2D
          graphData={processedGraphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#ffffff"
          nodeAutoColorBy="group"
          nodeLabel="name"
          linkLabel="label"
          onNodeClick={handleNodeClick}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name || 'Unnamed';
            const fontSize = 14/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            // More robust color selection
            const nodeColor = 
              node.gender === 'male' ? '#4299E1' :     // Blue for male
              node.gender === 'female' ? '#FF1493' :   // Pink for female
              node.gender === 'unknown' ? '#A0AEC0' :  // Gray for unknown
              '#68D391';                               // Green for undefined/other

            ctx.fillStyle = nodeColor;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
            ctx.fill();
            
            // Add a background for text with more padding
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(
              node.x - textWidth/2 - 4,
              node.y + 10,
              textWidth + 8,
              fontSize + 6
            );
            
            // Draw text with better visibility
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, node.x, node.y + 15);

            // Optional: Add summary as tooltip/hover info
            if (node.summary) {
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.font = `${fontSize - 2}px Sans-Serif`;
              const summaryText = node.summary.length > 20 
                ? node.summary.substring(0, 20) + '...' 
                : node.summary;
              ctx.fillText(summaryText, node.x, node.y + 30);
            }
          }}
          linkCanvasObject={(link: any, ctx, globalScale) => {
            const start = link.source;
            const end = link.target;
            const label = link.label;
            const fontSize = 12/globalScale;
            
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textPos = {
              x: start.x + (end.x - start.x) * 0.5,
              y: start.y + (end.y - start.y) * 0.5
            };
            
            ctx.fillText(label, textPos.x, textPos.y);
          }}
        />
      )}
    </div>
  );
}
