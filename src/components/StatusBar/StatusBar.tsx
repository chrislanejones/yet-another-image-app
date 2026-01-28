import type { ImageData, ToolType } from "@/lib/types";
import {
  formatImageCount,
  formatToolLabel,
  formatExportLabel,
  getImageMeta,
} from "./formatters";

interface StatusBarProps {
  selectedImage?: ImageData | undefined;
  imageCount: number;
  activeTool: ToolType;
  exportFormat: string;
}

export function StatusBar({
  selectedImage,
  imageCount,
  activeTool,
  exportFormat,
}: StatusBarProps) {
  const imageMeta = getImageMeta(selectedImage);

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 h-9 px-4
        grid grid-cols-3 items-center
        text-xs bg-theme-card/80 backdrop-blur-sm
        border-t border-theme-border
        text-theme-muted-foreground
      "
    >
      {/* Left */}
      <div className="flex items-center gap-2 justify-self-start">
        {imageMeta && (
          <>
            <span>{imageMeta.name}</span>
            <span>•</span>
            <span>{imageMeta.size}</span>
          </>
        )}
      </div>

      {/* Center */}
      <div className="justify-self-center hidden md:flex items-center gap-1">
        <span>Hotkeys:</span>
        <kbd className="px-1 py-0.5 rounded bg-theme-secondary text-theme-foreground">
          Alt + /
        </kbd>
        <kbd className="px-1 py-0.5 rounded bg-theme-secondary text-theme-foreground">
          ⌘ + /
        </kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 justify-self-end">
        <span>{formatImageCount(imageCount)}</span>
        {selectedImage && (
          <>
            <span>•</span>
            <span className="text-theme-primary">
              {formatToolLabel(activeTool)}
            </span>
            <span>•</span>
            <span>{formatExportLabel(exportFormat)}</span>
          </>
        )}
      </div>
    </div>
  );
}
