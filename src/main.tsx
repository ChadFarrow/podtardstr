import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

// Initialize Bitcoin Connect
import { init } from '@getalby/bitcoin-connect';

import App from './App.tsx';
import './index.css';

// Custom font can be added here if needed:
// import '@fontsource-variable/<font-name>';

// Initialize Bitcoin Connect for Lightning payments
init({
  appName: 'Podtardstr',
});

createRoot(document.getElementById("root")!).render(<App />);
