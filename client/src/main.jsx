import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: { background: '#2D2D2D', color: '#FDF8F0', fontFamily: 'Inter, sans-serif' },
        success: { iconTheme: { primary: '#C2614F', secondary: '#FDF8F0' } },
      }}
    />
  </React.StrictMode>
);
