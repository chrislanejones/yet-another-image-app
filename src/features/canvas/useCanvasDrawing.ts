import { useState } from "react";
import type { ToolSettings, ToolType } from "@/lib/types";
import { drawArrow } from "./drawArrow";

interface Point {
  x: number;
  y: number;
}

export interface CropSelection {
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: ImageData;
}

export function useCanvasDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  tool: ToolType,
  settings: ToolSettings,
  onCommit: () => void,
) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState<Point | null>(null);
  const [last, setLast] = useState<Point | null>(null);
  const [preview, setPreview] = useState<ImageData | null>(null);
  const [cropSelection, setCropSelection] = useState<CropSelection | null>(null);

  const getPoint = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (tool !== "brush" && tool !== "arrow" && tool !== "crop") return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const p = getPoint(e);
    setIsDrawing(true);
    setLast(p);

    if (tool === "arrow" || tool === "crop") {
      setStart(p);
      setPreview(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
    }

    // Emoji stamp on initial click
    if (tool === "brush" && settings.emoji) {
      ctx.font = `${settings.brushSize * 4}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = settings.brushOpacity / 100;
      ctx.fillText(settings.emoji, p.x, p.y);
      ctx.globalAlpha = 1;
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !last) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const p = getPoint(e);

    if (tool === "brush") {
      // If emoji is selected, stamp emojis while dragging
      if (settings.emoji) {
        ctx.font = `${settings.brushSize * 4}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = settings.brushOpacity / 100;
        ctx.fillText(settings.emoji, p.x, p.y);
        ctx.globalAlpha = 1;
        setLast(p);
      } else {
        // Normal brush drawing
        ctx.strokeStyle = settings.brushColor;
        ctx.lineWidth = settings.brushSize;
        ctx.lineCap = "round";
        ctx.globalAlpha = settings.brushOpacity / 100;

        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        ctx.globalAlpha = 1;
        setLast(p);
      }
    }

    if (tool === "arrow" && start && preview) {
      ctx.putImageData(preview, 0, 0);
      drawArrow(
        ctx,
        start,
        p,
        settings.strokeColor,
        settings.strokeWidth,
        settings.arrowStyle,
      );
    }

    if (tool === "crop" && start && preview) {
      ctx.putImageData(preview, 0, 0);

      const x = Math.min(start.x, p.x);
      const y = Math.min(start.y, p.y);
      const width = Math.abs(p.x - start.x);
      const height = Math.abs(p.y - start.y);

      // Draw semi-transparent overlay outside selection
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, ctx.canvas.width, y); // top
      ctx.fillRect(0, y + height, ctx.canvas.width, ctx.canvas.height - y - height); // bottom
      ctx.fillRect(0, y, x, height); // left
      ctx.fillRect(x + width, y, ctx.canvas.width - x - width, height); // right

      // Draw selection border
      ctx.strokeStyle = "#fcdfc2";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
  };

  const onMouseUp = (e?: React.MouseEvent) => {
    if (!isDrawing) return;

    if (tool === "arrow" && start && preview && e) {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      ctx.putImageData(preview, 0, 0);
      drawArrow(
        ctx,
        start,
        getPoint(e),
        settings.strokeColor,
        settings.strokeWidth,
        settings.arrowStyle,
      );
    }

    if (tool === "crop" && start && preview && e) {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const p = getPoint(e);
      const x = Math.min(start.x, p.x);
      const y = Math.min(start.y, p.y);
      const width = Math.abs(p.x - start.x);
      const height = Math.abs(p.y - start.y);

      // Store selection for later use
      if (width > 10 && height > 10) {
        setCropSelection({ x, y, width, height, imageData: preview });
      }

      // Keep the overlay visible
      ctx.putImageData(preview, 0, 0);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, ctx.canvas.width, y);
      ctx.fillRect(0, y + height, ctx.canvas.width, ctx.canvas.height - y - height);
      ctx.fillRect(0, y, x, height);
      ctx.fillRect(x + width, y, ctx.canvas.width - x - width, height);

      ctx.strokeStyle = "#fcdfc2";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }

    setIsDrawing(false);
    setStart(null);
    setLast(null);
    setPreview(null);

    // Don't commit for crop - we want to wait for the apply button
    if (tool !== "crop") {
      onCommit();
    }
  };

  const clearCropSelection = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && cropSelection?.imageData) {
      ctx.putImageData(cropSelection.imageData, 0, 0);
    }
    setCropSelection(null);
  };

  return { onMouseDown, onMouseMove, onMouseUp, cropSelection, clearCropSelection };
}
