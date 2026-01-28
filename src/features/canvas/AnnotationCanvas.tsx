import {
  forwardRef,
  useCallback,
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
    const textInputRef = useRef<HTMLTextAreaElement>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

    // Text tool state
    const [textInput, setTextInput] = useState<{
      x: number;
      y: number;
      canvasX: number;
      canvasY: number;
      text: string;
    } | null>(null);
    const [pendingText, setPendingText] = useState<string>("");

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

    // Commit text to canvas
    const commitText = useCallback(() => {
      if (!textInput || !textInput.text.trim()) {
        setTextInput(null);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        setTextInput(null);
        return;
      }

      // Draw the text
      ctx.font = `${settings.fontWeight} ${settings.fontSize}px sans-serif`;
      ctx.fillStyle = settings.textColor;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      const lines = textInput.text.split("\n");
      const lineHeight = settings.fontSize * 1.2;

      lines.forEach((line, index) => {
        ctx.fillText(line, textInput.canvasX, textInput.canvasY + index * lineHeight);
      });

      // Dispatch event for text memory
      window.dispatchEvent(
        new CustomEvent("text-committed", { detail: { text: textInput.text } })
      );

      snapshot();
      setTextInput(null);
    }, [textInput, settings.fontSize, settings.fontWeight, settings.textColor, snapshot]);

    // Listen for prefill-text events
    useEffect(() => {
      const handlePrefill = (e: CustomEvent<{ text: string }>) => {
        if (tool === "text") {
          // Set pending text to prefill on next click
          setPendingText(e.detail.text);
        }
      };

      window.addEventListener("prefill-text", handlePrefill as EventListener);
      return () => {
        window.removeEventListener("prefill-text", handlePrefill as EventListener);
      };
    }, [tool]);

    // Handle canvas click for text tool
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
      if (tool !== "text") return;

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = canvas.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Screen position relative to container
      const screenX = e.clientX - containerRect.left;
      const screenY = e.clientY - containerRect.top;

      // Canvas position (actual pixel coordinates)
      const canvasX = ((e.clientX - rect.left) * canvas.width) / rect.width;
      const canvasY = ((e.clientY - rect.top) * canvas.height) / rect.height;

      // If there's existing text, commit it first
      if (textInput) {
        commitText();
      }

      setTextInput({
        x: screenX,
        y: screenY,
        canvasX,
        canvasY,
        text: pendingText,
      });

      // Clear pending text after use
      if (pendingText) {
        setPendingText("");
      }

      // Focus the input after a short delay
      setTimeout(() => textInputRef.current?.focus(), 10);
    }, [tool, textInput, commitText, pendingText]);

    // Handle text input key events
    const handleTextKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setTextInput(null);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commitText();
      }
    }, [commitText]);

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
          onClick={handleCanvasClick}
          onMouseDown={drawing.onMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={drawing.onMouseUp}
          onMouseLeave={handleMouseLeave}
          className="max-w-full max-h-full object-contain"
          style={{
            cursor:
              tool === "text"
                ? "text"
                : tool === "arrow" || tool === "crop" || tool === "shapes"
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

        {/* Text input overlay */}
        {textInput && (
          <textarea
            ref={textInputRef}
            value={textInput.text}
            onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
            onKeyDown={handleTextKeyDown}
            onBlur={commitText}
            placeholder="Type text..."
            className="absolute bg-transparent border-2 border-dashed border-theme-primary outline-none resize-none overflow-hidden"
            style={{
              left: textInput.x,
              top: textInput.y,
              minWidth: 100,
              minHeight: settings.fontSize * 1.5,
              fontSize: settings.fontSize * (zoom / 100),
              fontWeight: settings.fontWeight,
              color: settings.textColor,
              fontFamily: "sans-serif",
              lineHeight: 1.2,
              padding: "2px 4px",
            }}
            autoFocus
          />
        )}
      </div>
    );
  },
);
