import { useState } from "react";
import type { ToolSettings } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface BrushSettingsProps {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
}

const BRUSH_SIZE_PRESETS = [4, 8, 16, 32] as const;

const COLORS = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
] as const;

export function BrushSettings({
  settings,
  onChange,
}: BrushSettingsProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-theme-foreground">
        Brush & Stamp
      </h3>

      {/* Brush Size */}
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
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  active
                    ? "ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar"
                    : "hover:bg-theme-accent"
                }`}
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

      {/* Opacity */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Opacity
        </h3>

        <Slider
          value={settings.brushOpacity}
          onChange={(v) =>
            onChange({ ...settings, brushOpacity: v })
          }
          min={10}
          max={100}
          step={1}
        />

        <div className="text-xs text-theme-muted-foreground">
          {settings.brushOpacity}%
        </div>
      </div>

      {/* Color Picker */}
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
                className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                  active
                    ? "ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar"
                    : ""
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Brush color ${color}`}
              />
            );
          })}
        </div>
      </div>

      {/* Emoji Stamp */}
      <div className="space-y-3 pt-4 border-t border-theme-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-theme-foreground">
            Emoji Stamp
          </h3>

          {settings.emoji && (
            <button
              onClick={() =>
                onChange({ ...settings, emoji: undefined })
              }
              className="text-xs text-theme-muted-foreground hover:text-theme-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <button
          onClick={() => setEmojiOpen((v) => !v)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
            settings.emoji
              ? "bg-theme-primary text-theme-secondary ring-2 ring-theme-primary/50"
              : "bg-theme-accent hover:ring-2 hover:ring-theme-accent/50"
          }`}
        >
          <span className="text-lg">
            {settings.emoji ?? "😀"}
          </span>
          <span
            className={`text-xs ${
              settings.emoji
                ? "text-theme-primary-foreground/70"
                : "text-theme-muted-foreground"
            }`}
          >
            {settings.emoji ? "Active" : "Choose emoji"}
          </span>
        </button>

        {emojiOpen && (
          <div className="rounded-lg overflow-hidden border border-theme-border max-h-64 overflow-y-auto">
            <Picker
              data={data}
              onEmojiSelect={(e: any) => {
                onChange({
                  ...settings,
                  emoji: e.native,
                });
                setEmojiOpen(false);
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
    </div>
  );
}