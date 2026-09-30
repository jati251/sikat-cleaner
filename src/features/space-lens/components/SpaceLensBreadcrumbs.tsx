import React from "react";
import { ChevronRight, ArrowLeft, Home, Download, FileText, Monitor, Film, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SpaceLensBreadcrumbsProps {
  currentPath: string;
  parentPath?: string | null;
  onNavigate: (path: string) => void;
  onNavigateUp: () => void;
  isLoading: boolean;
}

export const SpaceLensBreadcrumbs: React.FC<SpaceLensBreadcrumbsProps> = ({
  currentPath,
  parentPath,
  onNavigate,
  onNavigateUp,
  isLoading,
}) => {
  // Parse path segments into clickable breadcrumbs
  const segments = React.useMemo(() => {
    if (!currentPath) return [];
    const parts = currentPath.split("/").filter(Boolean);
    const result: { name: string; path: string }[] = [];

    // Root
    let accum = "";
    result.push({ name: "Macintosh HD", path: "/" });

    for (const part of parts) {
      accum += `/${part}`;
      result.push({ name: part, path: accum });
    }

    return result;
  }, [currentPath]);

  const shortcuts = [
    { label: "Home", path: "~", icon: Home },
    { label: "Downloads", path: "~/Downloads", icon: Download },
    { label: "Documents", path: "~/Documents", icon: FileText },
    { label: "Desktop", path: "~/Desktop", icon: Monitor },
    { label: "Movies", path: "~/Movies", icon: Film },
    { label: "Applications", path: "/Applications", icon: Package },
  ];

  return (
    <div className="flex flex-col gap-2 flex-shrink-0 font-['VT323']">
      {/* Top Bar: Back Button, Breadcrumb trail, Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 border-2 border-[#2a3b50] bg-[#182230] shadow-[2px_2px_0_#06101a]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateUp}
            disabled={!parentPath || isLoading}
            className="h-7 px-2 flex-shrink-0"
            title="Navigate to parent folder"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            <span>BACK</span>
          </Button>

          {/* Breadcrumb Path Scroll */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-base font-mono scrollbar-none">
            {segments.map((seg, idx) => {
              const isLast = idx === segments.length - 1;

              return (
                <React.Fragment key={seg.path}>
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#506882] flex-shrink-0" />}
                  <button
                    type="button"
                    onClick={() => onNavigate(seg.path)}
                    disabled={isLast || isLoading}
                    className={`px-1.5 py-0.5 whitespace-nowrap cursor-pointer transition-colors ${
                      isLast
                        ? "text-[#00f0ff] font-bold bg-[#0e131b] border border-[#00f0ff]"
                        : "text-[#e2f1f8] hover:text-[#00f0ff] hover:bg-[#0e131b]"
                    }`}
                  >
                    {seg.name}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Quick Location Shortcuts */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-sm text-[#506882] uppercase mr-1 hidden lg:inline font-['Press_Start_2P'] text-[8px]">
            JUMP:
          </span>
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.label}
                type="button"
                onClick={() => onNavigate(sc.path)}
                disabled={isLoading}
                title={`Jump to ${sc.label}`}
                className="px-1.5 py-0.5 text-sm text-[#e2f1f8] hover:text-[#00f0ff] hover:border-[#00f0ff] border border-[#2a3b50] bg-[#0e131b] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Icon className="h-3 w-3 text-[#00f0ff]" />
                <span className="hidden sm:inline">{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
