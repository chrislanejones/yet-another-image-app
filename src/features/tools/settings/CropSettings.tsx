import { RotateCcw, RotateCw, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ToolSettings } from "@/lib/types";

interface CropSettingsProps {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
  onApplyCrop?: () => void;
  onRotate?: (deg: number) => void;
}

export function CropSettings({
  settings,
  onChange,
  onApplyCrop,
  onRotate,
}: CropSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-theme-foreground">
        Crop & Rotate
      </h3>

      {/* Crop */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={onApplyCrop}
      >
        <Crop className="h-4 w-4" />
        Crop Selection
      </Button>

      {/* Rotate */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => onRotate?.(-90)}
        >
          <RotateCcw className="h-4 w-4" />
          Rotate Left
        </Button>

        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => onRotate?.(90)}
        >
          <RotateCw className="h-4 w-4" />
          Rotate Right
        </Button>
      </div>

      <p className="text-xs text-theme-muted-foreground">
        Rotation applies instantly. Crop selection coming next.
      </p>
    </div>
  );
}