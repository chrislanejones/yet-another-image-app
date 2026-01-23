import { useRef, useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import type { ImageData, ToolSettings, ToolType } from "@/lib/types";

interface Point {
  x: number;
  y: number;
}

interface AnnotationCanvasProps {
  image: ImageData;
  tool: ToolType;
  settings: ToolSettings;
}

export interface AnnotationCanvasRef {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getCanvas: () => HTMLCanvasElement | null;
}

export const AnnotationCanvas = forwardRef<AnnotationCanvasRef, AnnotationCanvasProps>(
  function AnnotationCanvas({ image, tool, settings }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<globalThis.ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Remove any redo states when new action is taken
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData as unknown as ImageData);

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const newIndex = historyIndex - 1;
    const imageData = history[newIndex] as unknown as globalThis.ImageData;
    ctx.putImageData(imageData, 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const newIndex = historyIndex + 1;
    const imageData = history[newIndex] as unknown as globalThis.ImageData;
    ctx.putImageData(imageData, 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  useImperativeHandle(ref, () => ({
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    getCanvas: () => canvasRef.current,
  }), [undo, redo, historyIndex, history.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      // Save initial state
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData as unknown as ImageData]);
      setHistoryIndex(0);
    };
    img.src = image.url;
  }, [image]);

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawArrow = useCallback((
    ctx: CanvasRenderingContext2D,
    from: Point,
    to: Point,
    color: string,
    width: number,
    style: "single" | "double"
  ) => {
    // Scale head size with stroke width - larger heads for thicker arrows
    const headLength = Math.max(20, width * 3);
    const headWidth = Math.PI / 5; // ~36 degrees, wider arrowhead
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Calculate where line should end (before arrowhead)
    const lineEndX = to.x - (headLength * 0.5) * Math.cos(angle);
    const lineEndY = to.y - (headLength * 0.5) * Math.sin(angle);
    const lineStartX = style === "double"
      ? from.x + (headLength * 0.5) * Math.cos(angle)
      : from.x;
    const lineStartY = style === "double"
      ? from.y + (headLength * 0.5) * Math.sin(angle)
      : from.y;

    // Draw line (shortened to not overlap with arrowheads)
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();

    // Draw end arrowhead
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - headWidth),
      to.y - headLength * Math.sin(angle - headWidth)
    );
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + headWidth),
      to.y - headLength * Math.sin(angle + headWidth)
    );
    ctx.closePath();
    ctx.fill();

    // Draw start arrowhead for double arrow
    if (style === "double") {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(
        from.x + headLength * Math.cos(angle - headWidth),
        from.y + headLength * Math.sin(angle - headWidth)
      );
      ctx.lineTo(
        from.x + headLength * Math.cos(angle + headWidth),
        from.y + headLength * Math.sin(angle + headWidth)
      );
      ctx.closePath();
      ctx.fill();
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "brush" && tool !== "arrow") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const point = getPoint(e);

    if (tool === "arrow") {
      // Save canvas state for preview restoration
      setPreviewCanvas(ctx.getImageData(0, 0, canvas.width, canvas.height));
      setStartPoint(point);
    }

    saveSnapshot(); // Save state before drawing starts
    setIsDrawing(true);
    setLastPoint(point);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const point = getPoint(e);

    if (tool === "brush") {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = settings.brushColor;
      ctx.lineWidth = settings.brushSize;
      ctx.lineCap = "round";
      ctx.globalAlpha = settings.brushOpacity / 100;
      ctx.stroke();
      ctx.globalAlpha = 1;
      setLastPoint(point);
    } else if (tool === "arrow" && startPoint && previewCanvas) {
      // Restore canvas to state before arrow preview
      ctx.putImageData(previewCanvas, 0, 0);
      // Draw arrow preview
      drawArrow(ctx, startPoint, point, settings.strokeColor, settings.strokeWidth, settings.arrowStyle);
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && tool === "arrow" && startPoint && previewCanvas) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx && e) {
        const endPoint = getPoint(e);
        // Restore canvas and draw final arrow
        ctx.putImageData(previewCanvas, 0, 0);
        drawArrow(ctx, startPoint, endPoint, settings.strokeColor, settings.strokeWidth, settings.arrowStyle);
      }
    }
    if (isDrawing) {
      saveSnapshot(); // Save state after drawing ends
    }
    setIsDrawing(false);
    setLastPoint(null);
    setStartPoint(null);
    setPreviewCanvas(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={(e) => stopDrawing(e)}
      onMouseLeave={() => stopDrawing()}
      className="max-w-full max-h-full object-contain"
      style={{
        cursor: tool === "brush" || tool === "arrow" ? "crosshair" : "default",
        touchAction: "none",
      }}
    />
  );
});
