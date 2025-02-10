import React, { useEffect, useRef } from 'react';

/**
 * Props:
 * - isDragging: Boolean; when true, snapping guidelines and the bounding rectangle are rendered.
 * - gridSpacing: The spacing (in pixels) for the grid lines.
 * - cutout: An object with properties:
 *      { centerX, centerY, width, height, borderRadius, angle }
 *   representing the component’s center (based on its untransformed size) and its rotation.
 * - snapCoords: An object { x, y } for drawing the red snapping guidelines.
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
    // Cover the full viewport.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ─── DRAW GRID LINES ─────────────────────────────
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

    // ─── DRAW THE DASHED, AXIS-ALIGNED BOUNDING RECTANGLE (ONLY WHILE DRAGGING) ─────────────
    if (cutout && isDragging) {
      // Compute the minimal axis-aligned bounding box (AABB) of the rotated component.
      const { centerX, centerY, width, height, angle } = cutout;
      const cosTheta = Math.abs(Math.cos(angle));
      const sinTheta = Math.abs(Math.sin(angle));
      const boundingWidth = width * cosTheta + height * sinTheta;
      const boundingHeight = width * sinTheta + height * cosTheta;
      const topLeftX = centerX - boundingWidth / 2;
      const topLeftY = centerY - boundingHeight / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(topLeftX, topLeftY, boundingWidth, boundingHeight);
      ctx.restore();
    }

    // ─── ERASE THE COMPONENT AREA (USING ROTATED CUTOUT) ─────────────
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
      // Set composite operation to "destination-out" to erase.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'black';
      // Translate to the component’s center and rotate.
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
        ctx.rect(-width / 2, -height / 2, width, height);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [isDragging, gridSpacing, cutout, snapCoords]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none', // Allow events to pass through.
        zIndex: 1000, // Keep canvas on top.
      }}
    />
  );
}
