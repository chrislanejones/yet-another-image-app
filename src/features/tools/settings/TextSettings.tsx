import { Type } from "lucide-react";
import type { ToolSettings } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";

export interface TextMemory {
  id: number;
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  textColor: string;
}

interface TextSettingsProps {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
  recentTexts: TextMemory[];
  onSelectRecentText: (memory: TextMemory) => void;
}

const FONT_SIZE_PRESETS = [16, 32, 48, 72] as const;

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

// Helper to truncate text with ellipsis
function truncateText(text: string, maxLength: number = 12): string {
  if (!text) return "Empty";
  const firstLine = text.split("\n")[0] ?? "";
  if (firstLine.length <= maxLength) return firstLine || "Empty";
  return firstLine.slice(0, maxLength) + "...";
}

export function TextSettings({
  settings,
  onChange,
  recentTexts,
  onSelectRecentText,
}: TextSettingsProps) {
  // Pad to always show 3 slots
  const displaySlots = [...recentTexts].slice(0, 3);
  while (displaySlots.length < 3) {
    displaySlots.push(null as unknown as TextMemory);
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-theme-foreground">
        Text Tool
      </h3>

      {/* Font Size */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Font Size
        </h3>

        <div className="flex items-center justify-between">
          {FONT_SIZE_PRESETS.map((size) => {
            const active = settings.fontSize === size;

            return (
              <button
                key={size}
                onClick={() => onChange({ ...settings, fontSize: size })}
                className={`flex items-center justify-center w-10 h-10 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-theme-primary text-theme-secondary ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar"
                    : "bg-theme-accent hover:bg-theme-muted"
                }`}
                aria-label={`Font size ${size}`}
              >
                {size}
              </button>
            );
          })}
        </div>

        <Slider
          value={settings.fontSize}
          onChange={(v) => onChange({ ...settings, fontSize: v })}
          min={8}
          max={72}
          step={1}
        />

        <div className="text-xs text-theme-muted-foreground">
          {settings.fontSize}px
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Font Weight
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...settings, fontWeight: "normal" })}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
              settings.fontWeight === "normal"
                ? "bg-theme-primary text-theme-secondary ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar"
                : "bg-theme-accent hover:bg-theme-muted"
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => onChange({ ...settings, fontWeight: "bold" })}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
              settings.fontWeight === "bold"
                ? "bg-theme-primary text-theme-secondary ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar"
                : "bg-theme-accent hover:bg-theme-muted"
            }`}
          >
            Bold
          </button>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Text Color
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color) => {
            const active = settings.textColor === color;

            return (
              <button
                key={color}
                onClick={() => onChange({ ...settings, textColor: color })}
                className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                  active
                    ? "ring-2 ring-theme-ring ring-offset-2 ring-offset-theme-sidebar"
                    : ""
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Text color ${color}`}
              />
            );
          })}
        </div>
      </div>

      {/* Recent Text Memory Markers */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-theme-foreground">
          Recent Texts
        </h3>

        <div className="space-y-2">
          {displaySlots.map((memory, index) => (
            <button
              key={memory?.id ?? `empty-${index}`}
              onClick={() => memory && onSelectRecentText(memory)}
              disabled={!memory}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                memory
                  ? "bg-theme-primary text-theme-secondary hover:ring-2 hover:ring-theme-primary/50"
                  : "bg-theme-accent text-theme-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              <Type className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium truncate">
                {memory ? truncateText(memory.text) : "Empty slot"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
