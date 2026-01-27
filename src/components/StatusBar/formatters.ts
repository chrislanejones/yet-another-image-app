import type { ImageData, ToolType } from "@/lib/types";

export function formatImageSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatImageCount(count: number): string {
  return `${count} image${count === 1 ? "" : "s"}`;
}

export function formatToolLabel(tool: ToolType): string {
  return `Tool: ${tool}`;
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