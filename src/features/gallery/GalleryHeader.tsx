import { X } from "lucide-react";
import { Image } from "lucide-react";

interface Props {
  imageCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

export function GalleryHeader({
  imageCount,
  page,
  totalPages,
  onPageChange,
  onClose,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Image className="h-4 w-4" />
        Gallery
        <span className="text-xs text-theme-muted-foreground">
          ({imageCount})
        </span>
      </h2>

      <div className="flex items-center gap-2">
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange(i)}
                className={`w-1.5 h-1.5 rounded-full ${
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
          className="p-1.5 rounded-lg hover:bg-theme-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
