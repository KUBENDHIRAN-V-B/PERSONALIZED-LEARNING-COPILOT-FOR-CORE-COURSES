import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress ResizeObserver loop error (benign warning from Recharts)
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  if (args[0]?.message?.includes('ResizeObserver loop') ||
      (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop'))) {
    return;
  }
  originalError.call(console, ...args);
};

console.warn = (...args: any[]) => {
  if (args[0]?.message?.includes('ResizeObserver loop') ||
      (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop'))) {
    return;
  }
  originalWarn.call(console, ...args);
};

window.addEventListener('error', (e) => {
  if (e.message?.includes('ResizeObserver loop')) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('ResizeObserver loop')) {
    e.preventDefault();
  }
});

// Override ResizeObserver to prevent loops
const originalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends originalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    const wrappedCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      try {
        callback(entries, observer);
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('ResizeObserver loop')) {
          throw error;
        }
      }
    };
    super(wrappedCallback);
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
