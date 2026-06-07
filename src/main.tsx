// Redefine window.fetch and globalThis.fetch so they are writable and prevent TypeError in iframe/sandboxed environments where they are read-only getters.
try {
  const originalFetch = window.fetch || (typeof globalThis !== 'undefined' ? globalThis.fetch : null);
  if (originalFetch) {
    let fetchVal = originalFetch;
    Object.defineProperty(window, 'fetch', {
      get() { return fetchVal; },
      set(val) { fetchVal = val; },
      configurable: true,
      enumerable: true
    });
    if (typeof globalThis !== 'undefined' && globalThis !== window) {
      Object.defineProperty(globalThis, 'fetch', {
        get() { return fetchVal; },
        set(val) { fetchVal = val; },
        configurable: true,
        enumerable: true
      });
    }
  }
} catch (e) {
  console.warn("Failed to apply window.fetch getter/setter redefinition in main.tsx:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
