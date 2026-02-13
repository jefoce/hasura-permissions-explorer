import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import EmbeddedApp from './EmbeddedApp.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmbeddedApp />
  </StrictMode>
);
