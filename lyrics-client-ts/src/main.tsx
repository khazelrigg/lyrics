import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LyricsFull from './components/LyricsFull.tsx'
import { LyricsSettingsProvider } from './context/LyricsSettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <LyricsSettingsProvider>
    <App />
  </LyricsSettingsProvider>,

)
