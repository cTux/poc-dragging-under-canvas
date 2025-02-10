import React, { useEffect, useRef, useState } from 'react';

/**
 * Props:
 * - onDragStart, onDrag, onDragEnd: Callbacks receiving the component’s cutout object.
 * - initialPosition: An object { x, y } specifying the initial container position.
 */
export function DraggableButton({
  onDragStart,
  onDrag,
  onDragEnd,
  initialPosition = { x: 100, y: 100 },
}) {
  const [position, setPosition] = useState(initialPosition);
  // For demonstration, use a fixed 45° rotation (in radians).
  const [rotation] = useState(Math.PI / 4);
  const [isDragging, setIsDragging] = useState(false);
  // Refs for the container and the button.
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  // Record the anchor corner ("top-left", "top-right", "bottom-left", "bottom-right")
  const anchorRef = useRef('top-left');

  // Returns the component’s cutout data (used by the overlay).
  // (The cutout is based on the untransformed button dimensions and the container’s center.)
  const getButtonRect = () => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = buttonRef.current.offsetWidth;
    const height = buttonRef.current.offsetHeight;
    const centerX = containerRect.left + width / 2;
    const centerY = containerRect.top + height / 2;
    return {
      centerX,
      centerY,
      width,
      height,
      borderRadius: 20,
      angle: rotation,
    };
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = buttonRef.current.offsetWidth;
    const height = buttonRef.current.offsetHeight;
    offsetRef.current = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    };
    // Determine which corner was grabbed based on the offset within the container.
    const horizontalAnchor = offsetRef.current.x < width / 2 ? 'left' : 'right';
    const verticalAnchor = offsetRef.current.y < height / 2 ? 'top' : 'bottom';
    anchorRef.current = `${verticalAnchor}-${horizontalAnchor}`; // e.g., "top-left"
    if (onDragStart) onDragStart(getButtonRect());
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - offsetRef.current.x;
    const newY = e.clientY - offsetRef.current.y;
    setPosition({ x: newX, y: newY });
    if (onDrag) onDrag(getButtonRect());
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    // Get the current container position and dimensions.
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = buttonRef.current.offsetWidth;
    const height = buttonRef.current.offsetHeight;
    const currentPos = { x: containerRect.left, y: containerRect.top };
    // Compute the center of the component.
    const centerX = containerRect.left + width / 2;
    const centerY = containerRect.top + height / 2;
    const angle = rotation;
    // Compute the rotated corner coordinates.
    // For a rectangle rotated about its center, each corner is computed by:
    // rotated_offset = (dx*cos(angle) - dy*sin(angle), dx*sin(angle) + dy*cos(angle))
    // where (dx, dy) is the vector from the center to the corner.
    const halfW = width / 2;
    const halfH = height / 2;
    const topLeft = {
      x: centerX + (-halfW * Math.cos(angle) - -halfH * Math.sin(angle)),
      y: centerY + (-halfW * Math.sin(angle) + -halfH * Math.cos(angle)),
    };
    const topRight = {
      x: centerX + (halfW * Math.cos(angle) - -halfH * Math.sin(angle)),
      y: centerY + (halfW * Math.sin(angle) + -halfH * Math.cos(angle)),
    };
    const bottomLeft = {
      x: centerX + (-halfW * Math.cos(angle) - halfH * Math.sin(angle)),
      y: centerY + (-halfW * Math.sin(angle) + halfH * Math.cos(angle)),
    };
    const bottomRight = {
      x: centerX + (halfW * Math.cos(angle) - halfH * Math.sin(angle)),
      y: centerY + (halfW * Math.sin(angle) + halfH * Math.cos(angle)),
    };

    // Select the current anchor corner based on where the user grabbed.
    let currentAnchor;
    switch (anchorRef.current) {
      case 'top-left':
        currentAnchor = topLeft;
        break;
      case 'top-right':
        currentAnchor = topRight;
        break;
      case 'bottom-left':
        currentAnchor = bottomLeft;
        break;
      case 'bottom-right':
        currentAnchor = bottomRight;
        break;
      default:
        currentAnchor = topLeft;
    }

    // Snap the chosen anchor corner to the grid.
    const gridSize = 20;
    const snappedAnchor = {
      x: Math.round(currentAnchor.x / gridSize) * gridSize,
      y: Math.round(currentAnchor.y / gridSize) * gridSize,
    };

    // Compute the delta between the snapped anchor and its current position.
    const deltaX = snappedAnchor.x - currentAnchor.x;
    const deltaY = snappedAnchor.y - currentAnchor.y;
    // Update the container's top-left position by adding this delta.
    const newPos = { x: currentPos.x + deltaX, y: currentPos.y + deltaY };
    setPosition(newPos);
    if (onDragEnd) onDragEnd(getButtonRect());
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: 'move',
        userSelect: 'none',
      }}
    >
      <button
        ref={buttonRef}
        style={{
          borderRadius: '20px',
          padding: '10px 20px',
          // Rotate the button about its center.
          transform: `rotate(${rotation}rad)`,
          transformOrigin: 'center center',
        }}
      >
        Drag me
      </button>
    </div>
  );
}
