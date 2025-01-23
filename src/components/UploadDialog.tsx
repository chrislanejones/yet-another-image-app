import { useState, useRef, useCallback, useEffect } from "react";
import type { ImageData } from "@/lib/types";
import { Upload, Clipboard, FolderOpen } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImagesAdd: (images: ImageData[]) => void;
}

export function UploadDialog({ open, onOpenChange, onImagesAdd }: UploadDialogProps) {
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
      onOpenChange(false);
    },
    [onImagesAdd, onOpenChange]
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
      if (!open) return;
      const items = e.clipboardData?.items;
      if (items) {
        const files = Array.from(items)
          .filter((item) => item.type.startsWith("image/"))
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null);
        if (files.length > 0) processFiles(files);
      }
    },
    [processFiles, open]
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-theme-primary">
              <Upload className="h-5 w-5" />
            </span>
            Upload Images
          </DialogTitle>
        </DialogHeader>

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

        <div className="flex justify-center">
          <kbd className="px-3 py-1.5 rounded text-xs font-mono bg-theme-primary text-black">
            Press Alt+U to close
          </kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
