// Fix for iframe environments where window.fetch has only a getter and crashes on reassignment
try {
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;
    let currentFetch = originalFetch;
    
    // Check if we can/need to redefine it
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!desc || desc.configurable) {
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get() {
          return currentFetch;
        },
        set(val) {
          currentFetch = val;
        }
      });
    }
  }
} catch (e) {
  console.warn('Could not patch window.fetch setter:', e);
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
