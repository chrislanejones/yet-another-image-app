import { useState } from "react";
import type { ImageData } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  image: ImageData;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function ImageThumbnail({
  image,
  selected,
  onSelect,
  onDelete,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onClick={onSelect}
      className="relative group cursor-pointer shrink-0 p-1.5"
    >
      <div
        className={`relative rounded-lg overflow-hidden ${
          selected
            ? "ring-2 ring-theme-primary ring-offset-2 ring-offset-theme-popover"
            : "hover:ring-1 hover:ring-theme-muted-foreground"
        }`}
      >
        {!loaded && (
          <Skeleton className="absolute inset-0 h-24 w-24" />
        )}
        <img
          src={image.url}
          alt={image.name}
          onLoad={() => setLoaded(true)}
          className={`h-24 w-24 object-cover ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 bg-theme-destructive/90 text-white"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
