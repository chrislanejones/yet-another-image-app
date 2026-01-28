import { useEffect, useState } from "react";

export function useGalleryPagination(
  containerRef: React.RefObject<HTMLDivElement | null>,
  imageCount: number,
  thumbWidth = 108,
) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      setPerPage(Math.max(1, Math.floor(width / thumbWidth)));
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, thumbWidth]);

  const totalPages = Math.max(1, Math.ceil(imageCount / perPage));

  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  return {
    page,
    perPage,
    totalPages,
    setPage,
    startIndex: page * perPage,
  };
}
