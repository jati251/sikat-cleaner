import React from "react";
import { hierarchy, pack, type HierarchyCircularNode } from "d3-hierarchy";
import { LensNode } from "@/types";
import { formatBytes } from "@/utils/formatters";
import { HardDrive } from "lucide-react";

interface SpaceLensBubbleMapProps {
  nodes: LensNode[];
  totalBytes: number;
  currentPath: string;
  selectedNodeId: string | null;
  onSelectNode: (node: LensNode) => void;
  onDiveIn: (node: LensNode) => void;
}

interface BubbleDatum extends Partial<LensNode> {
  name: string;
  value?: number;
  children?: BubbleDatum[];
}

interface PackedItem extends LensNode {
  x: number;
  y: number;
  r: number;
  value: number;
}

export const SpaceLensBubbleMap: React.FC<SpaceLensBubbleMapProps> = ({
  nodes,
  totalBytes,
  selectedNodeId,
  onSelectNode,
  onDiveIn,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 520 });
  const [hoveredNode, setHoveredNode] = React.useState<PackedItem | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Measure container size dynamically
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 200 && height > 200) {
          setDimensions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute Circle Packing with d3-hierarchy using power-law scaling
  // This guarantees that even smaller files have a healthy, readable radius!
  const packedItems = React.useMemo<PackedItem[]>(() => {
    if (nodes.length === 0) return [];

    const width = Math.max(dimensions.width, 300);
    const height = Math.max(dimensions.height, 300);

    // Limit to top 28 items sorted by size to keep bubbles large, beautiful, and readable
    const topNodes = nodes.slice(0, 28);

    const rootData: BubbleDatum = {
      name: "root",
      children: topNodes.map((n) => {
        // Power-law compression (0.42) ensures the largest item is still the biggest bubble,
        // but smaller items remain comfortably readable (r >= 30px)!
        const scaledVal = Math.pow(Math.max(n.size_bytes, 1024 * 1024), 0.42);
        return {
          ...n,
          value: Math.max(scaledVal, 100),
        };
      }),
    };

    const packLayout = pack<BubbleDatum>()
      .size([width - 32, height - 32])
      .padding(10);

    const root = hierarchy<BubbleDatum>(rootData)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const packedRoot = packLayout(root) as HierarchyCircularNode<BubbleDatum>;
    const leaves = packedRoot.leaves();
    return leaves.map((leaf) => ({
      ...(leaf.data as LensNode),
      x: leaf.x + 16,
      y: leaf.y + 16,
      r: Math.max(leaf.r, 26), // Clamp minimum radius to 26px so content is ALWAYS visible
      value: leaf.value ?? 0,
    }));
  }, [nodes, dimensions]);

  const getNodeColor = (node: LensNode, isSelected: boolean) => {
    if (isSelected) {
      return {
        fill: "url(#selected-gradient)",
        stroke: "#38bdf8",
        strokeWidth: 3,
      };
    }

    if (node.is_dir) {
      return {
        fill: "url(#folder-gradient)",
        stroke: "rgba(192, 132, 252, 0.6)",
        strokeWidth: 2,
      };
    }

    switch (node.file_type) {
      case "video":
        return {
          fill: "url(#video-gradient)",
          stroke: "rgba(244, 114, 182, 0.6)",
          strokeWidth: 2,
        };
      case "disk_image":
        return {
          fill: "url(#disk-gradient)",
          stroke: "rgba(251, 113, 133, 0.6)",
          strokeWidth: 2,
        };
      case "archive":
        return {
          fill: "url(#archive-gradient)",
          stroke: "rgba(251, 191, 36, 0.6)",
          strokeWidth: 2,
        };
      case "audio":
        return {
          fill: "url(#audio-gradient)",
          stroke: "rgba(52, 211, 153, 0.6)",
          strokeWidth: 2,
        };
      case "code":
        return {
          fill: "url(#code-gradient)",
          stroke: "rgba(34, 211, 238, 0.6)",
          strokeWidth: 2,
        };
      default:
        return {
          fill: "url(#file-gradient)",
          stroke: "rgba(203, 213, 225, 0.4)",
          strokeWidth: 2,
        };
    }
  };

  const getTruncatedName = (name: string, radius: number): string => {
    const maxChars = Math.max(Math.floor(radius / 4.4), 5);
    if (name.length <= maxChars) return name;
    return name.slice(0, maxChars - 1) + "…";
  };

  if (nodes.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-3 border border-white/5 rounded-3xl bg-slate-900/40">
        <HardDrive className="h-12 w-12 text-slate-500" />
        <p className="text-sm font-medium text-slate-300">This folder is empty</p>
        <span className="text-xs text-slate-500">No files or subdirectories detected</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
      className="relative w-full h-full min-h-[460px] rounded-3xl border border-white/10 bg-radial from-slate-900 via-slate-950 to-black overflow-hidden shadow-2xl flex items-center justify-center select-none"
    >
      {/* Background Dots Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <defs>
          {/* Radial Gradients with vibrant dark aesthetics */}
          <radialGradient id="folder-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#7e22ce" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.95" />
          </radialGradient>

          <radialGradient id="video-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#be185d" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#831843" stopOpacity="0.95" />
          </radialGradient>

          <radialGradient id="disk-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#be123c" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#881337" stopOpacity="0.95" />
          </radialGradient>

          <radialGradient id="archive-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#b45309" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0.95" />
          </radialGradient>

          <radialGradient id="audio-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#047857" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="0.95" />
          </radialGradient>

          <radialGradient id="code-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#0e7490" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#164e63" stopOpacity="0.95" />
          </radialGradient>

          <radialGradient id="file-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.8" />
            <stop offset="55%" stopColor="#334155" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
          </radialGradient>

          <radialGradient id="selected-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
          </radialGradient>

          <filter id="bubble-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.4" />
          </filter>
        </defs>

        {packedItems.map((item) => {
          const isSelected = item.id === selectedNodeId;
          const color = getNodeColor(item, isSelected);

          const r = item.r;
          const truncatedName = getTruncatedName(item.name, r);
          const formattedSize = formatBytes(item.size_bytes);

          // Dynamic typography sizes based on radius
          const nameFontSize = Math.min(Math.max(r * 0.22, 10), 14);
          const sizeFontSize = Math.min(Math.max(r * 0.2, 9), 12);
          const iconSize = Math.min(Math.max(r * 0.32, 14), 24);

          return (
            <g
              key={item.id}
              transform={`translate(${item.x}, ${item.y})`}
              className="cursor-pointer group transition-all duration-200"
              onClick={() => onSelectNode(item)}
              onDoubleClick={() => {
                if (item.is_dir) onDiveIn(item);
              }}
              onMouseEnter={() => setHoveredNode(item)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                transformOrigin: `${item.x}px ${item.y}px`,
              }}
            >
              {/* Outer pulsing ring when selected */}
              {isSelected && (
                <circle
                  r={r + 6}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="animate-spin"
                  style={{ animationDuration: "10s" }}
                />
              )}

              {/* Main Sphere Bubble */}
              <circle
                r={r}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={color.strokeWidth}
                filter="url(#bubble-glow)"
                className="transition-all duration-200 group-hover:brightness-125 group-hover:scale-[1.03]"
              />

              {/* Realistic glass specular highlight */}
              <ellipse
                cx={-r * 0.25}
                cy={-r * 0.35}
                rx={r * 0.42}
                ry={r * 0.2}
                fill="white"
                opacity="0.18"
                transform={`rotate(-20 ${-r * 0.25} ${-r * 0.35})`}
                className="pointer-events-none"
              />

              {/* 1. Large Bubble Layout (r >= 44): Icon + Title + Size */}
              {r >= 44 ? (
                <g className="pointer-events-none">
                  {/* Category Emoji/Icon indicator */}
                  <text
                    x="0"
                    y={-r * 0.34}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={iconSize}
                    className="drop-shadow-md select-none"
                  >
                    {item.is_dir ? "📁" : item.file_type === "video" ? "🎬" : item.file_type === "disk_image" ? "💿" : item.file_type === "archive" ? "📦" : item.file_type === "code" ? "⚡" : "📄"}
                  </text>

                  {/* Name */}
                  <text
                    x="0"
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={nameFontSize}
                    fontWeight="700"
                    className="drop-shadow-md select-none tracking-tight"
                  >
                    {truncatedName}
                  </text>

                  {/* Size */}
                  <text
                    x="0"
                    y={r * 0.34}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#67e8f9"
                    fontSize={sizeFontSize}
                    fontWeight="800"
                    fontFamily="monospace"
                    className="drop-shadow-md select-none"
                  >
                    {formattedSize}
                  </text>
                </g>
              ) : (
                /* 2. Medium & Small Bubble Layout (r < 44): Name + Size ALWAYS visible */
                <g className="pointer-events-none">
                  <text
                    x="0"
                    y={-r * 0.22}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={Math.max(nameFontSize, 9.5)}
                    fontWeight="700"
                    className="drop-shadow-md select-none tracking-tight"
                  >
                    {truncatedName}
                  </text>
                  <text
                    x="0"
                    y={r * 0.26}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#a5f3fc"
                    fontSize={Math.max(sizeFontSize, 8.5)}
                    fontWeight="700"
                    fontFamily="monospace"
                    className="drop-shadow-md select-none"
                  >
                    {formattedSize}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Card Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-30 pointer-events-none p-3 rounded-2xl bg-slate-900/95 border border-white/20 shadow-2xl backdrop-blur-xl text-xs max-w-xs transition-opacity duration-150 animate-in fade-in"
          style={{
            left: Math.min(Math.max(mousePos.x - 110, 16), dimensions.width - 240),
            top: Math.max(mousePos.y - 120, 16),
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{hoveredNode.is_dir ? "📁" : "📄"}</span>
            <span className="font-bold text-white truncate max-w-[190px]">
              {hoveredNode.name}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 font-mono mt-1 text-[11px]">
            <span className="text-cyan-300 font-bold">
              {formatBytes(hoveredNode.size_bytes)}
            </span>
            <span className="text-purple-300 font-medium">
              {totalBytes > 0
                ? `${((hoveredNode.size_bytes / totalBytes) * 100).toFixed(1)}%`
                : "100%"}
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-mono truncate mt-1">
            {hoveredNode.path}
          </p>

          {hoveredNode.is_dir && (
            <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-purple-200 font-semibold flex items-center gap-1">
              <span>Double-click or press "Dive In" to enter</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
