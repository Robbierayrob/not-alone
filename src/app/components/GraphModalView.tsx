"use client";

import { useEffect, useRef, useState } from 'react';
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
    color?: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
  }>;
}

interface GraphModalViewProps {
  graphData: GraphData;
}

export default function GraphModalView({ graphData }: GraphModalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-white relative flex items-center justify-center">
      <NodeDetailsModal 
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        nodeData={selectedNode}
      />
      {typeof window !== 'undefined' && <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#ffffff"
        nodeAutoColorBy="group"
        nodeLabel="name"
        linkLabel="label"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        centerAt={{ x: 0, y: 0 }}
        zoom={1.5}
        onNodeClick={(node: any) => setSelectedNode(node)}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 14/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const nodeColor = node.gender === 'male' ? '#4299E1' :
                           node.gender === 'female' ? '#FF1493' :
                           '#A0AEC0';
          ctx.fillStyle = nodeColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
          
          const textWidth = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(
            node.x - textWidth/2 - 2,
            node.y + 8,
            textWidth + 4,
            fontSize + 4
          );
          
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, node.y + 15);
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
      />}
    </div>
  );
}
