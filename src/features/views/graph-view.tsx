import { useCallback, useEffect, useRef, useState } from "react";

import { getGraphData } from "@/actions/wikilinks";
import type { GraphData } from "@/db/schema";

interface SimNode {
  id: string;
  title: string;
  emoji: string | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface SimEdge {
  source: string;
  target: string;
  edgeType: string;
}

export function GraphView({
  onNavigate,
}: {
  onNavigate?: (noteId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<SimEdge[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ nodeId: string | null; offsetX: number; offsetY: number }>({
    nodeId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const hoveredRef = useRef<string | null>(null);

  useEffect(() => {
    getGraphData().then(setGraphData);
  }, []);

  useEffect(() => {
    if (!graphData) return;

    const width = canvasRef.current?.parentElement?.clientWidth ?? 800;
    const height = canvasRef.current?.parentElement?.clientHeight ?? 600;

    // Initialize nodes with random positions
    nodesRef.current = graphData.nodes.map((n) => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
    }));
    edgesRef.current = graphData.edges;
  }, [graphData]);

  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    if (nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Force simulation step
    const REPULSION = 5000;
    const ATTRACTION = 0.005;
    const DAMPING = 0.9;
    const CENTER_GRAVITY = 0.01;

    // Reset forces
    for (const n of nodes) {
      n.vx *= DAMPING;
      n.vy *= DAMPING;
    }

    // Center gravity
    for (const n of nodes) {
      n.vx += (width / 2 - n.x) * CENTER_GRAVITY;
      n.vy += (height / 2 - n.y) * CENTER_GRAVITY;
    }

    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const force = REPULSION / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const fx = dx * ATTRACTION;
      const fy = dy * ATTRACTION;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Update positions (skip dragged node)
    for (const n of nodes) {
      if (n.id === dragRef.current.nodeId) continue;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(20, Math.min(width - 20, n.x));
      n.y = Math.max(20, Math.min(height - 20, n.y));
    }

    // Draw
    const isDark = document.documentElement.classList.contains("dark");
    ctx.clearRect(0, 0, width, height);

    // Draw edges
    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = edge.edgeType === "wikilink"
        ? (isDark ? "rgba(147, 130, 255, 0.4)" : "rgba(99, 102, 241, 0.4)")
        : (isDark ? "rgba(100, 100, 100, 0.3)" : "rgba(180, 180, 180, 0.3)");
      ctx.lineWidth = edge.edgeType === "wikilink" ? 2 : 1;
      ctx.stroke();
    }

    // Draw nodes
    for (const n of nodes) {
      const isHovered = n.id === hoveredRef.current;
      const radius = isHovered ? 8 : 6;

      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered
        ? (isDark ? "#a78bfa" : "#6366f1")
        : (isDark ? "#7c7cf0" : "#818cf8");
      ctx.fill();

      // Draw label
      ctx.font = isHovered ? "bold 12px sans-serif" : "11px sans-serif";
      ctx.fillStyle = isDark ? "#e2e8f0" : "#1e293b";
      ctx.textAlign = "center";
      ctx.fillText(n.title.slice(0, 20), n.x, n.y - 12);
    }

    animRef.current = requestAnimationFrame(simulate);
  }, []);

  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    animRef.current = requestAnimationFrame(simulate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [graphData, simulate]);

  const findNodeAt = (x: number, y: number): SimNode | null => {
    for (const n of nodesRef.current) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (dx * dx + dy * dy < 200) return n;
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = findNodeAt(x, y);
    if (node) {
      dragRef.current = { nodeId: node.id, offsetX: x - node.x, offsetY: y - node.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragRef.current.nodeId) {
      const node = nodesRef.current.find((n) => n.id === dragRef.current.nodeId);
      if (node) {
        node.x = x - dragRef.current.offsetX;
        node.y = y - dragRef.current.offsetY;
      }
    }

    const hovered = findNodeAt(x, y);
    hoveredRef.current = hovered?.id ?? null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hovered ? "pointer" : "default";
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragRef.current.nodeId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const node = findNodeAt(x, y);
        // Only navigate if we didn't drag far
        if (node && node.id === dragRef.current.nodeId) {
          onNavigate?.(node.id);
        }
      }
    }
    dragRef.current = { nodeId: null, offsetX: 0, offsetY: 0 };
  };

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">No graph data yet</p>
          <p className="text-sm">Create notes and add [[wikilinks]] to see connections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-10 rounded-md bg-background/80 px-3 py-1.5 text-muted-foreground text-xs backdrop-blur">
        {graphData.nodes.length} notes · {graphData.edges.length} connections
      </div>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}
