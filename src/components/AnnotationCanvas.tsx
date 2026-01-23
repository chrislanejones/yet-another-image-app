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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "brush") return;
    saveSnapshot(); // Save state before drawing starts
    setIsDrawing(true);
    setLastPoint(getPoint(e));
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== "brush" || !lastPoint) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const point = getPoint(e);
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
  };

  const stopDrawing = () => {
    if (isDrawing) {
      saveSnapshot(); // Save state after drawing ends
    }
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      className="max-w-full max-h-full object-contain"
      style={{
        cursor: tool === "brush" ? "crosshair" : "default",
        touchAction: "none",
      }}
    />
  );
});
