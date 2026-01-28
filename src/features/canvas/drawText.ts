export interface TextBox {
  id: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  color: string;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  textBox: TextBox,
) {
  const { x, y, text, fontSize, fontWeight, color } = textBox;

  ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // Handle multi-line text
  const lines = text.split("\n");
  const lineHeight = fontSize * 1.2;

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

export function drawTextPreview(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  fontSize: number,
  fontWeight: "normal" | "bold",
  color: string,
) {
  ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // Draw with slight transparency for preview
  ctx.globalAlpha = 0.8;

  const lines = text.split("\n");
  const lineHeight = fontSize * 1.2;

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  ctx.globalAlpha = 1;
}

export function getTextBounds(
  ctx: CanvasRenderingContext2D,
  textBox: TextBox,
): { x: number; y: number; width: number; height: number } {
  const { x, y, text, fontSize, fontWeight } = textBox;

  ctx.font = `${fontWeight} ${fontSize}px sans-serif`;

  const lines = text.split("\n");
  const lineHeight = fontSize * 1.2;

  let maxWidth = 0;
  lines.forEach((line) => {
    const metrics = ctx.measureText(line);
    maxWidth = Math.max(maxWidth, metrics.width);
  });

  return {
    x,
    y,
    width: maxWidth,
    height: lines.length * lineHeight,
  };
}
