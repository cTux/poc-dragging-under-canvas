import { CssBaseline } from '@mui/material';
import { useState } from 'react';

import { AppContainer } from '~/components/App/styles';
import { DraggableButton } from '~/components/DraggableButton';
import { GridCanvas } from '~/components/GridCanvas';

export const App = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [cutout, setCutout] = useState(null);
  const gridSpacing = 20;

  // Compute snapping coordinates based on the bounding rectangle’s top‑left corner.
  const snapCoords = cutout
    ? {
        x: Math.round(cutout.x / gridSpacing) * gridSpacing,
        y: Math.round(cutout.y / gridSpacing) * gridSpacing,
      }
    : null;

  return (
    <AppContainer id="app">
      <CssBaseline />
      <DraggableButton
        onDragStart={(rect) => {
          setCutout(rect);
          setIsDragging(true);
        }}
        onDrag={(rect) => setCutout(rect)}
        onDragEnd={(rect) => {
          setCutout(rect);
          setIsDragging(false);
        }}
      />
      <GridCanvas
        isDragging={isDragging}
        gridSpacing={gridSpacing}
        cutout={cutout}
        snapCoords={snapCoords}
      />
    </AppContainer>
  );
};
