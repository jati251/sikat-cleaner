import React from "react";
import { hierarchy, pack } from "d3-hierarchy";
import { LensNode } from "@/types";
import { formatBytes } from "@/utils/formatters";
import {
  Folder,
  Film,
  Archive,
  FileText,
  Music,
  Disc,
  FileCode,
  HardDrive,
  File,
} from "lucide-react";

interface SpaceLensBubbleMapProps {
  nodes: LensNode[];
  totalBytes: number;
  currentPath: string;
  selectedNodeId: string | null;
  onSelectNode: (node: LensNode) => void;
  onDiveIn: (node: LensNode) => void;
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

  // Compute Circle Packing with d3-hierarchy
  const packedItems = React.useMemo<PackedItem[]>(() => {
    if (nodes.length === 0) return [];

    const width = dimensions.width;
    const height = dimensions.height;

    // Minimum visual weight so small items still appear as neat small bubbles
    const rootData = {
      name: "root",
      children: nodes.map((n) => ({
        ...n,
        // Scale values gracefully: add a minimum floor so small items don't vanish
        value: Math.max(n.size_bytes, 1024 * 1024 * 5),
      })),
    };

    const packLayout = pack<any>()
      .size([width - 24, height - 24])
      .padding(8);

    const root = hierarchy(rootData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    packLayout(root);

    const leaves = root.leaves();
    return leaves.map((leaf: any) => ({
      ...leaf.data,
      x: leaf.x + 12,
      y: leaf.y + 12,
      r: leaf.r,
      value: leaf.value,
    }));
  }, [nodes, dimensions]);

  const getNodeColor = (node: LensNode, isSelected: boolean) => {
    if (isSelected) {
      return {
        fill: "url(#selected-gradient)",
        stroke: "#38bdf8",
        strokeWidth: 3,
        glow: "rgba(56, 189, 248, 0.4)",
      };
    }

    if (node.is_dir) {
      return {
        fill: "url(#folder-gradient)",
        stroke: "rgba(168, 85, 247, 0.5)",
        strokeWidth: 1.5,
        glow: "rgba(168, 85, 247, 0.25)",
      };
    }

    switch (node.file_type) {
      case "video":
        return {
          fill: "url(#video-gradient)",
          stroke: "rgba(236, 72, 153, 0.5)",
          strokeWidth: 1.5,
          glow: "rgba(236, 72, 153, 0.25)",
        };
      case "disk_image":
        return {
          fill: "url(#disk-gradient)",
          stroke: "rgba(244, 63, 94, 0.5)",
          strokeWidth: 1.5,
          glow: "rgba(244, 63, 94, 0.25)",
        };
      case "archive":
        return {
          fill: "url(#archive-gradient)",
          stroke: "rgba(245, 158, 11, 0.5)",
          strokeWidth: 1.5,
          glow: "rgba(245, 158, 11, 0.25)",
        };
      case "audio":
        return {
          fill: "url(#audio-gradient)",
          stroke: "rgba(16, 185, 129, 0.5)",
          strokeWidth: 1.5,
          glow: "rgba(16, 185, 129, 0.25)",
        };
      case "code":
        return {
          fill: "url(#code-gradient)",
          stroke: "rgba(6, 182, 212, 0.5)",
          strokeWidth: 1.5,
          glow: "rgba(6, 182, 212, 0.25)",
        };
      default:
        return {
          fill: "url(#file-gradient)",
          stroke: "rgba(148, 163, 184, 0.3)",
          strokeWidth: 1.5,
          glow: "rgba(148, 163, 184, 0.15)",
        };
    }
  };

  const getNodeIcon = (node: LensNode, sizeClass: string) => {
    if (node.is_dir) return <Folder className={sizeClass} />;
    switch (node.file_type) {
      case "video":
        return <Film className={sizeClass} />;
      case "disk_image":
        return <Disc className={sizeClass} />;
      case "archive":
        return <Archive className={sizeClass} />;
      case "audio":
        return <Music className={sizeClass} />;
      case "code":
        return <FileCode className={sizeClass} />;
      case "document":
        return <FileText className={sizeClass} />;
      default:
        return <File className={sizeClass} />;
    }
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
      className="relative w-full h-full min-h-[460px] rounded-3xl border border-white/10 bg-radial from-slate-900/90 via-slate-950 to-black overflow-hidden shadow-inner flex items-center justify-center select-none"
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <defs>
          {/* Bubble Gradients */}
          <radialGradient id="folder-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#6b21a8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="0.85" />
          </radialGradient>

          <radialGradient id="video-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#be185d" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#831843" stopOpacity="0.85" />
          </radialGradient>

          <radialGradient id="disk-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#be123c" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#881337" stopOpacity="0.85" />
          </radialGradient>

          <radialGradient id="archive-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#b45309" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0.85" />
          </radialGradient>

          <radialGradient id="audio-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#047857" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="0.85" />
          </radialGradient>

          <radialGradient id="code-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#0e7490" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#164e63" stopOpacity="0.85" />
          </radialGradient>

          <radialGradient id="file-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#334155" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
          </radialGradient>

          <radialGradient id="selected-gradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="bubble-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.35" />
          </filter>
        </defs>

        {packedItems.map((item) => {
          const isSelected = item.id === selectedNodeId;
          const color = getNodeColor(item, isSelected);
          const percent = totalBytes > 0 ? (item.size_bytes / totalBytes) * 100 : 0;

          // Determine content visibility based on radius
          const isLarge = item.r >= 44;
          const isMedium = item.r >= 26 && item.r < 44;

          return (
            <g
              key={item.id}
              transform={`translate(${item.x}, ${item.y})`}
              className="cursor-pointer group transition-transform duration-200"
              onClick={() => onSelectNode(item)}
              onDoubleClick={() => {
                if (item.is_dir) onDiveIn(item);
              }}
              style={{
                transformOrigin: `${item.x}px ${item.y}px`,
              }}
            >
              {/* Outer pulsing ring for selected node */}
              {isSelected && (
                <circle
                  r={item.r + 6}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-spin"
                  style={{ animationDuration: "12s" }}
                />
              )}

              {/* Main Sphere Bubble */}
              <circle
                r={item.r}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={color.strokeWidth}
                filter="url(#bubble-glow)"
                className="transition-all duration-200 group-hover:brightness-125"
              />

              {/* Specular highlight on top edge for realistic glass sphere look */}
              <ellipse
                cx={-item.r * 0.25}
                cy={-item.r * 0.35}
                rx={item.r * 0.4}
                ry={item.r * 0.2}
                fill="white"
                opacity="0.15"
                transform={`rotate(-20 ${-item.r * 0.25} ${-item.r * 0.35})`}
                className="pointer-events-none"
              />

              {/* Content Inside Bubble: Large */}
              {isLarge && (
                <foreignObject
                  x={-item.r * 0.85}
                  y={-item.r * 0.85}
                  width={item.r * 1.7}
                  height={item.r * 1.7}
                  className="pointer-events-none"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 text-white">
                    <div className="mb-0.5 text-white/90 drop-shadow-sm">
                      {getNodeIcon(item, item.r > 60 ? "h-6 w-6" : "h-4 w-4")}
                    </div>

                    <span
                      className="font-bold tracking-tight text-white drop-shadow-sm leading-tight max-w-[95%] truncate px-1"
                      style={{ fontSize: item.r > 65 ? "13px" : "11px" }}
                    >
                      {item.name}
                    </span>

                    <span
                      className="font-mono font-bold text-cyan-200 mt-0.5 drop-shadow-xs"
                      style={{ fontSize: item.r > 65 ? "12px" : "10px" }}
                    >
                      {formatBytes(item.size_bytes)}
                    </span>

                    {item.is_dir && item.r >= 55 && (
                      <span className="text-[9px] text-white/60 font-mono mt-0.5">
                        {item.item_count ? `${item.item_count} items` : "folder"}
                      </span>
                    )}

                    {item.is_dir && item.r >= 65 && (
                      <span className="text-[8px] tracking-wider uppercase font-semibold text-purple-200/80 mt-1 px-1.5 py-0.2 rounded-full bg-white/10 flex items-center gap-0.5">
                        Double click ➜
                      </span>
                    )}
                  </div>
                </foreignObject>
              )}

              {/* Content Inside Bubble: Medium */}
              {isMedium && (
                <foreignObject
                  x={-item.r * 0.8}
                  y={-item.r * 0.8}
                  width={item.r * 1.6}
                  height={item.r * 1.6}
                  className="pointer-events-none"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-0.5 text-white">
                    <div className="text-white/80">{getNodeIcon(item, "h-3.5 w-3.5")}</div>
                    <span className="font-mono text-[9px] font-bold text-cyan-100 truncate max-w-full">
                      {formatBytes(item.size_bytes)}
                    </span>
                  </div>
                </foreignObject>
              )}

              {/* Native SVG title for hover tooltip on small or large bubbles */}
              <title>{`${item.name}\nSize: ${formatBytes(item.size_bytes)} (${percent.toFixed(
                1
              )}%)\nType: ${item.file_type}${
                item.is_dir ? " (Double-click to dive in)" : ""
              }`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
