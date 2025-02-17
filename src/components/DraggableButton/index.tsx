import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function DraggableButton({
  rotationAngle = Math.PI / 4,
  onDragStart,
  onDrag,
  onDragEnd,
  initialPosition = { x: 100, y: 100 },
}) {
  const [position, setPosition] = useState(initialPosition);
  // Use the rotationAngle prop as the rotation (in radians)
  const rotation = rotationAngle;
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Returns the cutout data for the button.
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
      shape: 'rect',
    };
  };

  // Report initial cutout data on mount
  useLayoutEffect(() => {
    if (onDrag) {
      onDrag(getButtonRect());
    }
  }, []); // Run once after mount

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
          transform: `rotate(${rotation}rad)`,
          transformOrigin: 'center center',
        }}
      >
        Drag me
      </button>
    </div>
  );
}
