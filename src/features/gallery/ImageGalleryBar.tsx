import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ImageData } from "@/lib/types";
import { slideFromBottomFast } from "@/lib/animations";

import { useGalleryPagination } from "./useGalleryPagination";
import { ImageThumbnail } from "./ImageThumbnail";
import { GalleryHeader } from "./GalleryHeader";

interface Props {
  images: ImageData[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onClose: () => void;
  showTools?: boolean;
}

export function ImageGalleryBar({
  images,
  selectedIndex,
  onSelect,
  onDelete,
  onClose,
  showTools = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    page,
    setPage,
    perPage,
    totalPages,
    startIndex,
  } = useGalleryPagination(containerRef, images.length);

  const visible = images.slice(startIndex, startIndex + perPage);

  return (
    <motion.div
      variants={slideFromBottomFast}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        left: showTools ? 320 : 12, // sidebar width + gap
        right: 12,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="
        fixed
        bottom-12
        z-40
        bg-theme-popover
        rounded-xl
        shadow-2xl
        border
        border-theme-border
      "
    >
      <div ref={containerRef} className="p-4">
        {/* Header */}
        <GalleryHeader
          imageCount={images.length}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onClose={onClose}
        />

        {/* Thumbnails + Pagination */}
        <div className="flex items-center gap-2">
          {/* Left arrow */}
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg bg-theme-accent hover:bg-theme-muted disabled:opacity-30"
            aria-label="Previous images"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Thumbnails */}
          <div className="flex overflow-hidden">
            {visible.map((image, i) => {
              const index = startIndex + i;
              return (
                <ImageThumbnail
                  key={image.id}
                  image={image}
                  selected={index === selectedIndex}
                  onSelect={() => onSelect(index)}
                  onDelete={() => onDelete(index)}
                />
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages - 1, p + 1),
              )
            }
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-lg bg-theme-accent hover:bg-theme-muted disabled:opacity-30"
            aria-label="Next images"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}