import type { ToolSettings } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const SIZE_PRESETS = [8, 16, 32, 48];
const INTENSITY_PRESETS = [2, 4, 8, 12];

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */

interface BlurSettingsProps {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
}

/* ------------------------------------------------------------------ */
/* Blur Settings                                                      */
/* ------------------------------------------------------------------ */

export function BlurSettings({
  settings,
  onChange,
}: BlurSettingsProps) {
  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------- */}
      {/* Brush Size                                                     */}
      {/* -------------------------------------------------------------- */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Brush Size
        </h3>

        <div className="flex items-center justify-between">
          {SIZE_PRESETS.map((size) => {
            const active = settings.blurSize === size;

            return (
              <button
                key={size}
                onClick={() =>
                  onChange({ ...settings, blurSize: size })
                }
                className={`
                  flex
                  items-center
                  justify-center
                  w-10
                  h-10
                  rounded-full
                  transition-all
                  ${
                    active
                      ? "ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar"
                      : "hover:bg-theme-accent"
                  }
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
          onChange={(v) =>
            onChange({ ...settings, blurSize: v })
          }
          min={4}
          max={64}
          step={1}
        />

        <div className="text-xs text-theme-muted-foreground">
          {settings.blurSize}px
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Blur Intensity                                                 */}
      {/* -------------------------------------------------------------- */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Intensity
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {INTENSITY_PRESETS.map((value) => {
            const active = settings.blurIntensity === value;

            return (
              <button
                key={value}
                onClick={() =>
                  onChange({ ...settings, blurIntensity: value })
                }
                className={`
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                  transition-colors
                  ${
                    active
                      ? "bg-theme-primary text-theme-primary-foreground"
                      : "bg-theme-accent text-theme-foreground hover:bg-theme-muted"
                  }
                `}
              >
                {value}px
              </button>
            );
          })}
        </div>

        <Slider
          value={settings.blurIntensity}
          onChange={(v) =>
            onChange({ ...settings, blurIntensity: v })
          }
          min={1}
          max={20}
          step={1}
        />

        <div className="text-xs text-theme-muted-foreground">
          {settings.blurIntensity}px blur radius
        </div>
      </div>
    </div>
  );
}
