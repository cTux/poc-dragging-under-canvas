import React, { useState } from 'react';

import { DraggableButton } from '../DraggableButton';
import { DraggableSvg } from '../DraggableSVG';
import { GridCanvas } from '../GridCanvas';

export function AppPasted() {
  const gridSpacing = 20;

  // Define a list of draggable items with an optional rotationAngle.
  const draggables = [
    {
      id: 'button1',
      Component: DraggableButton,
      initialPosition: { x: 100, y: 100 },
      rotationAngle: Math.PI / 4, // 45° by default
    },
    {
      id: 'button2',
      Component: DraggableButton,
      initialPosition: { x: 200, y: 100 },
      rotationAngle: (Math.PI * 3) / 4, // 45° by default
    },
    {
      id: 'svg1',
      Component: DraggableSvg,
      initialPosition: { x: 200, y: 200 },
      rotationAngle: Math.PI / 6 + 8, // For example, 30°
    },
    {
      id: 'svg2',
      Component: DraggableSvg,
      initialPosition: { x: 100, y: 200 },
      rotationAngle: 0, // For example, 30°
    },
    {
      id: 'svg3',
      Component: DraggableSvg,
      initialPosition: { x: 300, y: 200 },
      rotationAngle: 0, // For example, 30°
    },
    {
      id: 'svg4',
      Component: DraggableSvg,
      initialPosition: { x: 400, y: 200 },
      rotationAngle: 0, // For example, 30°
    },
    {
      id: 'svg5',
      Component: DraggableSvg,
      initialPosition: { x: 500, y: 200 },
      rotationAngle: 0, // For example, 30°
    },
    {
      id: 'svg6',
      Component: DraggableSvg,
      initialPosition: { x: 600, y: 200 },
      rotationAngle: 0, // For example, 30°
    },
    {
      id: 'svg7',
      Component: DraggableSvg,
      initialPosition: { x: 100, y: 300 },
      rotationAngle: 0, // For example, 30°
    },
    {
      id: 'svg8',
      Component: DraggableSvg,
      initialPosition: { x: 200, y: 300 },
      rotationAngle: 0, // For example, 30°
    },
    {
      id: 'svg9',
      Component: DraggableSvg,
      initialPosition: { x: 300, y: 300 },
      rotationAngle: 0, // For example, 30°
    },
    {
      id: 'svg10',
      Component: DraggableSvg,
      initialPosition: { x: 400, y: 300 },
      rotationAngle: 0, // For example, 30°
    },
    // You can add more draggable items here.
  ];

  // State: mapping each component's id to its cutout data.
  const [cutouts, setCutouts] = useState({});
  // State: mapping each component's id to its dragging status.
  const [dragging, setDragging] = useState({});

  const handleDragStart = (id, rect) => {
    setCutouts((prev) => ({ ...prev, [id]: rect }));
    setDragging((prev) => ({ ...prev, [id]: true }));
  };

  const handleDrag = (id, rect) => {
    setCutouts((prev) => ({ ...prev, [id]: rect }));
  };

  const handleDragEnd = (id, rect) => {
    setCutouts((prev) => ({ ...prev, [id]: rect }));
    setDragging((prev) => ({ ...prev, [id]: false }));
  };

  const overallIsDragging = Object.values(dragging).some(Boolean);
  const cutoutsArray = Object.values(cutouts);

  return (
    <div>
      {draggables.map(({ id, Component, initialPosition, rotationAngle }) => (
        <Component
          key={id}
          initialPosition={initialPosition}
          rotationAngle={rotationAngle}
          onDragStart={(rect) => handleDragStart(id, rect)}
          onDrag={(rect) => handleDrag(id, rect)}
          onDragEnd={(rect) => handleDragEnd(id, rect)}
        />
      ))}
      <GridCanvas
        gridSpacing={gridSpacing}
        cutouts={cutoutsArray}
        isDragging={overallIsDragging}
      />
    </div>
  );
}
