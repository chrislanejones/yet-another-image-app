import { RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CropSettingsProps {
  onApplyCrop?: () => void;
  onRotate?: (deg: number) => void;
}

export function CropSettings({
  onApplyCrop,
  onRotate,
}: CropSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-theme-foreground">
        Crop & Rotate
      </h3>

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

      {onApplyCrop && (
        <Button
          onClick={onApplyCrop}
          className="w-full"
        >
          Apply Crop
        </Button>
      )}
    </div>
  );
}