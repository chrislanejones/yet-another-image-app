import { useState } from "react";
import type { ToolSettings } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const BRUSH_SIZE_PRESETS = [4, 8, 16, 32];
const OPACITY_PRESETS = [25, 50, 75, 100];

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

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */

interface BrushSettingsProps {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
}

/* ------------------------------------------------------------------ */
/* Brush Settings                                                     */
/* ------------------------------------------------------------------ */

export function BrushSettings({
  settings,
  onChange,
}: BrushSettingsProps) {
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
          {BRUSH_SIZE_PRESETS.map((size) => {
            const active = settings.brushSize === size;

            return (
              <button
                key={size}
                onClick={() =>
                  onChange({ ...settings, brushSize: size })
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
                aria-label={`Brush size ${size}`}
              >
                <span
                  className="rounded-full bg-theme-foreground"
                  style={{
                    width: size / 2,
                    height: size / 2,
                  }}
                />
              </button>
            );
          })}
        </div>

        <Slider
          value={settings.brushSize}
          onChange={(v) =>
            onChange({ ...settings, brushSize: v })
          }
          min={1}
          max={50}
          step={1}
        />

        <div className="text-xs text-theme-muted-foreground">
          {settings.brushSize}px
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Opacity                                                        */}
      {/* -------------------------------------------------------------- */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Opacity
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {OPACITY_PRESETS.map((value) => {
            const active = settings.brushOpacity === value;

            return (
              <button
                key={value}
                onClick={() =>
                  onChange({ ...settings, brushOpacity: value })
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
                {value}%
              </button>
            );
          })}
        </div>

        <Slider
          value={settings.brushOpacity}
          onChange={(v) =>
            onChange({ ...settings, brushOpacity: v })
          }
          min={10}
          max={100}
          step={5}
        />

        <div className="text-xs text-theme-muted-foreground">
          {settings.brushOpacity}%
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Color                                                          */}
      {/* -------------------------------------------------------------- */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Color
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color) => {
            const active = settings.brushColor === color;

            return (
              <button
                key={color}
                onClick={() =>
                  onChange({ ...settings, brushColor: color })
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
                aria-label={`Brush color ${color}`}
              />
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Emoji Stamp (BOTTOM OF PAINT TOOL)                             */}
      {/* -------------------------------------------------------------- */}
      <EmojiStamp
        settings={settings}
        onChange={onChange}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Emoji Stamp Component                                              */
/* ------------------------------------------------------------------ */

function EmojiStamp({
  settings,
  onChange,
}: {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3 pt-2 border-t border-theme-border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-theme-foreground">
          Emoji Stamp
        </h3>
        {settings.emoji && (
          <button
            onClick={() => onChange({ ...settings, emoji: undefined })}
            className="text-xs text-theme-muted-foreground hover:text-theme-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full
          flex
          items-center
          justify-between
          px-3
          py-2
          rounded-lg
          transition-colors
          ${settings.emoji
            ? "bg-theme-primary text-theme-primary-foreground"
            : "bg-theme-accent hover:bg-theme-muted"
          }
        `}
      >
        <span className="text-lg">
          {settings.emoji ?? "😀"}
        </span>
        <span className={`text-xs ${settings.emoji ? "text-theme-primary-foreground/70" : "text-theme-muted-foreground"}`}>
          {settings.emoji ? "Active" : "Choose emoji"}
        </span>
      </button>

      {open && (
        <div className="rounded-lg overflow-hidden border border-theme-border max-h-64 overflow-y-auto">
          <Picker
            data={data}
            onEmojiSelect={(e: any) => {
              onChange({
                ...settings,
                emoji: e.native,
              });
              setOpen(false);
            }}
            theme="dark"
            previewPosition="none"
            skinTonePosition="none"
            searchPosition="none"
            navPosition="none"
            perLine={6}
            maxFrequentRows={1}
          />
        </div>
      )}
    </div>
  );
}