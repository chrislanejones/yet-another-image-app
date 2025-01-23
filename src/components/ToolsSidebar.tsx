import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { slideFromLeft } from "@/lib/animations";
import type { ToolSettings, ToolType, User } from "@/lib/types";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  X,
  Shrink,
  Crop,
  Paintbrush,
  TypeIcon,
  ArrowUpRight,
  MoveHorizontal,
  Undo,
  Redo,
  Sparkles,
  Shapes,
} from "@/components/icons";

const user: User = {
  name: "Chris Lane Jones",
  email: "chris@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
};

const tools = [
  // Row 1
  {
    id: "compress" as const,
    label: "Resize",
    description: "Resize & optimize images",
    icon: Shrink,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "crop" as const,
    label: "Crop",
    description: "Crop & trim images",
    icon: Crop,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "brush" as const,
    label: "Paint",
    description: "Freehand drawing",
    icon: Paintbrush,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "text" as const,
    label: "Text",
    description: "Add text annotations",
    icon: TypeIcon,
    gradient: "from-amber-400 to-orange-500",
  },
  // Row 2
  {
    id: "arrow" as const,
    label: "Arrows",
    description: "Point & highlight areas",
    icon: ArrowUpRight,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "ai" as const,
    label: "AI",
    description: "AI-powered tools",
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "shapes" as const,
    label: "Shapes",
    description: "Add geometric shapes",
    icon: Shapes,
    gradient: "from-pink-500 to-rose-500",
  },
];

const brushColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
  "#000000",
];

