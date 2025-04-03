/**
 * SQLite Visualizer - Frontend Entry Point
 * 
 * This file serves as the main entry point for the frontend application.
 * It renders the main application component into the DOM.
 */

import { render } from 'preact';
import { App } from '../src/App.tsx';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const appEl = document.getElementById('app');
  if (appEl) {
    render(<App />, appEl);
  } else {
    console.error('Could not find app element');
  }
});
