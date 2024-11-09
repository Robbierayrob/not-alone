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
    <div ref={containerRef} className="w-full h-full bg-white relative">
      <ForceGraph2D
        graphData={graphData}
        width={containerRef.current?.clientWidth}
        height={containerRef.current?.clientHeight}
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
          ctx.fillStyle = '#FF1493';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.fillStyle = 'white';
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
      />
    </div>
  );
}