interface ToolsSidebarProps {
  onClose: () => void;
  settings: ToolSettings;
  onSettingsChange: (settings: ToolSettings) => void;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function ToolsSidebar({
  onClose,
  settings,
  onSettingsChange,
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolsSidebarProps) {
  return (
    <motion.div
      variants={slideFromLeft}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed left-3 top-3 bottom-12 z-50 w-72 rounded-xl bg-theme-sidebar backdrop-blur-md overflow-hidden border border-theme-sidebar-border"
    >
      <div className="flex h-full flex-col text-theme-sidebar-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-sidebar-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-theme-chart4">
              <Paintbrush className="h-4 w-4" />
            </span>
            Toolbar
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors text-theme-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tool Selector */}
        <div className="p-4 border-b border-theme-sidebar-border">
          <div className="grid grid-cols-4 gap-3">
            {tools.map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onToolChange(tool.id)}
                      className={`relative p-0.5 rounded-xl transition-all ${
                        isActive
                          ? "ring-2 ring-theme-ring ring-offset-1 ring-offset-theme-sidebar"
                          : ""
                      }`}
                    >
                      <span
                        className={`flex h-12 w-full aspect-square items-center justify-center rounded-xl bg-linear-to-br ${tool.gradient} shadow-lg transition-transform hover:scale-105 ${
                          isActive ? "scale-105" : ""
                        }`}
                      >
                        <tool.icon className="h-6 w-6 text-white" />
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    <p className="font-medium">{tool.label}</p>
                    <p className="text-muted-foreground">{tool.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Tool Settings */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTool === "compress" && (
            <CompressSettings settings={settings} onSettingsChange={onSettingsChange} />
          )}
          {activeTool === "crop" && <CropSettings />}
          {activeTool === "brush" && (
            <BrushSettings settings={settings} onSettingsChange={onSettingsChange} />
          )}
          {activeTool === "text" && (
            <TextSettings settings={settings} onSettingsChange={onSettingsChange} />
          )}
          {activeTool === "arrow" && (
            <ArrowSettings settings={settings} onSettingsChange={onSettingsChange} />
          )}
          {activeTool === "ai" && <AISettings />}
          {activeTool === "shapes" && <ShapesSettings />}
        </div>

        {/* Undo/Redo Section */}
        <div className="p-4 border-t border-theme-sidebar-border">
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                canUndo
                  ? "bg-theme-accent text-theme-foreground hover:bg-theme-muted"
                  : "bg-theme-accent/50 text-theme-muted-foreground cursor-not-allowed"
              }`}
            >
              <Undo className="h-4 w-4" />
              Undo
              <kbd className="text-xs px-1.5 rounded bg-theme-primary text-black">Z</kbd>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                canRedo
                  ? "bg-theme-accent text-theme-foreground hover:bg-theme-muted"
                  : "bg-theme-accent/50 text-theme-muted-foreground cursor-not-allowed"
              }`}
            >
              <Redo className="h-4 w-4" />
              Redo
              <kbd className="text-xs px-1.5 rounded bg-theme-primary text-black">X</kbd>
            </button>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-theme-sidebar-border">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-full bg-theme-accent"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="truncate text-xs text-theme-muted-foreground">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface SettingsProps {
  settings: ToolSettings;
  onSettingsChange: (settings: ToolSettings) => void;
}

function CompressSettings({ settings, onSettingsChange }: SettingsProps) {
  return (
    <div className="space-y-4">
      <SettingSection title="Quality">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-sidebar-foreground">Compression</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-theme-accent text-theme-foreground">
              {settings.quality}%
            </span>
          </div>
          <Slider
            value={settings.quality}
            onChange={(v) => onSettingsChange({ ...settings, quality: v })}
            min={10}
            max={100}
          />
          <p className="text-xs text-theme-muted-foreground">Lower value = smaller file size</p>
        </div>
      </SettingSection>

      <SettingSection title="Dimensions">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-lg bg-theme-accent/50">
            <label className="text-sm text-theme-sidebar-foreground">Lock aspect ratio</label>
            <Switch
              checked={settings.keepAspect}
              onChange={(v) => onSettingsChange({ ...settings, keepAspect: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-theme-muted-foreground">Width</label>
                <span className="text-xs font-medium text-theme-foreground">{settings.width}%</span>
              </div>
              <Slider
                value={settings.width}
                onChange={(v) =>
                  onSettingsChange({
                    ...settings,
                    width: v,
                    height: settings.keepAspect ? v : settings.height,
                  })
                }
                min={10}
                max={200}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-theme-muted-foreground">Height</label>
                <span className="text-xs font-medium text-theme-foreground">{settings.height}%</span>
              </div>
              <Slider
                value={settings.height}
                onChange={(v) =>
                  onSettingsChange({
                    ...settings,
                    height: v,
                    width: settings.keepAspect ? v : settings.width,
                  })
                }
                min={10}
                max={200}
              />
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}

function BrushSettings({ settings, onSettingsChange }: SettingsProps) {
  return (
    <div className="space-y-4">
      <SettingSection title="Brush">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full border-2 border-theme-border flex-shrink-0"
              style={{
                width: Math.max(16, Math.min(40, settings.brushSize)),
                height: Math.max(16, Math.min(40, settings.brushSize)),
                backgroundColor: settings.brushColor,
                opacity: settings.brushOpacity / 100,
              }}
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-theme-muted-foreground">Size</label>
                <span className="text-xs font-medium text-theme-foreground">{settings.brushSize}px</span>
              </div>
              <Slider
                value={settings.brushSize}
                onChange={(v) => onSettingsChange({ ...settings, brushSize: v })}
                min={1}
                max={50}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-theme-muted-foreground">Opacity</label>
              <span className="text-xs font-medium text-theme-foreground">{settings.brushOpacity}%</span>
            </div>
            <Slider
              value={settings.brushOpacity}
              onChange={(v) => onSettingsChange({ ...settings, brushOpacity: v })}
              min={10}
              max={100}
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Color">
        <ColorPicker
          value={settings.brushColor}
          onChange={(color) => onSettingsChange({ ...settings, brushColor: color })}
        />
      </SettingSection>
    </div>
  );
}

function TextSettings({ settings, onSettingsChange }: SettingsProps) {
  return (
    <div className="space-y-4">
      <SettingSection title="Typography">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-theme-muted-foreground">Font Size</label>
              <span className="text-xs font-medium text-theme-foreground">{settings.fontSize}px</span>
            </div>
            <Slider
              value={settings.fontSize}
              onChange={(v) => onSettingsChange({ ...settings, fontSize: v })}
              min={12}
              max={72}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-theme-muted-foreground">Weight</label>
            <div className="grid grid-cols-2 gap-2">
              {(["normal", "bold"] as const).map((weight) => (
                <button
                  key={weight}
                  onClick={() => onSettingsChange({ ...settings, fontWeight: weight })}
                  className={`py-2.5 rounded-lg text-sm transition-all ${
                    settings.fontWeight === weight
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white font-medium shadow-lg"
                      : "bg-theme-accent text-theme-foreground hover:bg-theme-muted"
                  }`}
                >
                  <span style={{ fontWeight: weight === "bold" ? 700 : 400 }}>
                    {weight === "bold" ? "Bold" : "Regular"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Color">
        <ColorPicker
          value={settings.textColor}
          onChange={(color) => onSettingsChange({ ...settings, textColor: color })}
        />
      </SettingSection>
    </div>
  );
}

function ArrowSettings({ settings, onSettingsChange }: SettingsProps) {
  const arrowTypes = [
    { id: "single" as const, label: "Single", icon: ArrowUpRight },
    { id: "double" as const, label: "Double", icon: MoveHorizontal },
  ];

  return (
    <div className="space-y-4">
      <SettingSection title="Arrow Style">
        <div className="space-y-4">
          {/* Arrow preview */}
          <div className="flex items-center justify-center p-4 rounded-lg bg-theme-accent/50">
            <svg width="120" height="40" viewBox="0 0 120 40">
              <defs>
                <marker
                  id="arrowhead-end-preview"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={settings.strokeColor}
                    stroke={settings.strokeColor}
                    strokeWidth="1"
                  />
                </marker>
                <marker
                  id="arrowhead-start-preview"
                  markerWidth="10"
                  markerHeight="7"
                  refX="1"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="10 0, 0 3.5, 10 7"
                    fill={settings.strokeColor}
                    stroke={settings.strokeColor}
                    strokeWidth="1"
                  />
                </marker>
              </defs>
              <line
                x1="10"
                y1="20"
                x2="100"
                y2="20"
                stroke={settings.strokeColor}
                strokeWidth={settings.strokeWidth}
                markerEnd="url(#arrowhead-end-preview)"
                markerStart={settings.arrowStyle === "double" ? "url(#arrowhead-start-preview)" : undefined}
              />
            </svg>
          </div>

          {/* Arrow type toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-theme-muted">
            {arrowTypes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onSettingsChange({ ...settings, arrowStyle: id })}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  settings.arrowStyle === id
                    ? "bg-theme-accent text-theme-foreground"
                    : "text-theme-muted-foreground hover:text-theme-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-theme-muted-foreground">Thickness</label>
              <span className="text-xs font-medium text-theme-foreground">{settings.strokeWidth}px</span>
            </div>
            <Slider
              value={settings.strokeWidth}
              onChange={(v) => onSettingsChange({ ...settings, strokeWidth: v })}
              min={1}
              max={20}
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Color">
        <ColorPicker
          value={settings.strokeColor}
          onChange={(color) => onSettingsChange({ ...settings, strokeColor: color })}
        />
      </SettingSection>
    </div>
  );
}

function CropSettings() {
  return (
    <div className="space-y-4">
      <SettingSection title="Crop Options">
        <p className="text-sm text-theme-muted-foreground">
          Click and drag on the image to select the area you want to keep.
        </p>
        <div className="space-y-2">
          <p className="text-xs text-theme-muted-foreground">Aspect Ratio</p>
          <div className="grid grid-cols-3 gap-2">
            {["Free", "1:1", "16:9"].map((ratio) => (
              <button
                key={ratio}
                disabled
                className="py-2 rounded-lg text-xs font-medium bg-theme-accent text-theme-muted-foreground cursor-not-allowed opacity-60"
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </SettingSection>
    </div>
  );
}

function ShapesSettings() {
  return (
    <div className="space-y-4">
      <SettingSection title="Shape Type">
        <p className="text-sm text-theme-muted-foreground">
          Select a shape and click on the image to add it.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["Rectangle", "Circle", "Line"].map((shape) => (
            <button
              key={shape}
              disabled
              className="py-2 rounded-lg text-xs font-medium bg-theme-accent text-theme-muted-foreground cursor-not-allowed opacity-60"
            >
              {shape}
            </button>
          ))}
        </div>
      </SettingSection>
      <SettingSection title="Style">
        <div className="space-y-2">
          <p className="text-xs text-theme-muted-foreground">Fill & Stroke options coming soon</p>
        </div>
      </SettingSection>
    </div>
  );
}

function AISettings() {
  return (
    <div className="space-y-4">
      <SettingSection title="AI Tools">
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-theme-accent text-theme-muted-foreground cursor-not-allowed opacity-60"
        >
          Remove Background
        </button>
      </SettingSection>
    </div>
  );
}

function SettingSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-theme-muted-foreground flex items-center gap-2">
        <span className="w-1 h-3 rounded-full bg-gradient-to-b from-theme-primary to-theme-primary/50" />
        {title}
      </h3>
      {children}
    </div>
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {brushColors.map((color) => {
          const isSelected = value === color;
          const isLight = color === "#ffffff";
          return (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`relative aspect-square rounded-lg transition-all hover:scale-110 ${
                isSelected ? "ring-2 ring-offset-2 ring-offset-theme-sidebar ring-theme-ring scale-110" : ""
              } ${isLight ? "border border-theme-border" : ""}`}
              style={{ backgroundColor: color }}
            >
              {isSelected && (
                <span className={`absolute inset-0 flex items-center justify-center ${isLight ? "text-gray-800" : "text-white"}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg border border-theme-border"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-theme-accent border border-theme-border text-theme-foreground font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
