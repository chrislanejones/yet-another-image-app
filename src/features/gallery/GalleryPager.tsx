import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function GalleryPager({
  page,
  totalPages,
  onPrev,
  onNext,
}: Props) {
  return (
    <>
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="p-1.5 rounded-lg disabled:opacity-30 bg-theme-accent hover:bg-theme-muted"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={onNext}
        disabled={page >= totalPages - 1}
        className="p-1.5 rounded-lg disabled:opacity-30 bg-theme-accent hover:bg-theme-muted"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </>
  );
}
