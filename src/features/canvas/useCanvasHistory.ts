import { useCallback, useEffect, useRef, useState } from "react";

export function useCanvasHistory(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onChange?: (canUndo: boolean, canRedo: boolean) => void,
) {
  const [history, setHistory] = useState<ImageData[]>([]);
  const [index, setIndex] = useState(0);

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

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const next = historyRef.current.slice(0, indexRef.current + 1);
    next.push(image);

    if (next.length > 50) next.shift();

    setHistory(next);
    setIndex(next.length - 1);
  }, [canvasRef]);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const next = indexRef.current - 1;
    ctx.putImageData(historyRef.current[next], 0, 0);
    setIndex(next);
  }, [canvasRef]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const next = indexRef.current + 1;
    ctx.putImageData(historyRef.current[next], 0, 0);
    setIndex(next);
  }, [canvasRef]);

  return { snapshot, undo, redo };
}
