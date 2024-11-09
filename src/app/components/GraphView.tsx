"use client";

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

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

interface GraphViewProps {
  graphData: GraphData;
  isModal?: boolean;
}

export default function GraphView({ graphData }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="w-full h-full bg-white relative">
      {typeof window !== 'undefined' && <ForceGraph2D
        graphData={graphData}
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 600}
        backgroundColor="#ffffff"
        nodeAutoColorBy="group"
        nodeLabel="name"
        linkLabel="label"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 14/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          // Set color based on gender property, default to neutral color
          const nodeColor = node.gender === 'male' ? '#4299E1' : // Blue for male
                           node.gender === 'female' ? '#FF1493' : // Pink for female
                           '#A0AEC0'; // Gray for undefined/other
          ctx.fillStyle = nodeColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
          
          // Add a background for text
          const textWidth = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(
            node.x - textWidth/2 - 2,
            node.y + 8,
            textWidth + 4,
            fontSize + 4
          );
          
          // Draw text
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
