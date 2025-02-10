import { useEffect, useRef } from 'react';

export function GridCanvas({
  isDragging,
  gridSpacing = 20,
  cutout,
  snapCoords,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Ensure the canvas covers the entire window.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ─── DRAW GRID LINES ──────────────────────────────────────
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // ─── ERASE THE BUTTON AREA (ROTATED CUTOUT) ──────────────
    if (cutout) {
      ctx.save();
      // Use destination-out to “cut out” the area.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'black';
      const { x, y, width, height, borderRadius = 0, angle = 0 } = cutout;
      // Translate to the center of the cutout (i.e. center of the component).
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.beginPath();
      if (borderRadius) {
        const w = width,
          h = height,
          r = borderRadius;
        ctx.moveTo(-w / 2 + r, -h / 2);
        ctx.lineTo(w / 2 - r, -h / 2);
        ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        ctx.lineTo(w / 2, h / 2 - r);
        ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        ctx.lineTo(-w / 2 + r, h / 2);
        ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        ctx.lineTo(-w / 2, -h / 2 + r);
        ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      } else {
        // Draw a simple rectangle.
        ctx.rect(-width / 2, -height / 2, width, height);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Restore to the default composite operation.
    ctx.globalCompositeOperation = 'source-over';

    // ─── DRAW SNAPPING GUIDELINES (ONLY WHILE DRAGGING) ───────
    if (isDragging && snapCoords) {
      const { x, y } = snapCoords;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      // Vertical guideline.
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      // Horizontal guideline.
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      ctx.restore();
    }

    // ─── DRAW BOUNDING RECTANGLE (ALWAYS VISIBLE) ──────────────
    if (cutout) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // Blue color.
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      // Use the axis-aligned bounding rectangle from cutout.
      ctx.strokeRect(cutout.x, cutout.y, cutout.width, cutout.height);
      ctx.restore();
    }
  }, [isDragging, gridSpacing, cutout, snapCoords]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none', // Allow mouse events to pass through.
        zIndex: 1000, // Ensures the canvas stays on top.
      }}
    />
  );
}
