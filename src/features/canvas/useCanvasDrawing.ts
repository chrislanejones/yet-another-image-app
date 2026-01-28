import { useState } from "react";
import type { ToolSettings, ToolType } from "@/lib/types";
import { drawArrow } from "./drawArrow";
import { drawShape } from "./drawShape";

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
  const [cropSelection, setCropSelection] =
    useState<CropSelection | null>(null);

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
    if (
      tool !== "brush" &&
      tool !== "arrow" &&
      tool !== "crop" &&
      tool !== "shapes" &&
      tool !== "blur"
    )
      return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const p = getPoint(e);
    setIsDrawing(true);
    setLast(p);

    if (tool === "arrow" || tool === "crop" || tool === "shapes") {
      setStart(p);
      setPreview(
        ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
      );
    }

    if (tool === "brush" && settings.emoji) {
      ctx.font = `${settings.brushSize * 4}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = settings.brushOpacity / 100;
      ctx.fillText(settings.emoji, p.x, p.y);
      ctx.globalAlpha = 1;
      // Note: Snapshots for emojis/brushes usually happen on mouseUp
    }

    if (tool === "blur") {
      applyBlur(ctx, p, settings.blurSize, settings.blurIntensity);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !last) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const p = getPoint(e);

    if (tool === "brush" && !settings.emoji) {
      ctx.beginPath();
      ctx.strokeStyle = settings.brushColor;
      ctx.lineWidth = settings.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = settings.brushOpacity / 100;
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      setLast(p);
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

    if (tool === "shapes" && start && preview) {
      ctx.putImageData(preview, 0, 0);
      drawShape(
        ctx,
        start,
        p,
        settings.shape ?? "rect",
        settings.strokeColor,
        settings.strokeWidth,
      );
    }

    if (tool === "crop" && start && preview) {
      ctx.putImageData(preview, 0, 0);
      const x = Math.min(start.x, p.x);
      const y = Math.min(start.y, p.y);
      const width = Math.abs(p.x - start.x);
      const height = Math.abs(p.y - start.y);

      // Overlay
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, ctx.canvas.width, y);
      ctx.fillRect(0, y + height, ctx.canvas.width, ctx.canvas.height - (y + height));
      ctx.fillRect(0, y, x, height);
      ctx.fillRect(x + width, y, ctx.canvas.width - (x + width), height);

      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }

    if (tool === "blur") {
      applyBlur(ctx, p, settings.blurSize, settings.blurIntensity);
      setLast(p);
    }
  };

  const onMouseUp = (e?: React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (tool === "crop" && start && e) {
      const p = getPoint(e);
      const x = Math.min(start.x, p.x);
      const y = Math.min(start.y, p.y);
      const width = Math.abs(p.x - start.x);
      const height = Math.abs(p.y - start.y);

      if (width > 5 && height > 5 && preview) {
        setCropSelection({ x, y, width, height, imageData: preview });
      }
    } else if (tool !== "crop") {
      onCommit();
    }

    setStart(null);
    setLast(null);
    setPreview(null);
  };

  const applyBlur = (
    ctx: CanvasRenderingContext2D,
    point: Point,
    size: number,
    intensity: number,
  ) => {
    const canvas = ctx.canvas;
    const radius = size / 2;
    const x = Math.max(0, Math.floor(point.x - radius));
    const y = Math.max(0, Math.floor(point.y - radius));
    const width = Math.min(canvas.width - x, Math.ceil(size));
    const height = Math.min(canvas.height - y, Math.ceil(size));

    if (width <= 0 || height <= 0) return;

    const imageData = ctx.getImageData(x, y, width, height);
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    offCtx.putImageData(imageData, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.filter = `blur(${intensity}px)`;
    ctx.drawImage(offscreen, x, y);
    ctx.filter = "none";
    ctx.restore();
  };

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    cropSelection,
    clearCropSelection: () => setCropSelection(null),
  };
}