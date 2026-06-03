import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '../lib/auth-context';
import { App } from './App';
import '../styles/globals.css';
import './popup.css';

// Apply dark class based on OS preference; Day 5 adds a manual toggle
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
