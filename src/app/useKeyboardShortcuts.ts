import { useEffect } from "react";

interface KeyboardShortcutOptions {
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  setShowUpload: React.Dispatch<React.SetStateAction<boolean>>;
  setShowGallery: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTools: React.Dispatch<React.SetStateAction<boolean>>;
  setShowKbdHints: React.Dispatch<React.SetStateAction<boolean>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onExport,
  setShowUpload,
  setShowGallery,
  setShowTools,
  setShowKbdHints,
  setZoom,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const modifier = e.altKey || e.metaKey;
      if (!modifier) return;

      switch (e.key.toLowerCase()) {
        case "u":
          e.preventDefault();
          setShowUpload((v) => !v);
          break;
        case "i":
          e.preventDefault();
          setShowGallery((v) => !v);
          break;
        case "s":
          e.preventDefault();
          setShowTools((v) => !v);
          break;
        case "/":
          e.preventDefault();
          setShowKbdHints((v) => !v);
          break;
        case "z":
          e.preventDefault();
          onUndo();
          break;
        case "x":
          e.preventDefault();
          onRedo();
          break;
        case "e":
          e.preventDefault();
          onExport();
          break;
        case "-":
          setZoom((z) => Math.max(25, z - 25));
          break;
        case "=":
        case "+":
          setZoom((z) => Math.min(200, z + 25));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onUndo,
    onRedo,
    onExport,
    setShowUpload,
    setShowGallery,
    setShowTools,
    setShowKbdHints,
    setZoom,
  ]);
}
