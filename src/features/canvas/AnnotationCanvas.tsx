import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ImageData, ToolSettings, ToolType } from "@/lib/types";
import { useCanvasHistory } from "./useCanvasHistory";
import { useCanvasDrawing } from "./useCanvasDrawing";

export interface AnnotationCanvasRef {
  undo: () => void;
  redo: () => void;
  getCanvas: () => HTMLCanvasElement | null;
  hasCropSelection: () => boolean;
  applyCrop: () => void;
}

interface Props {
  image?: ImageData;
  tool: ToolType;
  settings: ToolSettings;
  zoom?: number;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export const AnnotationCanvas = forwardRef<AnnotationCanvasRef, Props>(
  function AnnotationCanvas(
    { image, tool, settings, zoom = 100, onHistoryChange },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

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

    useEffect(() => {
      if (!image) return;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          snapshot();
        }
      };
      img.src = image.url;
    }, [image, snapshot]);

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
        ctx.putImageData(sel.imageData, 0, 0);
        const croppedData = ctx.getImageData(sel.x, sel.y, sel.width, sel.height);
        canvas.width = sel.width;
        canvas.height = sel.height;
        ctx.putImageData(croppedData, 0, 0);
        drawing.clearCropSelection();
        snapshot();
      },
    }));

    // Get the current tool's brush/blur size for the cursor
    const showSizeCursor = tool === "brush" || tool === "blur";
    const cursorSize = tool === "blur" ? settings.blurSize : settings.brushSize;

    // Handle mouse move for cursor preview
    const handleMouseMove = (e: React.MouseEvent) => {
      if (showSizeCursor && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      drawing.onMouseMove(e);
    };

    const handleMouseLeave = () => {
      setCursorPos(null);
      drawing.onMouseUp();
    };

    // Calculate the visual size of the cursor based on zoom and canvas scaling
    const getVisualCursorSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return cursorSize;
      const rect = canvas.getBoundingClientRect();
      const scale = rect.width / canvas.width;
      return cursorSize * scale;
    };

    return (
      <div
        ref={containerRef}
        className="relative inline-block"
        style={{ cursor: showSizeCursor ? "none" : undefined }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={drawing.onMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={drawing.onMouseUp}
          onMouseLeave={handleMouseLeave}
          className="max-w-full max-h-full object-contain"
          style={{
            cursor:
              tool === "arrow" || tool === "crop" || tool === "shapes"
                ? "crosshair"
                : showSizeCursor
                ? "none"
                : "default",
            touchAction: "none",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
          }}
        />

        {/* Size cursor preview for brush and blur tools */}
        {showSizeCursor && cursorPos && (
          <div
            className="pointer-events-none absolute rounded-full border-2 border-white mix-blend-difference"
            style={{
              width: getVisualCursorSize(),
              height: getVisualCursorSize(),
              left: cursorPos.x - getVisualCursorSize() / 2,
              top: cursorPos.y - getVisualCursorSize() / 2,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
            }}
          />
        )}
      </div>
    );
  },
);
