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
    <div className="flex flex-col gap-2.5 flex-shrink-0">
      {/* Top Bar: Back Button, Breadcrumb trail, Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateUp}
            disabled={!parentPath || isLoading}
            className="h-8 px-2.5 flex-shrink-0 rounded-xl"
            title="Navigate to parent folder"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-xs">Back</span>
          </Button>

          {/* Breadcrumb Path Scroll */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-xs font-mono scrollbar-none">
            {segments.map((seg, idx) => {
              const isLast = idx === segments.length - 1;

              return (
                <React.Fragment key={seg.path}>
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />}
                  <button
                    onClick={() => onNavigate(seg.path)}
                    disabled={isLast || isLoading}
                    className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      isLast
                        ? "text-cyan-300 font-bold bg-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
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
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mr-1 hidden lg:inline">
            Jump to:
          </span>
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.label}
                onClick={() => onNavigate(sc.path)}
                disabled={isLoading}
                title={`Jump to ${sc.label}`}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Icon className="h-3 w-3 text-cyan-400" />
                <span className="hidden sm:inline">{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
