import type { ToolSettings } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";

interface ResizeSettingsProps {
  settings: ToolSettings;
  onSettingsChange: (settings: ToolSettings) => void;
  onResize?: () => void;
  imageWidth?: number;
  imageHeight?: number;
}

export function ResizeSettings({
  settings,
  onSettingsChange,
  onResize,
  imageWidth,
  imageHeight,
}: ResizeSettingsProps) {
  const handleWidthChange = (value: number) => {
    if (settings.keepAspect && imageWidth && imageHeight) {
      const ratio = imageHeight / imageWidth;
      onSettingsChange({
        ...settings,
        width: value,
        height: Math.round(value * ratio),
      });
    } else {
      onSettingsChange({ ...settings, width: value });
    }
  };

  const handleHeightChange = (value: number) => {
    if (settings.keepAspect && imageWidth && imageHeight) {
      const ratio = imageWidth / imageHeight;
      onSettingsChange({
        ...settings,
        height: value,
        width: Math.round(value * ratio),
      });
    } else {
      onSettingsChange({ ...settings, height: value });
    }
  };

  return (
    <div className="space-y-4">
      {/* Quality */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-theme-foreground">
          Quality
        </h3>
        <Slider
          value={settings.quality}
          onChange={(v) =>
            onSettingsChange({ ...settings, quality: v })
          }
          min={10}
          max={100}
          step={5}
        />
        <span className="text-xs text-theme-muted-foreground">
          {settings.quality}%
        </span>
      </div>

      {/* Dimensions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-theme-foreground">
          Dimensions
        </h3>

        <div className="flex items-center gap-2">
          <Switch
            checked={settings.keepAspect}
            onChange={(checked) =>
              onSettingsChange({
                ...settings,
                keepAspect: checked,
              })
            }
          />
          <span className="text-sm">Lock aspect ratio</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={settings.width}
            onChange={(e) =>
              handleWidthChange(Number(e.target.value))
            }
            className="w-full px-2 py-1.5 rounded-md bg-theme-accent border border-theme-border text-sm"
            min={1}
          />

          <input
            type="number"
            value={settings.height}
            onChange={(e) =>
              handleHeightChange(Number(e.target.value))
            }
            className="w-full px-2 py-1.5 rounded-md bg-theme-accent border border-theme-border text-sm"
            min={1}
          />
        </div>

        {onResize && (
          <button
            onClick={onResize}
            className="w-full mt-3 py-2 rounded-lg text-sm font-medium bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary/90 transition-colors"
          >
            Apply Resize
          </button>
        )}
      </div>
    </div>
  );
}