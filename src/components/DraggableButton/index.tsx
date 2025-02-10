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
  // Two refs: one for the container (which is absolutely positioned) and one for the button.
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Computes the component’s cutout data.
  const getButtonRect = () => {
    // Get the container's absolute position.
    const containerRect = containerRef.current.getBoundingClientRect();
    // Use the button’s offset dimensions (which are not affected by CSS transforms).
    const width = buttonRef.current.offsetWidth;
    const height = buttonRef.current.offsetHeight;
    // The center of the button.
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
    offsetRef.current = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    };
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
    setIsDragging(false);
    // Snap the rotated component’s center to the grid.
    const gridSize = 20;
    const rect = getButtonRect();
    const snappedCenterX = Math.round(rect.centerX / gridSize) * gridSize;
    const snappedCenterY = Math.round(rect.centerY / gridSize) * gridSize;
    // Adjust container position so that the button’s center is snapped.
    const newX = snappedCenterX - rect.width / 2;
    const newY = snappedCenterY - rect.height / 2;
    setPosition({ x: newX, y: newY });
    if (onDragEnd) onDragEnd(getButtonRect());
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
          // Rotate about the center.
          transform: `rotate(${rotation}rad)`,
          transformOrigin: 'center center',
        }}
      >
        Drag me
      </button>
    </div>
  );
}
