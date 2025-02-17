import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function DraggableSvg({
  rotationAngle = Math.PI / 4,
  onDragStart,
  onDrag,
  onDragEnd,
  initialPosition = { x: 200, y: 200 },
}) {
  const [position, setPosition] = useState(initialPosition);
  // Use the rotationAngle prop for rotation.
  const rotation = rotationAngle;
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Return cutout data for the SVG using clientWidth/clientHeight.
  const getSvgRect = () => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const centerX = containerRect.left + width / 2;
    const centerY = containerRect.top + height / 2;
    return {
      centerX,
      centerY,
      width,
      height,
      borderRadius: 0,
      angle: rotation,
      shape: 'star',
    };
  };

  // Report initial cutout data on mount.
  useLayoutEffect(() => {
    if (onDrag) {
      onDrag(getSvgRect());
    }
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const containerRect = containerRef.current.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    };
    if (onDragStart) onDragStart(getSvgRect());
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - offsetRef.current.x;
    const newY = e.clientY - offsetRef.current.y;
    setPosition({ x: newX, y: newY });
    if (onDrag) onDrag(getSvgRect());
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    if (onDragEnd) onDragEnd(getSvgRect());
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
      <svg
        ref={svgRef}
        width="100"
        height="100"
        viewBox="0 0 100 100"
        style={{
          transform: `rotate(${rotation}rad)`,
          transformOrigin: 'center center',
        }}
      >
        <path
          d="M50 15 L61 39 L88 39 L66 57 L75 84 L50 68 L25 84 L34 57 L12 39 L39 39 Z"
          fill="orange"
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
