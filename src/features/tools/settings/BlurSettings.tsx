import type { ToolSettings } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";

const SIZE_PRESETS = [8, 16, 32, 64] as const;

interface BlurSettingsProps {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
}

export function BlurSettings({ settings, onChange }: BlurSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-theme-foreground">
        Blur & Redact
      </h3>

      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">
          Size
        </h4>
        <div className="flex items-center justify-between">
          {SIZE_PRESETS.map((size) => {
            const active = settings.blurSize === size;
            return (
              <button
                key={size}
                onClick={() => onChange({ ...settings, blurSize: size })}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition-all
                  ${active ? "ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar" : "hover:bg-theme-accent"}
                `}
                aria-label={`Blur size ${size}`}
              >
                <span
                  className="rounded-full bg-theme-foreground/50"
                  style={{
                    width: size / 2,
                    height: size / 2,
                    filter: "blur(2px)",
                  }}
                />
              </button>
            );
          })}
        </div>
        <Slider
          value={settings.blurSize}
          onChange={(v) => onChange({ ...settings, blurSize: v })}
          min={4}
          max={64}
          step={1}
        />
        <div className="text-xs text-theme-muted-foreground">
          {settings.blurSize}px
        </div>
      </div>

      {/* Intensity */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-theme-muted-foreground tracking-widest">
          Intensity
        </h4>
        <Slider
          value={settings.blurIntensity}
          onChange={(v) => onChange({ ...settings, blurIntensity: v })}
          min={1}
          max={20}
          step={1}
        />
        <div className="text-xs text-theme-muted-foreground">
          {settings.blurIntensity}px
        </div>
      </div>
    </div>
  );
}
