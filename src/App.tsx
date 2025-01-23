import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import type { ImageData, ToolSettings, ToolType } from "@/lib/types";
import { UploadDialog } from "@/components/UploadDialog";
import { ImageGalleryBar } from "@/components/ImageGalleryBar";
import { ToolsSidebar } from "@/components/ToolsSidebar";
import { TopBar } from "@/components/TopBar";
import { AnnotationCanvas, type AnnotationCanvasRef } from "@/components/AnnotationCanvas";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ImageIcon,
  Upload,
  Download,
  Undo,
  Redo,
  Trash2,
} from "@/components/icons";

const defaultSettings: ToolSettings = {
  quality: 75,
  keepAspect: true,
  width: 100,
  height: 100,
  brushSize: 5,
  brushOpacity: 100,
  brushColor: "#ef4444",
  fontSize: 24,
  fontWeight: "normal",
  textColor: "#ffffff",
  strokeWidth: 3,
  strokeColor: "#3b82f6",
  arrowStyle: "single",
};

export default function PhotoAnnotationApp() {
  const [showUpload, setShowUpload] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showKbdHints, setShowKbdHints] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<ToolType>("compress");
  const [zoom, setZoom] = useState(100);
  const [settings, setSettings] = useState<ToolSettings>(defaultSettings);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const canvasRef = useRef<AnnotationCanvasRef>(null);

  const selectedImage = images[selectedIndex];

  const handleDeleteAll = useCallback(() => {
    setImages([]);
    setSelectedIndex(0);
    setShowDeleteAllDialog(false);
  }, []);

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    canvasRef.current?.redo();
  }, []);

  const handleHistoryChange = useCallback((newCanUndo: boolean, newCanRedo: boolean) => {
    setCanUndo(newCanUndo);
    setCanRedo(newCanRedo);
  }, []);

  const handleDownloadJpeg = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas || !selectedImage) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = selectedImage.name.replace(/\.[^.]+$/, "") + ".jpg";
        a.click();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.92
    );
  }, [selectedImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Alt + key (Windows/Linux) or Cmd + key (Mac) combinations
      const modifierPressed = e.altKey || e.metaKey;
      if (modifierPressed) {
        switch (e.key.toLowerCase()) {
          case "u":
            e.preventDefault();
            setShowUpload((prev) => {
              if (!prev) {
                setShowTools(false);
                setShowGallery(false);
              }
              return !prev;
            });
            break;
          case "i":
            e.preventDefault();
            setShowGallery((prev) => {
              if (!prev) setShowUpload(false);
              return !prev;
            });
            break;
          case "s":
            e.preventDefault();
            setShowTools((prev) => !prev);
            break;
          case "/":
            e.preventDefault();
            setShowKbdHints((prev) => !prev);
            break;
          case "-":
            e.preventDefault();
            setZoom((z) => Math.max(25, z - 25));
            break;
          case "=":
          case "+":
            e.preventDefault();
            setZoom((z) => Math.min(200, z + 25));
            break;
          case "z":
            e.preventDefault();
            handleUndo();
            break;
          case "x":
            e.preventDefault();
            handleRedo();
            break;
        }
        return;
      }

      // Non-modifier keys
      if (e.key === "Escape") {
        setShowUpload(false);
        setShowGallery(false);
        setShowTools(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleImagesAdd = (newImages: ImageData[]) => {
    setImages((prev) => [...prev, ...newImages]);
    if (images.length === 0) setSelectedIndex(0);
  };

  const handleDelete = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex >= images.length - 1) {
      setSelectedIndex(Math.max(0, images.length - 2));
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col pb-9 bg-theme-background text-theme-foreground">
      <UploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onImagesAdd={handleImagesAdd}
      />

      <AnimatePresence>
        {showGallery && (
          <ImageGalleryBar
            images={images}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onClose={() => setShowGallery(false)}
            onDelete={handleDelete}
            showTools={showTools}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTools && (
          <ToolsSidebar
            onClose={() => setShowTools(false)}
            settings={settings}
            onSettingsChange={setSettings}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        )}
      </AnimatePresence>

      {/* Main content area with padding */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          showTools ? "ml-80" : ""
        } ${showGallery ? "pb-52" : ""} p-3`}
      >
        {/* Top Bar */}
        <TopBar
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(200, z + 25))}
          onZoomOut={() => setZoom((z) => Math.max(25, z - 25))}
          showUpload={showUpload}
          showGallery={showGallery}
          showTools={showTools}
          showKbdHints={showKbdHints}
          onToggleUpload={() => {
            setShowUpload((prev) => {
              if (!prev) {
                setShowTools(false);
                setShowGallery(false);
              }
              return !prev;
            });
          }}
          onToggleGallery={() => {
            setShowGallery((prev) => {
              if (!prev) setShowUpload(false);
              return !prev;
            });
          }}
          onToggleTools={() => setShowTools((prev) => !prev)}
          hasSelectedImage={!!selectedImage}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          {selectedImage ? (
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div
                  className="relative rounded-lg shadow-2xl overflow-hidden bg-theme-card"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "center",
                  }}
                >
                  <AnnotationCanvas
                    ref={canvasRef}
                    image={selectedImage}
                    tool={activeTool}
                    settings={settings}
                    onHistoryChange={handleHistoryChange}
                  />
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={handleUndo} disabled={!canUndo}>
                  <Undo className="h-4 w-4" />
                  Undo
                  <ContextMenuShortcut>Alt+Z</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={handleRedo} disabled={!canRedo}>
                  <Redo className="h-4 w-4" />
                  Redo
                  <ContextMenuShortcut>Alt+X</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleDownloadJpeg}>
                  <Download className="h-4 w-4" />
                  Download as JPEG
                </ContextMenuItem>
                <ContextMenuItem disabled>
                  <Download className="h-4 w-4" />
                  Download as WebP
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => setShowDeleteAllDialog(true)}
                  className="text-white focus:text-white"
                  disabled={images.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Images
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ) : (
            <EmptyState
              onUploadClick={() => setShowUpload(true)}
              showKbdHints={showKbdHints}
            />
          )}
        </div>
      </div>

      {/* Status Bar - full width at bottom */}
      <StatusBar
        selectedImage={selectedImage}
        imageCount={images.length}
        activeTool={activeTool}
      />

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all images?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {images.length} image{images.length !== 1 ? "s" : ""} from your workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface EmptyStateProps {
  onUploadClick: () => void;
  showKbdHints: boolean;
}

function EmptyState({ onUploadClick, showKbdHints }: EmptyStateProps) {
  const shortcuts = [
    { key: "Alt U", label: "Upload Panel" },
    { key: "Alt I", label: "Image Gallery" },
    { key: "Alt S", label: "Tools Sidebar" },
    { key: "Alt /", label: "Toggle Shortcuts" },
    { key: "Alt Z", label: "Undo" },
    { key: "Alt X", label: "Redo" },
  ];

  return (
    <div className="text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-theme-muted">
        <ImageIcon className="h-12 w-12 text-theme-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-theme-foreground">
        No Image Selected
      </h2>
      <p className="mb-6 text-theme-muted-foreground">
        Upload images to start editing
      </p>
      <button
        onClick={onUploadClick}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium mx-auto transition-colors bg-theme-primary text-theme-primary-foreground"
      >
        <Upload className="h-5 w-5" />
        Upload Images
        {showKbdHints && (
          <kbd className="text-xs px-2 py-0.5 rounded ml-2 bg-theme-primary text-black">
            Alt U
          </kbd>
        )}
      </button>

      {showKbdHints && (
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl mx-auto text-sm">
          {shortcuts.map(({ key, label }) => (
            <div key={key} className="text-center">
              <kbd className="inline-block px-4 py-2 rounded-lg text-sm mb-2 font-mono bg-theme-primary text-black">
                {key}
              </kbd>
              <p className="text-theme-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {!showKbdHints && (
        <p className="mt-8 text-xs text-theme-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 rounded bg-theme-primary text-black">Alt /</kbd> to show keyboard shortcuts
        </p>
      )}
    </div>
  );
}

interface StatusBarProps {
  selectedImage: ImageData | undefined;
  imageCount: number;
  activeTool: ToolType;
}

function StatusBar({ selectedImage, imageCount, activeTool }: StatusBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2 text-xs bg-theme-card/80 backdrop-blur-sm border-t border-theme-border text-theme-muted-foreground">
      {/* Left: Selected file name */}
      <div className="flex items-center gap-2 justify-self-start">
        {selectedImage && (
          <>
            <span>{selectedImage.name}</span>
            <span>-</span>
            <span>{(selectedImage.size / 1024).toFixed(1)} KB</span>
          </>
        )}
      </div>

      {/* Center: Hotkeys info */}
      <span className="text-xs text-theme-muted-foreground hidden md:inline justify-self-center">
        Hotkeys: <kbd className="px-1 py-0.5 rounded bg-theme-primary text-black">Alt + /</kbd>
        <span className="mx-1 opacity-50"></span>
        <kbd className="px-1 py-0.5 rounded bg-theme-primary text-black">⌘ + /</kbd>
      </span>

      {/* Right: Image count, active tool */}
      <div className="flex items-center gap-2 justify-self-end">
        <span>
          {imageCount} image{imageCount !== 1 ? "s" : ""}
        </span>
        {selectedImage && (
          <>
            <span>-</span>
            <span className="text-theme-primary">Active: {activeTool}</span>
          </>
        )}
      </div>
    </div>
  );
}
