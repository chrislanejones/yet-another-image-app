import {
  ImageIcon,
  Upload,
  Paintbrush,
  Download,
  ZoomIn,
  ZoomOut,
} from "@/components/icons";
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
      icon: ImageIcon,
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
    <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 bg-theme-card/80 backdrop-blur-sm rounded-xl border border-theme-border">
      {/* Left: Zoom */}
      <div className="flex items-center gap-2 justify-self-start">
        <div className="inline-flex items-center rounded-lg border border-theme-border bg-theme-muted p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onZoomOut}
            className="rounded-md"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-14 text-center text-theme-muted-foreground tabular-nums">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onZoomIn}
            className="rounded-md"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        {showKbdHints && (
          <div className="flex gap-1">
            <kbd className="text-xs px-1.5 py-0.5 rounded bg-theme-primary text-black">
              Alt -/+
            </kbd>
          </div>
        )}
      </div>

      {/* Center: Upload, Gallery, Tools */}
      <div className="flex gap-1 p-1 rounded-lg bg-theme-muted justify-self-center">
        {toggleButtons.map(({ key, icon: Icon, label, state, toggle }) => (
          <button
            key={key}
            onClick={toggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              state
                ? "bg-theme-primary text-theme-primary-foreground"
                : "text-theme-muted-foreground hover:text-theme-foreground hover:bg-accent"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
            {showKbdHints && (
              <kbd className="hidden sm:inline text-xs px-1.5 rounded bg-theme-primary text-black">
                Alt {key}
              </kbd>
            )}
          </button>
        ))}
      </div>

      {/* Right: Export */}
      <div className="flex items-center gap-2 justify-self-end">
        {hasSelectedImage && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-theme-primary text-theme-primary-foreground">
            <Download className="h-4 w-4" />
            Export
          </button>
        )}
      </div>
    </div>
  );
}
