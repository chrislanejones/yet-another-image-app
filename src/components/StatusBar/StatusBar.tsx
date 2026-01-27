import type { ImageData, ToolType } from "@/lib/types";
import {
  formatImageCount,
  formatToolLabel,
  formatExportLabel,
  getImageMeta,
} from "./formatters";

interface StatusBarProps {
  selectedImage?: ImageData;
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
    <div className="fixed bottom-0 left-0 right-0 h-9 px-4 flex items-center justify-between text-xs bg-theme-card/80 backdrop-blur-sm border-t border-theme-border text-theme-muted-foreground">
      <div className="flex items-center gap-2">
        {imageMeta && (
          <>
            <span>{imageMeta.name}</span>
            <span>•</span>
            <span>{imageMeta.size}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
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