import React, { useEffect, useMemo, useRef } from 'react';

export function GridCanvas({ gridSpacing = 20, cutouts = [], isDragging }) {
  const canvasRef = useRef(null);

  // Preload the star mask image (an SVG with a black star that will be used as a mask)
  const starDataURL =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
         <path d="M50 15 L61 39 L88 39 L66 57 L75 84 L50 68 L25 84 L34 57 L12 39 L39 39 Z" fill="black"/>
       </svg>`
    );

  const starImage = useMemo(() => {
    const img = new Image();
    img.src = starDataURL;
    return img;
  }, [starDataURL]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Resize canvas to fill the viewport.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ─── DRAW GRID LINES (ONLY WHILE DRAGGING) ─────────────
    if (isDragging) {
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
    }

    // ─── CUTTING SHAPES LOGIC (LAST STEP) ─────────────
    // For each cutout reported by a draggable component, erase its shape using destination‐out.
    cutouts.forEach((cutout) => {
      const {
        centerX,
        centerY,
        width,
        height,
        borderRadius = 0,
        angle,
        shape,
      } = cutout;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'black';
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      if (shape === 'star') {
        // Use the preloaded star image as a mask.
        // Draw the image scaled to the cutout's width/height.
        if (starImage.complete) {
          ctx.drawImage(starImage, -width / 2, -height / 2, width, height);
        } else {
          console.log('1111');
          // If not loaded yet, you might add an onload callback to redraw.
        }
      } else {
        // Default: draw a rounded rectangle (if borderRadius > 0) or a simple rectangle.
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
          ctx.rect(-width / 2, -height / 2, width, height);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
    // End of cutting shapes logic.
  }, [gridSpacing, cutouts, isDragging, starImage]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
}
