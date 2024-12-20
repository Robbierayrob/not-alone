"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import NodeDetailsModal from './NodeDetailsModal';
import { ForceGraphProps } from 'react-force-graph-2d';
import * as d3 from 'd3';


const ForceGraph2D = dynamic<ForceGraphProps<any, any>>(() => import('react-force-graph-2d'), {
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
        {...{
          graphData: graphData,
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: "#ffffff",
          nodeAutoColorBy: "group",
          nodeLabel: "name",
          linkLabel: "label",
          onNodeClick: (node: any) => setSelectedNode(node),
          linkDirectionalParticles: 2,
          linkDirectionalParticleSpeed: 0.005,
          enableNodeDrag: true,
          d3AlphaDecay: 0.003,
          d3VelocityDecay: 0.05,
          warmupTicks: 1000,
          cooldownTicks: 1500,
          d3Force: (d3: { force: (arg0: string) => { (): any; new(): any; distance: { (arg0: (link: any) => number): { (): any; new(): any; strength: { (arg0: number): void; new(): any; }; }; new(): any; }; strength: { (arg0: number): { (): any; new(): any; distanceMax: { (arg0: number): void; new(): any; }; }; new(): any; }; }; }) => {
            // Configure link force with custom distance
            d3.force('link')
              .distance((link: { value: number; }) => {
                // Significantly increased base distance
                return link.value ? link.value * 400 : 600; // Much larger base distance
              })
              .strength(0.3); // Reduced link force strength

            // Add repulsive force between nodes
            d3.force('charge')
              .strength(-2500)  // Increased repulsive strength
              .distanceMax(1500);  // Increased max distance
            return d3;
          },
          d3ForceLink: (link: any) => Math.max(link.value * 3, 300), // Minimum 300px distance
          linkDistance: 1000, // Significantly larger minimum distance
          
          // Custom node positioning initialization
          initNodePosition: (node: any, index: number) => {
            const radius = 600;  // Larger initial spread radius
            const angle = (index / graphData.nodes.length) * 2 * Math.PI;
            
            node.x = radius * Math.cos(angle);
            node.y = radius * Math.sin(angle);
            
            return node;
          },
        } as ForceGraphProps<any, any>}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name || 'Unnamed';
          const fontSize = 16/globalScale;
          ctx.font = `${fontSize}px 'IBM Plex Sans', Sans-Serif`;
          
          // Enhanced color selection with more vibrant and consistent palette
          const nodeColor = 
            node.gender === 'male' ? 'rgba(66, 153, 225, 0.8)' :     // Soft Blue
            node.gender === 'female' ? 'rgba(255, 20, 147, 0.8)' :   // Deep Pink
            node.gender === 'unknown' ? 'rgba(203, 166, 247, 0.7)' : // Soft Lavender
            'rgba(104, 211, 145, 0.8)';                               // Soft Green

          // Draw node with solid color and subtle shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 6;
          ctx.fillStyle = nodeColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI, false);  // Smaller visual node size
          ctx.fill();
          ctx.shadowBlur = 0;

          // Add a subtle border
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Name Label inside node
          ctx.font = `bold ${fontSize}px 'IBM Plex Sans', Sans-Serif`;
          ctx.fillStyle = 'white';  // White text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, node.y);
        }}
        linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
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
