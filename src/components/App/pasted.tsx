import React, { useState } from 'react';

import { DraggableButton } from '../DraggableButton';
import { DraggableSvg } from '../DraggableSVG';
import { GridCanvas } from '../GridCanvas';

export function AppPasted() {
  const gridSpacing = 20;

  // Define a list of draggable items.
  const draggables = [
    {
      id: 'button1',
      Component: DraggableButton,
      initialPosition: { x: 100, y: 100 },
    },
    {
      id: 'svg1',
      Component: DraggableSvg,
      initialPosition: { x: 200, y: 200 },
    },
    // You can add more draggable items here.
  ];

  // Maintain a state object mapping each component's id to its cutout data.
  const [cutouts, setCutouts] = useState({});
  // Maintain a state object mapping each component's id to its dragging status.
  const [dragging, setDragging] = useState({});

  // Callbacks for when a component starts dragging.
  const handleDragStart = (id, rect) => {
    setCutouts((prev) => ({ ...prev, [id]: rect }));
    setDragging((prev) => ({ ...prev, [id]: true }));
  };

  // Callback for when a component is dragged.
  const handleDrag = (id, rect) => {
    setCutouts((prev) => ({ ...prev, [id]: rect }));
  };

  // Callback for when a component ends dragging.
  const handleDragEnd = (id, rect) => {
    setCutouts((prev) => ({ ...prev, [id]: rect }));
    setDragging((prev) => ({ ...prev, [id]: false }));
  };

  // Overall dragging flag: true if at least one component is being dragged.
  const overallIsDragging = Object.values(dragging).some(Boolean);
  // Combine all cutout data into an array.
  const cutoutsArray = Object.values(cutouts);

  return (
    <div>
      {draggables.map(({ id, Component, initialPosition }) => (
        <Component
          key={id}
          initialPosition={initialPosition}
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
