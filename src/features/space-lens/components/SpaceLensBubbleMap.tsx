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
  totalBytes: _totalBytes,
  selectedNodeId,
  onSelectNode,
  onDiveIn,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 520 });
  const [hoveredNode, setHoveredNode] = React.useState<PackedItem | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

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

  const packedItems = React.useMemo<PackedItem[]>(() => {
    if (nodes.length === 0) return [];

    const width = Math.max(dimensions.width, 300);
    const height = Math.max(dimensions.height, 300);

    const topNodes = nodes.slice(0, 28);

    const rootData: BubbleDatum = {
      name: "root",
      children: topNodes.map((n) => {
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
      r: Math.max(leaf.r, 26),
      value: leaf.value ?? 0,
    }));
  }, [nodes, dimensions]);

  const getNodeColor = (node: LensNode, isSelected: boolean) => {
    if (isSelected) {
      return {
        fill: "#00f0ff",
        stroke: "#ffffff",
        strokeWidth: 3,
        textColor: "#0e131b",
        sizeColor: "#0e131b",
      };
    }

    if (node.is_dir) {
      return {
        fill: "#182230",
        stroke: "#00f0ff",
        strokeWidth: 2,
        textColor: "#e2f1f8",
        sizeColor: "#00f0ff",
      };
    }

    switch (node.file_type) {
      case "video":
      case "disk_image":
        return {
          fill: "#380817",
          stroke: "#ff2a6d",
          strokeWidth: 2,
          textColor: "#e2f1f8",
          sizeColor: "#ff2a6d",
        };
      case "archive":
        return {
          fill: "#2b2108",
          stroke: "#ffb703",
          strokeWidth: 2,
          textColor: "#e2f1f8",
          sizeColor: "#ffb703",
        };
      case "audio":
        return {
          fill: "#082b1b",
          stroke: "#00ff88",
          strokeWidth: 2,
          textColor: "#e2f1f8",
          sizeColor: "#00ff88",
        };
      case "code":
        return {
          fill: "#082530",
          stroke: "#00f0ff",
          strokeWidth: 2,
          textColor: "#e2f1f8",
          sizeColor: "#00f0ff",
        };
      default:
        return {
          fill: "#182230",
          stroke: "#2a3b50",
          strokeWidth: 2,
          textColor: "#e2f1f8",
          sizeColor: "#88a7be",
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
      <div className="h-full w-full flex flex-col items-center justify-center text-[#506882] gap-3 border-2 border-[#2a3b50] bg-[#0e131b] font-['VT323']">
        <HardDrive className="h-10 w-10 text-[#506882]" />
        <p className="text-xl text-[#e2f1f8]">THIS FOLDER IS EMPTY</p>
        <span className="text-base text-[#506882]">No files or directories detected</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        // Performance optimization: only compute rect & update state when tooltip is active
        if (!hoveredNode || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
      className="relative w-full h-full min-h-[460px] rounded-none border-2 border-[#2a3b50] bg-[#0e131b] shadow-[4px_4px_0_#06101a] overflow-hidden flex items-center justify-center select-none crt-screen"
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        {packedItems.map((item) => {
          const isSelected = item.id === selectedNodeId;
          const color = getNodeColor(item, isSelected);

          const r = item.r;
          const truncatedName = getTruncatedName(item.name, r);
          const formattedSize = formatBytes(item.size_bytes);

          const nameFontSize = Math.min(Math.max(r * 0.22, 10), 14);
          const sizeFontSize = Math.min(Math.max(r * 0.22, 11), 16);
          const iconSize = Math.min(Math.max(r * 0.32, 14), 22);

          return (
            <g
              key={item.id}
              transform={`translate(${item.x}, ${item.y})`}
              className="cursor-pointer group transition-all duration-150"
              onClick={() => onSelectNode(item)}
              onDoubleClick={() => {
                if (item.is_dir) onDiveIn(item);
              }}
              onMouseEnter={(e) => {
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
                setHoveredNode(item);
              }}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Outer pulsing ring when selected */}
              {isSelected && (
                <circle
                  r={r + 5}
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}

              {/* Main Sphere Bubble */}
              <circle
                r={r}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={color.strokeWidth}
                className="transition-all duration-150 group-hover:brightness-125"
              />

              {/* Bubble Content */}
              {r >= 44 ? (
                <g className="pointer-events-none">
                  <text
                    x="0"
                    y={-r * 0.34}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={iconSize}
                    className="select-none"
                  >
                    {item.is_dir ? "📁" : item.file_type === "video" ? "🎬" : item.file_type === "disk_image" ? "💿" : item.file_type === "archive" ? "📦" : item.file_type === "code" ? "⚡" : "📄"}
                  </text>

                  <text
                    x="0"
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color.textColor}
                    fontSize={nameFontSize}
                    fontFamily="VT323, monospace"
                    className="select-none"
                  >
                    {truncatedName}
                  </text>

                  <text
                    x="0"
                    y={r * 0.34}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color.sizeColor}
                    fontSize={sizeFontSize}
                    fontWeight="bold"
                    fontFamily="VT323, monospace"
                    className="select-none"
                  >
                    {formattedSize}
                  </text>
                </g>
              ) : (
                <g className="pointer-events-none">
                  <text
                    x="0"
                    y={-r * 0.22}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color.textColor}
                    fontSize={Math.max(nameFontSize, 11)}
                    fontFamily="VT323, monospace"
                    className="select-none"
                  >
                    {truncatedName}
                  </text>

                  <text
                    x="0"
                    y={r * 0.26}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color.sizeColor}
                    fontSize={Math.max(sizeFontSize, 12)}
                    fontWeight="bold"
                    fontFamily="VT323, monospace"
                    className="select-none"
                  >
                    {formattedSize}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Retro Pixel Tooltip on Hover */}
      {hoveredNode && (
        <div
          style={{
            left: Math.min(mousePos.x + 14, dimensions.width - 240),
            top: Math.max(mousePos.y - 45, 12),
          }}
          className="absolute z-30 pointer-events-none p-2.5 border-2 border-[#2a3b50] bg-[#182230] text-[#e2f1f8] font-['VT323'] text-base shadow-[3px_3px_0_#06101a] min-w-[200px]"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Press_Start_2P'] text-[8px] text-[#00f0ff] uppercase">
              {hoveredNode.is_dir ? "DIR" : hoveredNode.file_type}
            </span>
            <span className="text-[#00ff88] font-bold">
              {formatBytes(hoveredNode.size_bytes)}
            </span>
          </div>
          <div className="text-sm font-mono text-[#e2f1f8] truncate">{hoveredNode.name}</div>
          <div className="text-[10px] text-[#506882] font-mono truncate mt-0.5">{hoveredNode.path}</div>
        </div>
      )}
    </div>
  );
};
