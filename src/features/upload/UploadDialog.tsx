import type { ImageData } from "@/lib/types";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UploadDropZone } from "./UploadDropZone";
import { useImageUpload } from "./useImageUpload";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImagesAdd: (images: ImageData[]) => void;
}

export function UploadDialog({
  open,
  onOpenChange,
  onImagesAdd,
}: Props) {
  const { processFiles } = useImageUpload(
    open,
    onImagesAdd,
    () => onOpenChange(false),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-theme-primary" />
            Upload Images
          </DialogTitle>
        </DialogHeader>

        <UploadDropZone onFiles={processFiles} />
      </DialogContent>
    </Dialog>
  );
}
