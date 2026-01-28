import { motion } from "framer-motion";
import type { ExportFormat } from "@/components/ui/select";
import { formatLabels } from "@/components/ui/select";
import {
  Image,
  Upload,
  Paintbrush,
  Download,
  ZoomIn,
  ZoomOut,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  showUpload: boolean;
  showGallery: boolean;
  showTools: boolean;
  showKbdHints: boolean;
  onToggleUpload: () => void;
  onToggleGallery: () => void;
  onToggleTools: () => void;
  hasSelectedImage: boolean;
  exportFormat: ExportFormat;
  onExport: () => void;
  imageCount: number;
  onDeleteAll: () => void;
}

export function TopBar({
  zoom,
  onZoomIn,
  onZoomOut,
  showUpload,
  showGallery,
  showTools,
  showKbdHints,
  onToggleUpload,
  onToggleGallery,
  onToggleTools,
  hasSelectedImage,
  exportFormat,
  onExport,
  imageCount,
  onDeleteAll,
}: TopBarProps) {
  const toggleButtons = [
    {
      key: "U",
      icon: Upload,
      label: "Upload",
      state: showUpload,
      toggle: onToggleUpload,
    },
    {
      key: "I",
      icon: Image,
      label: "Gallery",
      state: showGallery,
      toggle: onToggleGallery,
    },
    {
      key: "S",
      icon: Paintbrush,
      label: "Tools",
      state: showTools,
      toggle: onToggleTools,
    },
  ];

  return (
    <motion.div
      animate={{
        paddingLeft: showTools ? 320 : 12, // sidebar + gap
        paddingRight: 12,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-3 left-0 right-0 z-30 pointer-events-none"
    >
      {/* ✅ THIS RESTORES CLICKING */}
      <div className="pointer-events-auto">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 bg-theme-card/80 backdrop-blur-sm rounded-xl border border-theme-border">
          {/* Left — Zoom */}
          <div className="flex items-center gap-2 justify-self-start">
            <button
              onClick={onZoomOut}
              disabled={zoom <= 25}
              className="p-1.5 rounded-md hover:bg-theme-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center leading-none">
              <span className="text-sm font-medium w-12 text-center tabular-nums">
                {zoom}%
              </span>
              {showKbdHints && (
                <kbd className="bg-theme-secondary text-theme-foreground text-[10px] px-1.5 py-0.5 mt-0.5 rounded">
                  Alt − / +
                </kbd>
              )}
            </div>

            <button
              onClick={onZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 rounded-md hover:bg-theme-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Center — Toggles */}
          <div className="flex gap-1 p-1 rounded-lg bg-theme-muted justify-self-center">
            {toggleButtons.map(({ key, icon: Icon, label, state, toggle }) => (
              <button
                key={key}
                onClick={toggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  state
                    ? "bg-theme-primary text-theme-secondary "
                    : "text-theme-muted-foreground hover:text-theme-foreground hover:bg-theme-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {showKbdHints && (
                  <kbd className="hidden sm:inline bg-theme-secondary text-theme-foreground text-xs px-1.5 rounded">
                    Alt {key}
                  </kbd>
                )}
              </button>
            ))}
          </div>

          {/* Right — Export & Delete All */}
          <div className="flex items-center gap-2 justify-self-end">
            <Button
              onClick={onExport}
              disabled={!hasSelectedImage}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">
                Export as {formatLabels[exportFormat]}
              </span>
              <span className="sm:hidden">
                {formatLabels[exportFormat]}
              </span>
              {showKbdHints && (
                <kbd className="hidden sm:inline bg-theme-secondary text-theme-foreground text-xs px-1.5 rounded">
                  Alt E
                </kbd>
              )}
            </Button>

            <Button
              onClick={onDeleteAll}
              disabled={imageCount === 0}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete All</span>
              {showKbdHints && (
                <kbd className="hidden sm:inline bg-theme-secondary text-theme-foreground text-xs px-1.5 rounded">
                  Alt D
                </kbd>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}