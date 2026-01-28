// ===== FILE: src/features/tools/settings/ResizeSettings.tsx =====
import type { ToolSettings } from "@/lib/types";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/Slider";

// ===== FILE: src/features/tools/settings/ResizeSettings.tsx =====

interface ResizeSettingsProps {
  settings: ToolSettings;
  onSettingsChange: (settings: ToolSettings) => void;
  onResize?: () => void;
  imageWidth?: number | undefined;
  imageHeight?: number | undefined;
  originalSize?: number | undefined;
}

export function ResizeSettings({
  settings,
  onSettingsChange,
  onResize,
  imageWidth = 1,
  imageHeight = 1,
}: ResizeSettingsProps) {
  // ... rest of the component logic ...

  
  const handleWidthChange = (value: number) => {
    if (settings.keepAspect) {
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
    if (settings.keepAspect) {
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

  // Math for the optimization gain
  const originalArea = imageWidth * imageHeight;
  const newArea = settings.width * settings.height;
  const areaRatio = newArea / originalArea;
  const qualityRatio = settings.quality / 100;
  
  const savingsPercent = Math.max(0, Math.round((1 - areaRatio * qualityRatio) * 100));
  
  // Lighthouse Score logic (Higher is better)
  const scoreBase = (areaRatio * qualityRatio);
  const lighthouseScore = Math.min(100, Math.max(0, Math.round(100 - (scoreBase * 50))));

  const getTrafficColor = (value: number) => {
    if (value >= 80) return "bg-emerald-500";
    if (value >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-medium text-theme-foreground">
        Resize & Compress
      </h3>

      {/* 1. Dimensions Box */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">Dimensions</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={settings.width}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-theme-accent border border-theme-border text-sm"
          />
          <input
            type="number"
            value={settings.height}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-theme-accent border border-theme-border text-sm"
          />
        </div>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-theme-muted/20">
          <Switch
            checked={settings.keepAspect}
            onChange={(checked) => onSettingsChange({ ...settings, keepAspect: checked })}
          />
          <span className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">Lock Aspect</span>
        </div>
      </div>

      {/* 2. Quality */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">Quality</h3>
          <span className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">{settings.quality}%</span>
        </div>
        <Slider
          value={settings.quality}
          onChange={(v) => onSettingsChange({ ...settings, quality: v })}
          min={10}
          max={100}
        />
      </div>

      {/* 3. Performance Gain */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">Performance Gain</h3>
          <span className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">+{savingsPercent}%</span>
        </div>
        <div className="h-2 w-full bg-theme-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out ${getTrafficColor(savingsPercent)}`}
            style={{ width: `${savingsPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Lighthouse Score */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">Lighthouse Score</h3>
          <span className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">{lighthouseScore}%</span>
        </div>
        <div className="h-2 w-full bg-theme-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out ${getTrafficColor(lighthouseScore)}`}
            style={{ width: `${lighthouseScore}%` }}
          />
        </div>
      </div>

      {onResize && (
        <Button onClick={onResize} className="w-full bg-theme-primary">
          Resize
        </Button>
      )}
    </div>
  );
}