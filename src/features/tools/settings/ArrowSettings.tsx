import { MoveRight, MoveHorizontal } from "lucide-react";
import type { ToolSettings } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */



const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#000000",
];

const STROKE_WIDTH_PRESETS = [2, 4, 6, 8] as const;

/* ------------------------------------------------------------------ */
/* Arrow Settings                                                     */
/* ------------------------------------------------------------------ */

export function ArrowSettings({
  settings,
  onChange,
}: {
  settings: ToolSettings;
  onChange: (s: ToolSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-theme-foreground">
        Arrow & Pointer
      </h3>

     {/* Stroke width */}
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <label className="text-xs text-theme-muted-foreground">
      Stroke width
    </label>
    <span className="text-xs font-medium text-theme-foreground">
      {settings.strokeWidth}px
    </span>
  </div>

  {/* Presets */}
  <div className="flex items-center justify-between">
    {STROKE_WIDTH_PRESETS.map((width) => {
      const active = settings.strokeWidth === width;

      return (
        <button
          key={width}
          onClick={() =>
            onChange({ ...settings, strokeWidth: width })
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
          aria-label={`Stroke width ${width}`}
        >
          <span
            className="rounded-full bg-theme-foreground"
            style={{
              width: width,
              height: width,
            }}
          />
        </button>
      );
    })}
  </div>

  {/* Slider */}
  <Slider
    value={settings.strokeWidth}
    onChange={(v) =>
      onChange({ ...settings, strokeWidth: v })
    }
    min={1}
    max={10}
    step={1}
  />
</div>

      {/* ------------------------------------------------------------ */}
      {/* Arrow Style                                                  */}
      {/* ------------------------------------------------------------ */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Arrow Style
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              onChange({ ...settings, arrowStyle: "single" })
            }
            className={`
              flex
              items-center
              justify-center
              gap-2
              py-3
              rounded-lg
              text-sm
              font-medium
              transition-all
              ${
                settings.arrowStyle === "single"
                  ? "bg-theme-primary text-theme-secondary ring-2 ring-theme-primary/50"
                  : "bg-theme-accent text-theme-foreground hover:ring-2 hover:ring-theme-accent/50"
              }
            `}
          >
            <MoveRight className="h-5 w-5" />
            Single
          </button>

          <button
            onClick={() =>
              onChange({ ...settings, arrowStyle: "double" })
            }
            className={`
              flex
              items-center
              justify-center
              gap-2
              py-3
              rounded-lg
              text-sm
              font-medium
              transition-all
              ${
                settings.arrowStyle === "double"
                  ? "bg-theme-primary text-theme-secondary ring-2 ring-theme-primary/50"
                  : "bg-theme-accent text-theme-foreground hover:ring-2 hover:ring-theme-accent/50"
              }
            `}
          >
            <MoveHorizontal className="h-5 w-5" />
            Double
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Color                                                        */}
      {/* ------------------------------------------------------------ */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Color
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color) => {
            const active = settings.strokeColor === color;

            return (
              <button
                key={color}
                onClick={() =>
                  onChange({ ...settings, strokeColor: color })
                }
                className={`
                  w-8
                  h-8
                  rounded-lg
                  transition-transform
                  hover:scale-110
                  ${
                    active
                      ? "ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar"
                      : ""
                  }
                `}
                style={{ backgroundColor: color }}
                aria-label={`Arrow color ${color}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
