import { useCallback, useEffect } from "react";
import type { ImageData } from "@/lib/types";

export function useImageUpload(
  open: boolean,
  onImagesAdd: (images: ImageData[]) => void,
  onClose: () => void,
) {
  const processFiles = useCallback(
    (files: File[]) => {
      const images: ImageData[] = files.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));

      onImagesAdd(images);
      onClose();
    },
    [onImagesAdd, onClose],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!open) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const files = Array.from(items)
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);

      if (files.length) processFiles(files);
    },
    [open, processFiles],
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  return { processFiles };
}
