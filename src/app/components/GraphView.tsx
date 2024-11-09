"use client";

import { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

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
}

export default function GraphView({ graphData }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeGraph = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        containerRef.current.style.width = `${width}px`;
        containerRef.current.style.height = `${height}px`;
      }
    };

    window.addEventListener('resize', resizeGraph);
    resizeGraph();

    return () => window.removeEventListener('resize', resizeGraph);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-white">
      <ForceGraph2D
        graphData={graphData}
        nodeAutoColorBy="group"
        nodeLabel="name"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = node.color || '#FF1493';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, node.y + 10);
        }}
      />
    </div>
  );
}
