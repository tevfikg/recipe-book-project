import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: { background: '#2D2D2D', color: '#FDF8F0', fontFamily: 'Inter, sans-serif' },
        success: { iconTheme: { primary: '#C2614F', secondary: '#FDF8F0' } },
      }}
    />
  </StrictMode>,
)
