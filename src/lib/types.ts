export interface ImageData {
  id: number;
  file: File;
  url: string;
  name: string;
  size: number;
}

export interface ToolSettings {
  quality: number;
  keepAspect: boolean;
  width: number;
  height: number;
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  textColor: string;
  strokeWidth: number;
  strokeColor: string;
  arrowStyle: "single" | "double";
}

export type ToolType = "compress" | "crop" | "brush" | "text" | "arrow" | "ai" | "shapes";

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface ToolDefinition {
  id: ToolType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}
