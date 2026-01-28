import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CropSettingsProps {
  onApplyCrop?: () => void;
  onRotate?: (deg: number) => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
}

export function CropSettings({
  onApplyCrop,
  onRotate,
  onFlipHorizontal,
  onFlipVertical,
}: CropSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-theme-foreground">
        Crop & Transform
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

        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => onFlipHorizontal?.()}
        >
          <FlipHorizontal className="h-4 w-4" />
          Flip H
        </Button>

        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => onFlipVertical?.()}
        >
          <FlipVertical className="h-4 w-4" />
          Flip V
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