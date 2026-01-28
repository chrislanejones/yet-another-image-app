import { motion } from "framer-motion";
import {
  X,
  Download,
  Undo,
  Redo,
  Wrench,
} from "lucide-react";

import { slideFromLeft } from "@/lib/animations";
import type { ToolSettings, ToolType } from "@/lib/types";
import type { ExportFormat } from "@/components/ui/select";
import { Select } from "@/components/ui/select";

import { ToolGrid } from "./ToolGrid";
import {
  ResizeSettings,
  BrushSettings,
  ArrowSettings,
  CropSettings,
  ShapesSettings,
  BlurSettings,
  AISettings,
  TextSettings,
} from "./settings";
import type { TextMemory } from "./settings/TextSettings";

const user = {
  name: "Chris Lane Jones",
  email: "chris@example.com",
  avatar: "https://api.dicebear.com/9.x/miniavs/svg?seed=Jack",
};

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */

interface ToolsSidebarProps {
  onClose: () => void;
  settings: ToolSettings;
  onSettingsChange: (s: ToolSettings) => void;
  activeTool: ToolType;
  onToolChange: (t: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  exportFormat: ExportFormat;
  onExportFormatChange: (f: ExportFormat) => void;
  onExport: () => void;
  hasSelectedImage: boolean;
  onResize: () => void;
  onApplyCrop: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  imageWidth?: number | undefined;
  imageHeight?: number | undefined;
  originalSize?: number | undefined;
  showKbdHints: boolean;
  isCompareMode: boolean;
  onCompareToggle: (val: boolean) => void;
  recentTexts: TextMemory[];
  onSelectRecentText: (memory: TextMemory) => void;
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                            */
/* ------------------------------------------------------------------ */

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
  exportFormat,
  onExportFormatChange,
  onExport,
  hasSelectedImage,
  onResize,
  onApplyCrop,
  onFlipHorizontal,
  onFlipVertical,
  imageWidth,
  imageHeight,
  originalSize,
  showKbdHints,
  recentTexts,
  onSelectRecentText,
}: ToolsSidebarProps) {
  const handleRotate = (deg: number) => {
    onSettingsChange({
      ...settings,
      rotation: (settings.rotation + deg) % 360,
    });
  };

  return (
    <motion.div
      variants={slideFromLeft}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="
        fixed
        left-3
        top-3
        bottom-12
        z-40
        w-74
        rounded-xl
        bg-theme-sidebar
        border
        border-theme-sidebar-border
        flex
        flex-col
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme-sidebar-border">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Wrench className="h-4 w-4" />
          Tools
        </h2>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-theme-sidebar-accent transition-colors"
          aria-label="Close tools"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tool Grid */}
      <div className="p-4 border-b border-theme-sidebar-border">
        <ToolGrid
          activeTool={activeTool}
          onToolChange={onToolChange}
        />
      </div>

     {/* Tool Panels */}
<div className="flex-1 overflow-y-auto p-4 space-y-4">
  {activeTool === "compress" && (
     <ResizeSettings
     settings={settings}
     onSettingsChange={onSettingsChange}
     onResize={onResize}
     imageWidth={imageWidth}
     imageHeight={imageHeight}
     originalSize={originalSize}
   />
  )}

  {activeTool === "crop" && (
    <CropSettings
      onRotate={handleRotate}
      onApplyCrop={onApplyCrop}
      onFlipHorizontal={onFlipHorizontal}
      onFlipVertical={onFlipVertical}
    />
  )}

  {activeTool === "brush" && (
    <BrushSettings
      settings={settings}
      onChange={onSettingsChange}
    />
  )}

  {activeTool === "arrow" && (
    <ArrowSettings
      settings={settings}
      onChange={onSettingsChange}
    />
  )}
  {activeTool === "shapes" && (
    <ShapesSettings
      settings={settings}
      onChange={onSettingsChange}
    />
  )}
  {activeTool === "blur" && (
    <BlurSettings
      settings={settings}
      onChange={onSettingsChange}
    />
  )}
  {activeTool === "text" && (
    <TextSettings
      settings={settings}
      onChange={onSettingsChange}
      recentTexts={recentTexts}
      onSelectRecentText={onSelectRecentText}
    />
  )}
  {activeTool === "ai" && (
   <AISettings
   settings={settings}
   onApplyImage={(blob) => {
     const url = URL.createObjectURL(blob);
 
     window.dispatchEvent(
       new CustomEvent("replace-active-image", {
         detail: { blob, url },
       }),
     );
   }}
 />
  )}
</div>

      {/* Export */}
      <div className="p-4 border-t border-theme-sidebar-border space-y-2">
        <Select
          value={exportFormat}
          onValueChange={onExportFormatChange}
        />

        <button
          onClick={onExport}
          disabled={!hasSelectedImage}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            py-2
            rounded-lg
            text-sm
            font-medium
            bg-theme-primary
            text-theme-secondary
            hover:ring-2
            hover:ring-theme-primary/50
            hover:ring-offset-2
            hover:ring-offset-theme-sidebar
            transition-all
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Undo / Redo — GLOBAL */}
      <div className="p-4 border-t border-theme-sidebar-border">
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              py-2
              rounded-lg
              text-sm
              font-medium
              bg-theme-accent
              hover:bg-theme-muted
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <Undo className="h-4 w-4" />
            Undo
            {showKbdHints && (
              <kbd className="bg-theme-secondary text-theme-foreground text-xs px-1.5 rounded">
                Alt Z
              </kbd>
            )}
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              py-2
              rounded-lg
              text-sm
              font-medium
              bg-theme-accent
              hover:bg-theme-muted
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <Redo className="h-4 w-4" />
            Redo
            {showKbdHints && (
              <kbd className="bg-theme-secondary text-theme-foreground text-xs px-1.5 rounded">
                Alt X
              </kbd>
            )}
          </button>
        </div>
      </div>
      {/* User Section */}
<div className="p-2 border-t border-theme-sidebar-border">
  <div className="flex items-center gap-3">
    <img
      src={user.avatar}
      alt={user.name}
      className="h-10 w-10 rounded-full bg-theme-accent"
    />
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium text-theme-sidebar-foreground">
        {user.name}
      </div>
      <div className="truncate text-xs text-theme-muted-foreground">
        {user.email}
      </div>
    </div>
  </div>
</div>
    </motion.div>
  );
}