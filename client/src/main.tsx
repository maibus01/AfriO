import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { App as CapApp } from '@capacitor/app'

// 🔥 Back button handling
CapApp.addListener('backButton', () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    const exit = confirm("Do you want to exit Luxee?")
    if (exit) {
      CapApp.exitApp()
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)