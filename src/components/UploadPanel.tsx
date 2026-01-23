import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { slideFromBottom, fadeIn } from "@/lib/animations";
import type { ImageData } from "@/lib/types";
import { Upload, X, Clipboard, FolderOpen } from "@/components/icons";

interface UploadPanelProps {
  onClose: () => void;
  onImagesAdd: (images: ImageData[]) => void;
}

export function UploadPanel({ onClose, onImagesAdd }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: File[]) => {
      const newImages: ImageData[] = files.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));
      onImagesAdd(newImages);
    },
    [onImagesAdd]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) processFiles(files);
    },
    [processFiles]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        const files = Array.from(items)
          .filter((item) => item.type.startsWith("image/"))
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null);
        if (files.length > 0) processFiles(files);
      }
    },
    [processFiles]
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        variants={slideFromBottom}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed left-3 right-3 bottom-3 z-50 bg-theme-popover rounded-xl shadow-2xl border border-theme-border max-h-[85vh] overflow-hidden"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-theme-muted-foreground/30" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-theme-foreground">
              <span className="text-theme-primary">
                <Upload className="h-5 w-5" />
              </span>
              Upload Images
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-theme-accent text-theme-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging
                ? "border-theme-primary bg-theme-primary/10"
                : "border-theme-border bg-theme-muted/30"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-theme-muted flex items-center justify-center mb-2">
                <Upload className="h-8 w-8 text-theme-muted-foreground" />
              </div>
              <div className="flex gap-4 flex-wrap justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90 bg-theme-primary text-theme-primary-foreground"
                >
                  <FolderOpen className="h-5 w-5" />
                  Browse Files
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90 bg-theme-secondary text-theme-secondary-foreground">
                  <Clipboard className="h-5 w-5" />
                  Paste (Ctrl+V)
                </button>
              </div>
              <p className="text-theme-muted-foreground text-sm">
                or drag and drop images here
              </p>
              <p className="text-theme-muted-foreground text-xs opacity-60">
                Supports PNG, JPG, GIF, WebP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="mt-4 flex justify-center">
            <kbd className="px-3 py-1.5 rounded text-xs font-mono bg-theme-muted text-theme-muted-foreground">
              Press Alt+U to close
            </kbd>
          </div>
        </div>
      </motion.div>
    </>
  );
}
