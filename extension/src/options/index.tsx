import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '../lib/theme-context';
import { AuthProvider } from '../lib/auth-context';
import { App } from './App';
import '../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
