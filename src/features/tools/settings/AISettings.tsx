import { useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import { Loader2, Wand2 } from "lucide-react";
import type { ToolSettings } from "@/lib/types";

interface AISettingsProps {
  settings: ToolSettings;
  onApplyImage: (blob: Blob) => void;
}

export function AISettings({
  settings: _settings,
  onApplyImage,
}: AISettingsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemoveBackground = async () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    setIsProcessing(true);

    try {
      // 1. Capture current canvas state
      const imageSource = canvas.toDataURL("image/png");

      // 2. Run background removal
      const blob = await removeBackground(imageSource, {
        progress: (status: string, progress: number) => {
          console.log(
            `AI [${status}]: ${Math.round(progress * 100)}%`,
          );
        },
      });

      // 3. Hand result back to AppShell (single source of truth)
      onApplyImage(blob);
    } catch (error) {
      console.error("AI Background Removal failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-theme-foreground">
        AI Tools
      </h3>

      <button
        onClick={handleRemoveBackground}
        disabled={isProcessing}
        className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          bg-linear-to-r
          from-violet-600
          to-indigo-600
          hover:from-violet-500
          hover:to-indigo-500
          text-white
          font-bold
          py-3
          rounded-lg
          shadow-md
          transition-all
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            Remove Background
          </>
        )}
      </button>
    </div>
  );
}
