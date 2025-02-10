import { useEffect, useRef, useState } from 'react';

export function DraggableButton({
  onDragStart,
  onDrag,
  onDragEnd,
  initialPosition = { x: 100, y: 100 },
}) {
  const [position, setPosition] = useState(initialPosition);
  // For demonstration, we use a fixed rotation of 45° (in radians).
  const [rotation] = useState(Math.PI / 4);
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  // Returns the component’s axis-aligned bounding rectangle plus rotation info.
  const getButtonRect = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      borderRadius: 20, // Must match the button’s styling.
      angle: rotation, // Rotation in radians.
    };
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = buttonRef.current.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
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
    // Snap the top‑left coordinate of the bounding rectangle to the grid.
    const gridSize = 20;
    const snappedX = Math.round(position.x / gridSize) * gridSize;
    const snappedY = Math.round(position.y / gridSize) * gridSize;
    setPosition({ x: snappedX, y: snappedY });
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
      ref={buttonRef}
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
