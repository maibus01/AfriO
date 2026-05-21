import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'

// 🔥 STATUS BAR SETUP (THIS IS THE KEY PART)
StatusBar.setOverlaysWebView({ overlay: true }) // content goes under status bar
StatusBar.setStyle({ style: Style.Dark }) // or Light depending on your UI

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