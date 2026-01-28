import type { ImageData, ToolType } from "@/lib/types";

export const TOOL_LABELS: Record<ToolType, string> = {
  compress: "Resize & Compress",
  crop: "Crop & Transform",
  brush: "Brush & Stamp",
  text: "Text",
  arrow: "Arrow & Pointer",
  ai: "AI Tools",
  shapes: "Shapes",
  blur: "Blur & Redact",
};

export function formatImageSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatImageCount(count: number): string {
  return `${count} image${count === 1 ? "" : "s"}`;
}

export function formatToolLabel(tool: ToolType): string {
  return TOOL_LABELS[tool];
}

export function formatExportLabel(format: string): string {
  return `Export: ${format}`;
}

export function getImageMeta(image?: ImageData) {
  if (!image) return null;

  return {
    name: image.name,
    size: formatImageSize(image.size),
  };
}