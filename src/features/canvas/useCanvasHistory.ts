import { useCallback, useEffect, useRef, useState } from "react";

export function useCanvasHistory(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onChange?: (canUndo: boolean, canRedo: boolean) => void,
) {
  const [history, setHistory] = useState<ImageData[]>([]);
  const [index, setIndex] = useState(0);
  
  // We need refs to access state inside callbacks without dependencies
  const historyRef = useRef(history);
  const indexRef = useRef(index);

  useEffect(() => {
    historyRef.current = history;
    indexRef.current = index;
    onChange?.(index > 0, index < history.length - 1);
  }, [history, index, onChange]);

  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Capture the current full canvas
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const next = historyRef.current.slice(0, indexRef.current + 1);
    next.push(image);

    // Limit history to 20 steps to save memory
    if (next.length > 20) next.shift();

    setHistory(next);
    setIndex(next.length - 1);
  }, [canvasRef]);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const next = indexRef.current - 1;
    const previousData = historyRef.current[next];
    if (!previousData) return;

    // Resize canvas to match the history state
    if (canvas.width !== previousData.width || canvas.height !== previousData.height) {
        canvas.width = previousData.width;
        canvas.height = previousData.height;
    }

    ctx.putImageData(previousData, 0, 0);
    setIndex(next);
  }, [canvasRef]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const next = indexRef.current + 1;
    const nextData = historyRef.current[next];
    if (!nextData) return;

    // Resize canvas to match the history state
    if (canvas.width !== nextData.width || canvas.height !== nextData.height) {
        canvas.width = nextData.width;
        canvas.height = nextData.height;
    }

    ctx.putImageData(nextData, 0, 0);
    setIndex(next);
  }, [canvasRef]);

  return { snapshot, undo, redo };
}