import { CssBaseline } from '@mui/material';

import { AppPasted } from '~/components/App/pasted';
import { AppContainer } from '~/components/App/styles';

export const App = () => (
  <AppContainer id="app">
    <CssBaseline />
    <AppPasted />
  </AppContainer>
);
