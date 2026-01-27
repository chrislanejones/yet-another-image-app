import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import type { ImageData, ToolSettings, ToolType } from "@/lib/types";
import { useCanvasHistory } from "./useCanvasHistory";
import { useCanvasDrawing } from "./useCanvasDrawing";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface AnnotationCanvasRef {
  undo: () => void;
  redo: () => void;
  getCanvas: () => HTMLCanvasElement | null;
  applyCrop: () => void;
  hasCropSelection: () => boolean;
}

interface Props {
  image: ImageData;
  tool: ToolType;
  settings: ToolSettings;
  zoom?: number;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

/* ------------------------------------------------------------------ */
/* Canvas                                                             */
/* ------------------------------------------------------------------ */

export const AnnotationCanvas = forwardRef<
  AnnotationCanvasRef,
  Props
>(function AnnotationCanvas(
  {
    image,
    tool,
    settings,
    zoom = 100,
    onHistoryChange,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { snapshot, undo, redo } = useCanvasHistory(
    canvasRef,
    onHistoryChange,
  );

  const drawing = useCanvasDrawing(
    canvasRef,
    tool,
    settings,
    snapshot,
  );

  useImperativeHandle(ref, () => ({
    undo,
    redo,
    getCanvas: () => canvasRef.current,
    hasCropSelection: () => !!drawing.cropSelection,
    applyCrop: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const sel = drawing.cropSelection;
      if (!canvas || !ctx || !sel) return;

      // Restore the original image first (without the overlay)
      ctx.putImageData(sel.imageData, 0, 0);

      // Get the cropped image data from the clean canvas
      const croppedData = ctx.getImageData(sel.x, sel.y, sel.width, sel.height);

      // Resize canvas to crop dimensions
      canvas.width = sel.width;
      canvas.height = sel.height;

      // Draw cropped data
      ctx.putImageData(croppedData, 0, 0);

      // Clear selection and commit
      drawing.clearCropSelection();
      snapshot();
    },
  }));

  /* ------------------------------------------------------------------ */
  /* Load image + apply rotation                                        */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();

    img.onload = () => {
      const rotation = settings.rotation ?? 0;
      const radians = (rotation * Math.PI) / 180;

      // Handle 90 / 270 swaps
      const rotated =
        Math.abs(rotation % 180) === 90;

      canvas.width = rotated ? img.height : img.width;
      canvas.height = rotated ? img.width : img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      ctx.translate(
        canvas.width / 2,
        canvas.height / 2,
      );
      ctx.rotate(radians);

      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
      );

      ctx.restore();
      snapshot();
    };

    img.src = image.url;
  }, [image, settings.rotation, snapshot]);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={drawing.onMouseDown}
      onMouseMove={drawing.onMouseMove}
      onMouseUp={(e) => drawing.onMouseUp(e)}
      onMouseLeave={() => drawing.onMouseUp()}
      className="max-w-full max-h-full object-contain"
      style={{
        cursor:
          tool === "brush" || tool === "arrow" || tool === "crop"
            ? "crosshair"
            : "default",
        touchAction: "none",
        transform: `scale(${zoom / 100})`,
        transformOrigin: "center center",
      }}
    />
  );
});