import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { slideFromBottomFast } from "@/lib/animations";
import type { ImageData } from "@/lib/types";
import {
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "@/components/icons";

interface ImageGalleryBarProps {
  images: ImageData[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  onDelete: (index: number) => void;
  showTools?: boolean;
}

export function ImageGalleryBar({
  images,
  selectedIndex,
  onSelect,
  onClose,
  onDelete,
  showTools = false,
}: ImageGalleryBarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const [imagesPerPage, setImagesPerPage] = useState(1);

  const THUMB_WIDTH = 108; // image + padding + gap

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const count = Math.max(1, Math.floor(width / THUMB_WIDTH));
      setImagesPerPage(count);
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const totalPages = Math.ceil(images.length / imagesPerPage);
  const startIndex = page * imagesPerPage;
  const visibleImages = images.slice(
    startIndex,
    startIndex + imagesPerPage
  );

  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  return (
    <motion.div
      variants={slideFromBottomFast}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`fixed bottom-12 right-3 z-40 bg-theme-popover rounded-xl shadow-2xl border border-theme-border transition-all duration-300 ${
        showTools ? "left-[21rem]" : "left-3"
      }`}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-theme-muted-foreground/30" />
      </div>

      <div className="px-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2 text-theme-foreground">
            <span className="text-theme-chart4">
              <ImageIcon className="h-4 w-4" />
            </span>
            Gallery
            <span className="text-xs font-normal text-theme-muted-foreground">
              ({images.length})
            </span>
          </h2>

          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      page === i
                        ? "bg-theme-primary"
                        : "bg-theme-muted hover:bg-theme-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-theme-accent text-theme-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {images.length === 0 ? (
          <div className="text-center py-6 text-theme-muted-foreground">
            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No images yet</p>
            <p className="text-xs mt-1 opacity-70">
              Press Alt+U to upload
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Left arrow */}
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 bg-theme-accent text-theme-foreground hover:bg-theme-muted flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Thumbnails */}
            <div ref={containerRef} className="flex-1 overflow-hidden">
              <div className="flex gap-2 justify-start">
                {visibleImages.map((img, i) => {
                  const actualIndex = startIndex + i;
                  const isSelected =
                    selectedIndex === actualIndex;

                  return (
                    <div
                      key={img.id}
                      onClick={() => onSelect(actualIndex)}
                      className="relative group cursor-pointer flex-shrink-0 p-1.5"
                    >
                      <div
                        className={`relative rounded-lg overflow-hidden transition-all ${
                          isSelected
                            ? "ring-2 ring-theme-primary ring-offset-2 ring-offset-theme-popover"
                            : "hover:ring-1 hover:ring-theme-muted-foreground"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="h-24 w-24 object-cover"
                        />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(actualIndex);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 bg-theme-destructive/90 hover:bg-theme-destructive text-white shadow-lg"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(totalPages - 1, p + 1)
                )
              }
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 bg-theme-accent text-theme-foreground hover:bg-theme-muted flex-shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}