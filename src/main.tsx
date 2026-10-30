import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { AppProvider } from './state/store';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </React.StrictMode>
  );
}
