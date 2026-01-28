interface Point {
    x: number;
    y: number;
  }
  
  export function drawShape(
    ctx: CanvasRenderingContext2D,
    from: Point,
    to: Point,
    shape: "rect" | "circle" | "handCircle" | "line",
    color: string,
    width: number,
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  
    const x = Math.min(from.x, to.x);
    const y = Math.min(from.y, to.y);
    const w = Math.abs(to.x - from.x);
    const h = Math.abs(to.y - from.y);
  
    ctx.beginPath();
  
    switch (shape) {
      case "rect":
        ctx.strokeRect(x, y, w, h);
        break;
  
      case "circle": {
        const r = Math.min(w, h) / 2;
        ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
  
      case "handCircle": {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const rx = w / 2;
        const ry = h / 2;
        const points = 60;
      
        // Randomize the starting angle for variety
        const startOffset = Math.random() * Math.PI * 2;
      
        // The main circle arc (slightly less than full)
        const mainArc = Math.PI * 2 - (Math.PI * (0.1 + Math.random() * 0.15));
      
        // Pre-generate smooth noise using a seed
        const seed = Math.random() * 1000;
        const getNoise = (angle: number) => {
          return (
            Math.sin(angle * 2.3 + seed) * 3 +
            Math.sin(angle * 1.1 + seed * 0.7) * 2 +
            Math.cos(angle * 3.7 + seed * 1.3) * 1.5
          );
        };
      
        // Slight overall rotation/tilt for natural feel
        const tilt = (Math.random() - 0.5) * 0.15;
      
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = width;
      
        // --- Draw the lead-in tail FIRST (extends past where circle ends) ---
        const tailLength = Math.PI * (0.2 + Math.random() * 0.25); // How far tail extends
        const tailPoints: { x: number; y: number }[] = [];
      
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const angle = startOffset - tailLength * (1 - t); // Goes backward from start
          const noise = getNoise(angle) * t; // Fade noise toward tip
          const squeeze = 1 + Math.sin(angle * 2 + seed) * 0.03;
      
          // Tail curves inward slightly
          const inward = (1 - t) * (rx * 0.15);
          const px = cx + (rx * squeeze - inward + noise) * Math.cos(angle + tilt);
          const py = cy + (ry / squeeze - inward + noise) * Math.sin(angle + tilt);
      
          tailPoints.push({ x: px, y: py });
        }
      
        // --- Generate main circle points ---
        const pathPoints: { x: number; y: number }[] = [];
      
        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const angle = startOffset + t * mainArc;
      
          const noise = getNoise(angle);
          const squeeze = 1 + Math.sin(angle * 2 + seed) * 0.03;
      
          const px = cx + (rx * squeeze + noise) * Math.cos(angle + tilt);
          const py = cy + (ry / squeeze + noise) * Math.sin(angle + tilt);
      
          pathPoints.push({ x: px, y: py });
        }
      
        // --- Draw complete path: tail + circle ---
        ctx.beginPath();

        // Start at tail tip
        const tailStart = tailPoints[0];
        if (tailStart) {
          ctx.moveTo(tailStart.x, tailStart.y);
        }

        // Draw tail with curves
        for (let i = 1; i < tailPoints.length; i++) {
          const pt = tailPoints[i];
          if (pt) ctx.lineTo(pt.x, pt.y);
        }

        // Continue into main circle with quadratic curves
        for (let i = 1; i < pathPoints.length - 1; i++) {
          const pt = pathPoints[i];
          const ptNext = pathPoints[i + 1];
          if (pt && ptNext) {
            const xc = (pt.x + ptNext.x) / 2;
            const yc = (pt.y + ptNext.y) / 2;
            ctx.quadraticCurveTo(pt.x, pt.y, xc, yc);
          }
        }

        const last = pathPoints[pathPoints.length - 1];
        if (last) {
          ctx.lineTo(last.x, last.y);
        }
      
        ctx.stroke();
      
        break;
      }
      case "line":
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        break;
    }
  }