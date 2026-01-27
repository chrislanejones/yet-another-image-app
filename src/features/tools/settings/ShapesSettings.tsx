import type { ToolSettings } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";

const SHAPES = [
  { id: "rect", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "handCircle", label: "Hand-drawn" },
  { id: "line", label: "Line" },
] as const;

const STROKE_WIDTH_PRESETS = [2, 4, 6, 8] as const;

type ShapeType = (typeof SHAPES)[number]["id"];

interface ShapesSettingsProps {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
}

export function ShapesSettings({
  settings,
  onChange,
}: ShapesSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-theme-foreground">
        Shape
      </h3>

      {/* Shape picker */}
      <div className="grid grid-cols-2 gap-2">
        {SHAPES.map((shape) => {
          const active = settings.shape === shape.id;

          return (
            <button
              key={shape.id}
              onClick={() =>
                onChange({
                  ...settings,
                  shape: shape.id as ShapeType,
                })
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
                  active
                    ? "bg-theme-primary text-theme-primary-foreground shadow-sm"
                    : "bg-theme-accent text-theme-foreground hover:bg-theme-muted"
                }
              `}
            >
              <ShapeIcon type={shape.id} />
              {shape.label}
            </button>
          );
        })}
      </div>

      {/* Stroke width */}
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
                    width: width * 2,
                    height: width * 2,
                  }}
                />
              </button>
            );
          })}
        </div>

        <Slider
          value={settings.strokeWidth}
          onChange={(v) =>
            onChange({ ...settings, strokeWidth: v })
          }
          min={1}
          max={10}
          step={1}
        />

        <div className="text-xs text-theme-muted-foreground">
          {settings.strokeWidth}px
        </div>
      </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ShapeIcon({ type }: { type: ShapeType }) {
  switch (type) {
    case "rect":
      return (
        <span className="inline-block w-4 h-4 border-2 border-current rounded-sm" />
      );
    case "circle":
      return (
        <span className="inline-block w-4 h-4 border-2 border-current rounded-full" />
      );
    case "handCircle":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2C7 2 3 7 3 12s4 9 9 9 9-4 9-9-4-10-9-10z" />
        </svg>
      );
    case "line":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="20" x2="20" y2="4" />
        </svg>
      );
  }
}