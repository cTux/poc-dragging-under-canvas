import React, { useEffect, useRef } from 'react';

/**
 * Props:
 * - isDragging: Boolean; when true, snapping guidelines are rendered.
 * - gridSpacing: The spacing (in pixels) for grid lines.
 * - cutout: An object with properties:
 *      { centerX, centerY, width, height, borderRadius, angle }
 *   representing the rotated component’s center, its untransformed dimensions,
 *   and its rotation (in radians).
 * - snapCoords: An object { x, y } for the snapped center (used to draw guidelines).
 */
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
    // Make the canvas cover the entire viewport.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ─── DRAW GRID LINES ─────────────────────────────
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

    // ─── ERASE THE COMPONENT AREA (USING ROTATED CUTOUT) ─────────────────────
    if (cutout) {
      const {
        centerX,
        centerY,
        width,
        height,
        borderRadius = 0,
        angle,
      } = cutout;
      ctx.save();
      // Use destination-out to remove the pixels.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'black';
      // Translate to the component’s center.
      ctx.translate(centerX, centerY);
      // Rotate to match the component’s rotation.
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
        // Draw a simple rectangle centered at (0,0).
        ctx.rect(-width / 2, -height / 2, width, height);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Restore composite operation.
    ctx.globalCompositeOperation = 'source-over';

    // ─── DRAW SNAPPING GUIDELINES (ONLY WHILE DRAGGING) ─────────────
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

    // ─── DRAW THE DASHED, AXIS-ALIGNED BOUNDING RECTANGLE ─────────────
    // This rectangle is the minimal AABB that encloses the rotated component.
    if (cutout) {
      const { centerX, centerY, width, height, angle } = cutout;
      // Compute the AABB dimensions.
      const cosTheta = Math.abs(Math.cos(angle));
      const sinTheta = Math.abs(Math.sin(angle));
      const boundingWidth = width * cosTheta + height * sinTheta;
      const boundingHeight = width * sinTheta + height * cosTheta;
      // The top-left coordinate of the AABB.
      const topLeftX = centerX - boundingWidth / 2;
      const topLeftY = centerY - boundingHeight / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // Blue dashed rectangle.
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(topLeftX, topLeftY, boundingWidth, boundingHeight);
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
        pointerEvents: 'none', // Let events pass through.
        zIndex: 1000, // Keep the canvas on top.
      }}
    />
  );
}
