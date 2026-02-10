import { Minus, MousePointer2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCanvasData,
  saveCanvasItem,
  deleteCanvasItem,
  saveCanvasConnection,
  deleteCanvasConnection,
} from "@/actions/features";
import { getNotesTree } from "@/actions/notes";
import type { CanvasItem, CanvasConnection, NoteTreeItem } from "@/db/schema";

interface CanvasState {
  items: (CanvasItem & { title?: string; emoji?: string })[];
  connections: CanvasConnection[];
}

export function CanvasView({
  onNavigate,
}: {
  onNavigate?: (noteId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<CanvasState>({
    items: [],
    connections: [],
  });
  const [notes, setNotes] = useState<NoteTreeItem[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showNoteList, setShowNoteList] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const load = useCallback(async () => {
    const [canvasData, allNotes] = await Promise.all([
      getCanvasData(),
      getNotesTree(),
    ]);

    const noteMap = new Map(allNotes.map((n) => [n.id, n]));
    const items = canvasData.items.map((item) => {
      const note = item.note_id ? noteMap.get(item.note_id) : undefined;
      return {
        ...item,
        title: note?.title ?? "Note",
        emoji: note?.emoji ?? "📝",
      };
    });

    setCanvas({ items, connections: canvasData.connections });
    setNotes(allNotes.filter((n) => !n.isFolder));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains("canvas-bg")) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setTransform((t) => ({
          ...t,
          x: e.clientX - panStart.current.x,
          y: e.clientY - panStart.current.y,
        }));
      }
      if (draggingItem) {
        const dx = (e.movementX) / transform.scale;
        const dy = (e.movementY) / transform.scale;
        setCanvas((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === draggingItem
              ? { ...item, x: item.x + dx, y: item.y + dy }
              : item
          ),
        }));
      }
    },
    [isPanning, draggingItem, transform.scale]
  );

  const handleMouseUp = useCallback(async () => {
    if (draggingItem) {
      const item = canvas.items.find((i) => i.id === draggingItem);
      if (item) {
        await saveCanvasItem(item.id, item.note_id, item.x, item.y, item.width, item.height);
      }
    }
    setIsPanning(false);
    setDraggingItem(null);
  }, [draggingItem, canvas.items]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.1, Math.min(3, t.scale * delta)),
    }));
  }, []);

  const addNoteToCanvas = async (noteId: string) => {
    const id = crypto.randomUUID();
    const x = (-transform.x + 400) / transform.scale;
    const y = (-transform.y + 300) / transform.scale;
    await saveCanvasItem(id, noteId, x, y, 200, 120);
    setShowNoteList(false);
    load();
  };

  const removeItem = async (itemId: string) => {
    await deleteCanvasItem(itemId);
    load();
  };

  const handleConnect = async (toId: string) => {
    if (connectingFrom && connectingFrom !== toId) {
      const id = crypto.randomUUID();
      await saveCanvasConnection(id, connectingFrom, toId);
      setConnectingFrom(null);
      load();
    }
  };

  const removeConnection = async (connId: string) => {
    await deleteCanvasConnection(connId);
    load();
  };

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // Get item center for drawing connections
  const getItemCenter = (itemId: string) => {
    const item = canvas.items.find((i) => i.id === itemId);
    if (!item) return { x: 0, y: 0 };
    return { x: item.x + item.width / 2, y: item.y + item.height / 2 };
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Toolbar */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-md">
        <button
          type="button"
          onClick={() => setShowNoteList(!showNoteList)}
          className="rounded-md px-3 py-1.5 text-xs font-medium hover:bg-accent"
          title="Add note to canvas"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTransform((t) => ({ ...t, scale: Math.min(3, t.scale * 1.2) }))}
          className="rounded-md p-1.5 hover:bg-accent"
          title="Zoom in"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTransform((t) => ({ ...t, scale: Math.max(0.1, t.scale * 0.8) }))}
          className="rounded-md p-1.5 hover:bg-accent"
          title="Zoom out"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded-md p-1.5 hover:bg-accent"
          title="Reset view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        {connectingFrom && (
          <button
            type="button"
            onClick={() => setConnectingFrom(null)}
            className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
          >
            Cancel connection
          </button>
        )}
        <span className="ml-2 text-[10px] text-muted-foreground">
          {Math.round(transform.scale * 100)}%
        </span>
      </div>

      {/* Note picker dropdown */}
      {showNoteList && (
        <div className="absolute left-4 top-16 z-20 max-h-64 w-56 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => addNoteToCanvas(note.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span className="text-xs">{note.emoji ?? "📝"}</span>
              <span className="truncate">{note.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="canvas-bg h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ background: "radial-gradient(circle, hsl(var(--muted)) 1px, transparent 1px)", backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px` }}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
          }}
        >
          {/* SVG connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ overflow: "visible", width: "1px", height: "1px" }}>
            {canvas.connections.map((conn) => {
              const from = getItemCenter(conn.from_item_id);
              const to = getItemCenter(conn.to_item_id);
              return (
                <g key={conn.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    opacity={0.5}
                    markerEnd="url(#arrowhead)"
                  />
                  <circle
                    cx={(from.x + to.x) / 2}
                    cy={(from.y + to.y) / 2}
                    r={8}
                    fill="hsl(var(--destructive))"
                    opacity={0}
                    className="hover:opacity-100 cursor-pointer pointer-events-auto"
                    onClick={() => removeConnection(conn.id)}
                  />
                </g>
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="hsl(var(--primary))"
                  opacity={0.5}
                />
              </marker>
            </defs>
          </svg>

          {/* Canvas items */}
          {canvas.items.map((item) => (
            <div
              key={item.id}
              className={`absolute rounded-lg border-2 bg-card shadow-md transition-shadow select-none ${
                connectingFrom === item.id
                  ? "border-primary shadow-primary/20"
                  : "border-border hover:shadow-lg"
              }`}
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (connectingFrom) {
                  handleConnect(item.id);
                } else {
                  setDraggingItem(item.id);
                }
              }}
              onDoubleClick={() => item.note_id && onNavigate?.(item.note_id)}
            >
              <div className="flex h-full flex-col p-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="flex-1 truncate text-sm font-medium">
                    {item.title}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnectingFrom(item.id);
                    }}
                    className="rounded p-0.5 hover:bg-accent"
                    title="Draw connection"
                  >
                    <MousePointer2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="rounded p-0.5 hover:bg-destructive/10 text-destructive"
                    title="Remove from canvas"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
