import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { ImageData, ToolSettings, ToolType } from "@/lib/types";
import type { ExportFormat } from "@/components/ui/select";
import { formatLabels } from "@/components/ui/select";

import { UploadDialog } from "@/features/upload";
import { ImageGalleryBar } from "@/features/gallery";
import { ToolsSidebar } from "@/features/tools";
import { TopBar } from "@/components/TopBar";
import {
  AnnotationCanvas,
  type AnnotationCanvasRef,
} from "@/features/canvas";
import { StatusBar } from "@/components/StatusBar";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
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
  Undo,
  Redo,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";

import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

import { defaultToolSettings } from "@/lib/defaultToolSettings";

/* ------------------------------------------------------------------ */
/* Defaults                                                           */
/* ------------------------------------------------------------------ */

const mimeTypes: Record<ExportFormat, string> = {
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

const fileExtensions: Record<ExportFormat, string> = {
  jpeg: ".jpg",
  webp: ".webp",
  avif: ".avif",
};

/* ------------------------------------------------------------------ */
/* AppShell                                                           */
/* ------------------------------------------------------------------ */

export function AppShell() {
  const canvasRef = useRef<AnnotationCanvasRef>(null);

  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [activeTool, setActiveTool] =
    useState<ToolType>("compress");

  const [settings, setSettings] =
    useState<ToolSettings>(defaultToolSettings);

  const [exportFormat, setExportFormat] =
    useState<ExportFormat>("jpeg");

  const [zoom, setZoom] = useState(100);

  const [showUpload, setShowUpload] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showKbdHints, setShowKbdHints] = useState(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [showDeleteAllDialog, setShowDeleteAllDialog] =
    useState(false);

  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const selectedImage = images[selectedIndex];

  /* ------------------------------------------------------------------ */
  /* Show upload when no images                                         */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (images.length === 0) {
      setShowUpload(true);
    }
  }, [images.length]);

  /* ------------------------------------------------------------------ */
  /* Image load → size sync                                             */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedImage) return;

    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      setSettings((prev) => ({
        ...prev,
        width: img.width,
        height: img.height,
      }));
    };
    img.src = selectedImage.url;
  }, [selectedImage]);

  /* ------------------------------------------------------------------ */
  /* History                                                            */
  /* ------------------------------------------------------------------ */

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    canvasRef.current?.redo();
  }, []);

  const handleHistoryChange = useCallback(
    (u: boolean, r: boolean) => {
      setCanUndo(u);
      setCanRedo(r);
    },
    [],
  );

  /* ------------------------------------------------------------------ */
  /* Crop                                                               */
  /* ------------------------------------------------------------------ */

  const handleApplyCrop = useCallback(() => {
    canvasRef.current?.applyCrop();
  }, []);

  /* ------------------------------------------------------------------ */
  /* Resize                                                             */
  /* ------------------------------------------------------------------ */

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas || !selectedImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = settings.width;
    canvas.height = settings.height;

    ctx.drawImage(
      tempCanvas,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
      0,
      0,
      settings.width,
      settings.height,
    );

    setImageSize({
      width: settings.width,
      height: settings.height,
    });

    canvas.toBlob((blob) => {
      if (!blob) return;

      const newUrl = URL.createObjectURL(blob);
      URL.revokeObjectURL(selectedImage.url);

      setImages((prev) =>
        prev.map((img, i) =>
          i === selectedIndex
            ? { ...img, url: newUrl, size: blob.size }
            : img,
        ),
      );
    }, "image/png");
  }, [settings, selectedImage, selectedIndex]);

  /* ------------------------------------------------------------------ */
  /* Export                                                             */
  /* ------------------------------------------------------------------ */

  const handleExportWithFormat = useCallback(
    (format: ExportFormat) => {
      const canvas = canvasRef.current?.getCanvas();
      if (!canvas || !selectedImage) return;

      const mimeType = mimeTypes[format];
      const extension = fileExtensions[format];
      const quality = settings.quality / 100;

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download =
            selectedImage.name.replace(/\.[^.]+$/, "") +
            extension;
          a.click();
          URL.revokeObjectURL(url);
        },
        mimeType,
        quality,
      );
    },
    [selectedImage, settings.quality],
  );

  const handleExport = useCallback(() => {
    handleExportWithFormat(exportFormat);
  }, [handleExportWithFormat, exportFormat]);

  /* ------------------------------------------------------------------ */
  /* Keyboard                                                           */
  /* ------------------------------------------------------------------ */

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onExport: handleExport,
    setShowUpload,
    setShowGallery,
    setShowTools,
    setShowKbdHints,
    setZoom,
  });

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col pb-9 bg-theme-background text-theme-foreground">
      {/* Upload */}
      <UploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onImagesAdd={(imgs) => {
          setImages((prev) => [...prev, ...imgs]);
          if (images.length === 0) setSelectedIndex(0);
        }}
      />

      {/* Gallery */}
      <AnimatePresence>
        {showGallery && (
          <ImageGalleryBar
            images={images}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onDelete={(i) =>
              setImages((prev) => prev.filter((_, x) => x !== i))
            }
            onClose={() => setShowGallery(false)}
            showTools={showTools}
          />
        )}
      </AnimatePresence>

      {/* Tools */}
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
            exportFormat={exportFormat}
            onExportFormatChange={setExportFormat}
            onExport={handleExport}
            hasSelectedImage={!!selectedImage}
            onResize={handleResize}
            onApplyCrop={handleApplyCrop}
            imageWidth={imageSize?.width}
            imageHeight={imageSize?.height}
            showKbdHints={showKbdHints}
          />
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <TopBar
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(200, z + 25))}
        onZoomOut={() => setZoom((z) => Math.max(25, z - 25))}
        showUpload={showUpload}
        showGallery={showGallery}
        showTools={showTools}
        showKbdHints={showKbdHints}
        onToggleUpload={() => setShowUpload((v) => !v)}
        onToggleGallery={() => setShowGallery((v) => !v)}
        onToggleTools={() => setShowTools((v) => !v)}
        hasSelectedImage={!!selectedImage}
        exportFormat={exportFormat}
        onExport={handleExport}
      />

      {/* Canvas + Context Menu */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.main
            animate={{
              marginLeft: showTools ? 320 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex items-center justify-center p-4 overflow-auto"
          >
            {selectedImage ? (
              <AnnotationCanvas
                ref={canvasRef}
                image={selectedImage}
                tool={activeTool}
                settings={settings}
                zoom={zoom}
                onHistoryChange={handleHistoryChange}
              />
            ) : (
              <div className="text-center">
                <ImageIcon className="h-24 w-24 mx-auto mb-4 text-theme-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">
                  No image selected
                </h2>
                <p className="text-theme-muted-foreground mb-4">
                  Upload an image or select one from the gallery
                </p>
              </div>
            )}
          </motion.main>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={handleUndo} disabled={!canUndo}>
            <Undo className="h-4 w-4" />
            Undo
            <ContextMenuShortcut>Alt Z</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={handleRedo} disabled={!canRedo}>
            <Redo className="h-4 w-4" />
            Redo
            <ContextMenuShortcut>Alt X</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            disabled={zoom <= 25}
          >
            <ZoomOut className="h-4 w-4" />
            Zoom Out
            <ContextMenuShortcut>Alt −</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
            Zoom In
            <ContextMenuShortcut>Alt +</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={() => setZoom(100)}>
            <RotateCcw className="h-4 w-4" />
            Reset Zoom
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => handleExportWithFormat("jpeg")}
            disabled={!selectedImage}
          >
            <Download className="h-4 w-4" />
            Export JPEG
            <ContextMenuShortcut>.jpg</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => handleExportWithFormat("webp")}
            disabled={!selectedImage}
          >
            <Download className="h-4 w-4" />
            Export WebP
            <ContextMenuShortcut>.webp</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => handleExportWithFormat("avif")}
            disabled={!selectedImage}
          >
            <Download className="h-4 w-4" />
            Export AVIF
            <ContextMenuShortcut>.avif</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => setShowDeleteAllDialog(true)}
            variant="destructive"
            disabled={images.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Delete All
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete All Dialog */}
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete all images?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {images.length} images.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                images.forEach((img) =>
                  URL.revokeObjectURL(img.url),
                );
                setImages([]);
                setSelectedIndex(0);
                setShowDeleteAllDialog(false);
              }}
              variant="destructive"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Bar */}
      <StatusBar
        selectedImage={selectedImage}
        imageCount={images.length}
        activeTool={activeTool}
        exportFormat={formatLabels[exportFormat]}
      />
    </div>
  );
}